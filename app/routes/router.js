const Multipart = require('connect-multiparty');
const session = require('express-session');
const proxy = require('express-http-proxy');
const path = require('path');

const config = require('../libs/config');
const logger = require('../libs/logger');
const ctrl = require('../controller');
const util = require('../libs/util');

const { URL } = require('url');
const { createClient } = require('redis');
const { RedisStore } = require('connect-redis');
const client = createClient(config.getRedisConfig());

client.connect()
  .then(() => logger.info('Redis session store connected'))
  .catch((err) => logger.error('Redis session store connection error:', err));

client.on('error', (err) => {
  logger.error('Redis session store error:', err);
});

const redisStore = new RedisStore({
  client: client,
  prefix: 'qbitrace:sess:'
});

const multipartMiddleware = new Multipart();

const checkAuth = async function (req, res, next) {
  const pathname = req._parsedOriginalUrl.pathname;
  const excludePath = [
    '/api/user/login',
    '/user/login'
  ];
  if (req.session?.user && ['/', '/user/login'].includes(pathname)) {
    return res.redirect(302, '/index');
  }  if (excludePath.includes(pathname) ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/workbox') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/registerSW.js' ||
    pathname === '/sw.js') {
    return next();
  }
  if (!req.session?.user && !pathname.startsWith('/api')) {
    return res.redirect(302, '/user/login');
  }
  if (!req.session?.user) {
    res.status(401);
    return res.send({
      success: false,
      message: '鉴权失效, 请刷新页面后重新登录'
    });
  }
  next();
};

const setIp = function (req, res, next) {
  req.userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || '';
  if (req.userIp.substring(0, 7) === '::ffff:') {
    req.userIp = req.userIp.substring(7);
  }
  next();
};

const clientProxy = function (req, res, next) {
  const clientList = util.listClient();
  const clientId = req.params.client;
  const client = clientList.filter(item => item.id === clientId)[0];
  if (!client) {
    res.status(404);
    res.end('Not Found');
    return;
  }
  proxy(client.clientUrl, {
    // --- 新增开始 ---
    // 负责解析和拼接最终的代理路径
    proxyReqPathResolver: function(req) {
      // 1. 从目标URL (client.clientUrl) 中提取基础路径
      let basePath = '';
      try {
        // 例如，从 'http://example.com/api/v1' 中得到 '/api/v1'
        basePath = new URL(client.clientUrl).pathname.replace(/\/+$/, '');
      } catch (_) {} // 忽略无效URL的错误

      // 2. 获取当前请求的路径
      const tail = req.url || '/';

      // 3. 将基础路径和当前请求路径安全地拼接起来
      const pathToSend = basePath + (tail.startsWith('/') ? tail : `/${tail}`);
      
      // (可选) 可以在日志中打印实际路径，方便调试
      // logger.info(`[Proxy-Path] 实际代理路径: ${pathToSend}`);

      return pathToSend;
    },
    // --- 新增结束 ---

    proxyReqOptDecorator (proxyReqOpts, srcReq) {
      proxyReqOpts.headers.cookie = global.runningClient[clientId] ? global.runningClient[clientId].cookie || '' : '';
      if (proxyReqOpts.headers['content-type'] && proxyReqOpts.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1) {
        proxyReqOpts.headers['content-type'] = 'application/x-www-form-urlencoded';
      }
      proxyReqOpts.rejectUnauthorized = false;
      return proxyReqOpts;
    },
    reqBodyEncoding: null,
    limit: '20mb'
  })(req, res, next);
};

module.exports = function (app, express, router) {
  app.use(session({
    genid: () => util.uuid.v4().replace(/-/g, ''),
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: redisStore,
    secret: 'sses:xetrev',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30
    }
  }));
  app.use('/api', express.text({ type: 'text/xml' }));
  app.use('/api', express.json({ limit: '50mb' }));
  app.use('/api', express.urlencoded({ extended: false }));
  app.use('/api', multipartMiddleware);
  app.use(setIp);
  app.use(checkAuth);
  router.post('/user/login', ctrl.User.login);
  router.get('/user/logout', ctrl.User.logout);
  router.get('/user/get', ctrl.User.get);

  router.post('/notification/add', ctrl.Push.add);
  router.get('/notification/list', ctrl.Push.list);
  router.post('/notification/modify', ctrl.Push.modify);
  router.post('/notification/delete', ctrl.Push.delete);

  router.get('/downloader/list', ctrl.Client.list);
  router.get('/downloader/listTop10', ctrl.Client.listTop10);
  router.get('/downloader/listMainInfo', ctrl.Client.listMainInfo);
  router.get('/downloader/getLogs', ctrl.Client.getLogs);
  router.post('/downloader/add', ctrl.Client.add);
  router.post('/downloader/modify', ctrl.Client.modify);
  router.post('/downloader/delete', ctrl.Client.delete);

  router.get('/script/list', ctrl.Script.list);
  router.post('/script/add', ctrl.Script.add);
  router.post('/script/modify', ctrl.Script.modify);
  router.post('/script/delete', ctrl.Script.delete);
  router.post('/script/run', ctrl.Script.run);

  router.get('/rss/list', ctrl.Rss.list);
  router.post('/rss/add', ctrl.Rss.add);
  router.post('/rss/dryrun', ctrl.Rss.dryrun);
  router.post('/rss/modify', ctrl.Rss.modify);
  router.post('/rss/delete', ctrl.Rss.delete);
  router.post('/rss/deleteRecord', ctrl.Rss.deleteRecord);

  router.get('/deleteRule/list', ctrl.DeleteRule.list);
  router.post('/deleteRule/add', ctrl.DeleteRule.add);
  router.post('/deleteRule/modify', ctrl.DeleteRule.modify);
  router.post('/deleteRule/delete', ctrl.DeleteRule.delete);

  router.get('/rssRule/list', ctrl.RssRule.list);
  router.post('/rssRule/add', ctrl.RssRule.add);
  router.post('/rssRule/modify', ctrl.RssRule.modify);
  router.post('/rssRule/delete', ctrl.RssRule.delete);
  router.get('/torrent/list', ctrl.Torrent.list);
  router.get('/torrent/listHistory', ctrl.Torrent.listHistory);
  router.get('/torrent/info', ctrl.Torrent.info);
  router.get('/torrent/getBulkLinkList', ctrl.Torrent.getBulkLinkList);
  
  router.get('/analytics/getHistoricalData', ctrl.Analytics.getHistoricalData);
  router.get('/analytics/getSummary', ctrl.Analytics.getSummary);
  router.get('/analytics/getClients', ctrl.Analytics.getClients);
  router.get('/torrent/getDelInfo', ctrl.Torrent.getDelInfo);
  router.post('/torrent/deleteTorrent', ctrl.Torrent.deleteTorrent);

  router.get('/log/get', ctrl.Log.get);
  router.get('/log/clear', ctrl.Log.clear);

  router.get('/setting/get', ctrl.Setting.get);
  router.get('/setting/getRunInfo', ctrl.Setting.getRunInfo);
  router.get('/setting/getBackground.less', ctrl.Setting.getBackground);
  router.post('/setting/modify', ctrl.Setting.modify);
  router.get('/setting/backupqbitrace', ctrl.Setting.backupqbitrace);
  router.post('/setting/restoreqbitrace', ctrl.Setting.restoreqbitrace);
  router.get('/setting/getCss.css', ctrl.Setting.getCss);
  router.post('/setting/networkTest', ctrl.Setting.networkTest);
  router.get('/setting/getHosts', ctrl.Setting.getHosts);
  router.post('/setting/save', ctrl.Setting.save);
  router.get('/setting/export', ctrl.Setting.export);
  router.get('/setting/import', ctrl.Setting.import);
  router.get('/setting/getProxy', ctrl.Setting.getProxy);
  router.post('/setting/saveProxy', ctrl.Setting.saveProxy);

  app.use('/api', router);
  app.use('/proxy/client/:client', clientProxy);

  app.use((req, res, next) => {
    const pathname = req.path;
    if (pathname === '/favicon.ico') {
      res.status(404);
      return res.end('Not Found');
    }    // 处理静态资源文件
    if (pathname.startsWith('/assets') || 
        pathname.startsWith('/workbox') || 
        pathname === '/manifest.json' ||
        pathname === '/registerSW.js' ||
        pathname === '/sw.js') {
      const _path = path.join(__dirname, '../static', pathname);
      // 安全检查：确保请求的文件在 static 目录下
      if (!_path.startsWith(path.join(__dirname, '../static/'))) {
        res.status(404);
        return res.end('Not Found');
      }
      // 使用 sendFile 替代 download，更适合静态资源
      return res.sendFile(_path, (err) => {
        if (!err) return;
        logger.error(err);
        res.status(404);
        return res.end('Not Found');
      });
    }
    const uiPath = path.join(__dirname, '../static/index.html');
    res.sendFile(uiPath, (err) => {
      if (err) {
        logger.error('Error sending frontend app:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  });
};