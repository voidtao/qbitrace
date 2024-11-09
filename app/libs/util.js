const util = require('util');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const tar = require('tar');
const md5 = require('md5-node');
const CryptoJS = require('crypto-js');
const cron = require('node-cron');
const request = require('request');
const Database = require('better-sqlite3');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const url = require('url');
const { JSDOM } = require('jsdom');
const moment = require('moment');
const redlock = require('./redlock');

const logger = require('./logger');
const scrape = require('./scrape');

const db = new Database(path.join(__dirname, '../../storage/db/sql.db'));
puppeteer.use(StealthPlugin());

let browser;

const ttl = 15000;

for (const k of Object.keys(util)) {
  exports[k] = util[k];
}

exports.redlock = redlock;

exports.getRecords = async function (sql, options = []) {
  let _sql = sql;
  if (options) {
    options.forEach((item) => {
      _sql = _sql.replace(/\?/, item);
    });
  }
  logger.debug('Get Records:', _sql);
  return db.prepare(sql).all(...options);
};

exports.runRecord = async function (sql, options = []) {
  let _sql = sql;
  if (options) {
    options.forEach((item) => {
      _sql = _sql.replace(/\?/, item);
    });
  }
  logger.debug('Run Record:', _sql);
  return db.prepare(sql).run(...options);
};

exports.getRecord = async function (sql, options = []) {
  let _sql = sql;
  if (options) {
    options.forEach((item) => {
      _sql = _sql.replace(/\?/, item);
    });
  }
  logger.debug('Get Record:', _sql);
  return db.prepare(sql).get(...options);
};

const _importJson = function (path) {
  const jsonString = fs.readFileSync(path, { encoding: 'utf-8' });
  return JSON.parse(jsonString);
};

exports.scrapeFree = scrape.free;
exports.scrapeHr = scrape.hr;

exports._requestPromise = util.promisify(request);
exports.requestPromise = async function (_options, usePuppeteer = true) {
  let options;
  if (typeof _options === 'string') {
    options = {
      url: _options
    };
  } else {
    options = { ..._options };
  }
  if (!options.headers) {
    options.headers = {};
  };
  options.headers['User-Agent'] = global.userAgent || 'qbitrace';
  if (!options.timeout) {
    options.timeout = 120000;
  }
  if (global.proxy) {
    const host = new URL(options.url).host;
    if (global.domains.split('\n').indexOf(host) !== -1) {
      options.proxy = global.proxy;
    }
  }
  if (global.trustAllCerts) {
    options.rejectUnauthorized = !global.trustAllCerts;
  }
  const res = await exports._requestPromise(options);
  if (usePuppeteer && res.body && typeof res.body === 'string' && (res.body.indexOf('trk_jschal_js') !== -1 || res.body.indexOf('jschl-answer') !== -1 || (res.body.indexOf('cloudflare-static') !== -1 && res.body.indexOf('email-decode.min.js') === -1))) {
    logger.info(new url.URL(options.url).hostname, '疑似遇到 5s 盾, 启用 Puppeteer 抓取页面....');
    return await exports.requestUsePuppeteer(options);
  }
  return res;
};

exports.requestUsePuppeteer = async function (options) {
  const lock = await exports.redlock.lock('qbitrace:puppeteer', ttl);
  logger.debug('locked');
  try {
    if (!browser || browser.process().exitCode === 0) {
      browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: [
          '--no-sandbox'
        ],
        headless: false
      });
    }
    lock.unlock();
    logger.debug('unlocked');
  } catch (e) {
    logger.error(e);
    lock.unlock();
    logger.debug('unlocked');
  }
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 800, height: 600 });
    await page.setUserAgent(options.headers['User-Agent']);
    if (options.headers.cookie) {
      const cookieList = options.headers.cookie.split(';').map(i => i.trim())
        .filter(i => i !== '')
        .map(i => {
          return {
            name: i.split('=')[0],
            value: i.split('=')[1],
            domain: new url.URL(options.url).hostname
          };
        });
      if (cookieList.length !== 0) await page.setCookie(...cookieList);
    }
    await page.goto(options.url, {});
    await page.waitForTimeout(30000);
    const body = await page.content();
    await page.close();
    if ((await browser.pages()).length === 1) {
      logger.info('关闭 Puppeteer....');
      await browser.close();
    }
    return {
      body
    };
  } catch (e) {
    logger.error('Puppeteer 报错:\n', e);
    await page.close();
    if ((await browser.pages()).length === 1) {
      logger.info('关闭 Puppeteer....');
      await browser.close();
    }
    return {
      body: ''
    };
  }
};

exports.exec = util.promisify(require('child_process').exec);
exports.uuid = uuid;
exports.md5 = md5;
exports.tar = tar;



exports.scrapeEpisodeByFilename = function (_filename, ignoreKeys = '') {
  let filename = _filename
    .replace(/【/g, '[')
    .replace(/】/g, ']');
  ignoreKeys.split(',').forEach((item) => { filename = filename.replace(new RegExp(item, 'gi'), ''); });
  let episode = +(filename.match(/[Ee][Pp]?(\d+)[. ]+/) || [])[1];
  if (!episode) {
    episode = +(filename.match(/\[(\d+)[Vv]?\d?\]/) || [])[1];
  }
  if (!episode) {
    episode = +(filename.match(/第(\d+)[话話集]/) || [])[1];
  }
  if (!episode) {
    const episodes = filename
      .replace(/((mp)|(MP)|(Mp))4/g, '')
      .replace(/\d+[KkFfPpi年月日期季]+/g, '')
      .replace(/\d+\.\d+/g, '')
      .replace(/[xXHh]26[45]/g, '')
      .replace(/[Ss]\d+/g, '')
      .replace(/((1st)|(2nd)|(3rd))/g, '')
      .replace(/\[[.\dA-Za-z_-]*\]/g, '')
      .replace(/\d+[MmBbGg]/g, '')
      .replace(/\d*[Xx]\d+/g, '')
      .match(/\d+/g)
      ?.map(item => +item.match(/\d+/))
      .filter(item => [0, 480, 720, 1080, 576, 2160, 1920].indexOf(item) === -1) || [];
    if (episodes.length === 1) {
      episode = episodes[0];
    }
  };
  return episode;
};

exports.listPush = function () {
  const files = fs.readdirSync(path.join(__dirname, '../../storage/data/push'));
  const list = [];
  for (const file of files) {
    if (path.extname(file) === '.json') {
      list.push(_importJson(path.join(__dirname, '../../storage/data/push', file)));
    }
  }
  return list;
};

exports.listClient = function () {
  const files = fs.readdirSync(path.join(__dirname, '../../storage/data/client'));
  const clientList = [];
  for (const file of files) {
    if (path.extname(file) === '.json') {
      clientList.push(_importJson(path.join(__dirname, '../../storage/data/client', file)));
    }
  }
  return clientList;
};

exports.listRss = function () {
  const files = fs.readdirSync(path.join(__dirname, '../../storage/data/rss'));
  const rssList = [];
  for (const file of files) {
    if (path.extname(file) === '.json') {
      const rss = _importJson(path.join(__dirname, '../../storage/data/rss', file));
      if (rss.rssUrl && !rss.rssUrls) {
        rss.rssUrls = [rss.rssUrl];
      }
      rssList.push(rss);
    }
  }
  return rssList;
};

exports.listDeleteRule = function () {
  const files = fs.readdirSync(path.join(__dirname, '../../storage/data/rule/delete'));
  const deleteRuleList = [];
  for (const file of files) {
    if (path.extname(file) === '.json') {
      deleteRuleList.push(_importJson(path.join(__dirname, '../../storage/data/rule/delete', file)));
    }
  }
  return deleteRuleList;
};

exports.listRssRule = function () {
  const files = fs.readdirSync(path.join(__dirname, '../../storage/data/rule/rss'));
  const rssRuleList = [];
  for (const file of files) {
    if (path.extname(file) === '.json') {
      rssRuleList.push(_importJson(path.join(__dirname, '../../storage/data/rule/rss', file)));
    }
  }
  return rssRuleList;
};

exports.listCrontabJavaScript = function () {
  const files = fs.readdirSync(path.join(__dirname, '../../storage/data/script'));
  const scriptList = [];
  for (const file of files) {
    if (path.extname(file) === '.json') {
      scriptList.push(_importJson(path.join(__dirname, '../../storage/data/script', file)));
    }
  }
  return scriptList;
};

exports.getLinkMapping = function () {
  return _importJson(path.join(__dirname, '../../storage/data/link-mapping.json'));
};

exports.saveLinkMapping = function () {
  const mappingPath = path.join(__dirname, '../../storage/data/link-mapping.json');
  return fs.writeFileSync(mappingPath, JSON.stringify(global.linkMapping, null, 2));
};

exports.formatSize = function (size) {
  if (size < 1024) {
    return `${size.toFixed(2)} Byte`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KiB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MiB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024 / 1024).toFixed(3)} GiB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(3)} TiB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(3)} PiB`;
  }
};

exports.calSize = function (size, unit) {
  const unitMap = {
    KiB: 1024,
    MiB: 1024 * 1024,
    GiB: 1024 * 1024 * 1024,
    TiB: 1024 * 1024 * 1024 * 1024,
    PiB: 1024 * 1024 * 1024 * 1024 * 1024
  };
  return +size * (unitMap[unit] || 1);
};

exports.formatTime = function (ms) {
  const d = parseInt(ms / (24 * 3600 * 1000));
  const h = parseInt(ms / (3600 * 1000) % 24);
  const m = parseInt(ms / (60 * 1000) % 60);
  const s = parseInt(ms / (1000) % 60);
  const ss = parseInt(ms % 1000);
  let str = '';
  if (d) {
    str += `${d < 10 ? '0' + d : d}:`;
  }
  if (h) {
    str += `${h < 10 ? '0' + h : h}:`;
  }
  if (m) {
    str += `${m < 10 ? '0' + m : m}:`;
  }
  if (s) {
    str += `${s < 10 ? '0' + s : s}:`;
  }
  str += `${ss < 10 ? '00' + ss : ss < 100 ? '0' + ss : ss}`;
  return str;
};

exports.sleep = function (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve('ping');
    }, time);
  });
};

exports.randomColor = function () {
  return '#' + (new Array(6)).fill(1).map(() => '0123456789abcdef'[parseInt(Math.random() * 15)]).join('');
};