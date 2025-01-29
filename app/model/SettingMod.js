const fs = require('fs');
const path = require('path');
const moment = require('moment');
const util = require('../libs/util');
const redis = require('../libs/redis');
const Push = require('../common/Push');
const otp = require('../libs/otp');

const settingPath = path.join(__dirname, '../../storage/data/setting.json');
const proxyPath = path.join(__dirname, '../../storage/data/setting/proxy.json');
const torrentHistorySettingPath = path.join(__dirname, '../../storage/data/setting/torrent-history-setting.json');
const torrentMixSettingPath = path.join(__dirname, '../../storage/data/setting/torrent-mix-setting.json');
const torrentPushSettingPath = path.join(__dirname, '../../storage/data/setting/torrent-push-setting.json');

class SettingMod {
  get () {
    const settingStr = fs.readFileSync(settingPath, { encoding: 'utf-8' });
    return { time: moment().unix(), ...JSON.parse(settingStr), password: '' };
  };

  getBackground () {
    return `@vt-bg-image: url('${global.background}');`;
  };

  getCss () {
    const settingStr = fs.readFileSync(settingPath, { encoding: 'utf-8' });
    return JSON.parse(settingStr).cssStyle || '';
  };

  modify (_options) {
    if (_options.password === '') {
      delete _options.password;
    }
    if (_options.otp && _options.otpPw && _options.otp !== '******') {
      if (otp.verify(_options.otp, _options.otpPw)) {
        global.auth.otp = _options.otp;
      } else {
        throw new Error('二步验证码错误');
      }
    } else {
      delete _options.otp;
    }
    delete _options.otpPw;
    delete _options.time;
    const options = Object.assign(JSON.parse(fs.readFileSync(settingPath, { encoding: 'utf-8' })), _options);
    fs.writeFileSync(settingPath, JSON.stringify(options, null, 2));
    global.auth = {
      username: options.username,
      password: options.password,
      otp: global.auth.otp
    };
    global.webhookPushTo = options.webhookPushTo;
    global.menu = options.menu || [];
    global.dashboardContent = options.dashboardContent || [];
    global.userAgent = options.userAgent;
    global.ignoreError = options.ignoreError;
    global.ignoreDependCheck = options.ignoreDependCheck;
    global.theme = options.theme;
    global.siteInfo = options.siteInfo;
    global.trustAllCerts = options.trustAllCerts;
    global.background = options.background;
    global.dataPath = options.dataPath || '/';
    global.wechatCover = options.wechatCover;
    global.wechatToken = options.wechatToken;
    global.wechatAesKey = options.wechatAesKey;
    global.telegramProxy = options.telegramProxy || 'https://api.telegram.org';
    global.wechatProxy = options.wechatProxy;
    const webhookPush = util.listPush().filter(item => item.id === global.webhookPushTo)[0];
    if (webhookPush) {
      global.webhookPush = new Push({ ...webhookPush, push: true });
    }
    return '修改全局设置成功, 部分设定需要刷新页面生效';
  };

  getTorrentHistorySetting () {
    const settingStr = fs.readFileSync(torrentHistorySettingPath, { encoding: 'utf-8' });
    return JSON.parse(settingStr);
  };

  modifyTorrentHistorySetting (options) {
    fs.writeFileSync(torrentHistorySettingPath, JSON.stringify(options, null, 2));
    return '修改成功';
  };

  getTorrentMixSetting () {
    const settingStr = fs.readFileSync(torrentMixSettingPath, { encoding: 'utf-8' });
    return JSON.parse(settingStr);
  };

  modifyTorrentMixSetting (options) {
    fs.writeFileSync(torrentMixSettingPath, JSON.stringify(options, null, 2));
    return '修改成功';
  };

  getTorrentPushSetting () {
    const settingStr = fs.readFileSync(torrentPushSettingPath, { encoding: 'utf-8' });
    return JSON.parse(settingStr);
  };

  modifyTorrentPushSetting (options) {
    fs.writeFileSync(torrentPushSettingPath, JSON.stringify(options, null, 2));
    return '修改成功';
  };

  async getRunInfo () {
    const { uploaded, downloaded } = (await util.getRecord('select sum(uploaded) as uploaded, sum(downloaded) as downloaded from torrent_d'));
    const addCountToday = (await util.getRecord('select count(*) as addCount from torrent_r where record_type = 1 and record_time > ?', [moment().startOf('day').unix()])).addCount;
    const rejectCountToday = (await util.getRecord('select count(*) as rejectCount from torrent_r where record_type = 2 and record_time > ?', [moment().startOf('day').unix()])).rejectCount;
    const deleteCountToday = (await util.getRecord('select count(*) as deleteCount from torrent_d where delete_time > ?', [moment().startOf('day').unix()])).deleteCount;
    const addCount = (await util.getRecord('select count(*) as addCount from torrent_r where record_type = 1')).addCount;
    const rejectCount = (await util.getRecord('select count(*) as rejectCount from torrent_r where record_type = 2')).rejectCount;
    const deleteCount = (await util.getRecord('select count(*) as deleteCount from torrent_d')).deleteCount;
    const errors = global.ignoreError ? [] : JSON.parse(await redis.get('qbitrace:error:list') || '[]');
    await redis.set('qbitrace:error:list', '[]');
    return {
      dashboardContent: global.dashboardContent,
      uploaded: uploaded || 0,
      downloaded: downloaded || 0,
      addCount,
      rejectCount,
      deleteCount,
      addCountToday,
      rejectCountToday,
      deleteCountToday,
      startTime: global.startTime,
      errors
    };
  };

  async backupqbitrace (options) {
    const backupsFile = `/tmp/qbitrace-backups-${moment().format('YYYY-MM-DD_HH:mm:ss')}.tar.gz`;
    const backupsFileds = ['db', 'data'];

    if (options.bt + '' === 'true') {
      backupsFileds.push('torrents');
    }
    await util.tar.c({
      gzip: true,
      file: backupsFile,
      cwd: path.join(__dirname, '../../storage')
    }, backupsFileds);
    return backupsFile;
  }

  async restoreqbitrace (options) {
    const backupsFile = options.file.path || options.file.originalFilename;
    await util.tar.x({
      gzip: true,
      file: backupsFile,
      C: path.join(__dirname, '../../storage'),
      '--overwrite': true
    });
    return '数据导入成功, 重启容器后生效。';
  }

  async networkTest (options) {
    return await util.requestPromise({
      url: options.address,
      headers: {
        cookie: options.cookie
      }
    });
  }

  getHosts () {
    const hosts = fs.readFileSync('/etc/hosts', { encoding: 'utf-8' });
    return hosts;
  };

  save (options) {
    fs.writeFileSync('/etc/hosts', options.hosts);
    fs.copyFileSync('/etc/hosts', path.join(__dirname, '../../storage/data/hosts'));
    return '保存成功';
  };

  import () {
    fs.copyFileSync(path.join(__dirname, '../../storage/data/hosts'), '/etc/hosts');
    return '导入成功';
  };

  export () {
    fs.copyFileSync('/etc/hosts', path.join(__dirname, '../../storage/data/hosts'));
    return '导出成功';
  };

  getProxy () {
    const settingStr = fs.readFileSync(proxyPath, { encoding: 'utf-8' });
    return JSON.parse(settingStr);
  };

  saveProxy (options) {
    fs.writeFileSync(proxyPath, JSON.stringify({ proxy: options.proxy || '', domains: options.domains || '' }, null, 2));
    global.proxy = options.proxy || '';
    global.domains = options.domains || '';
    return '保存成功';
  };
}

module.exports = SettingMod;
