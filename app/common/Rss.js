const rss = require('../libs/rss');
const util = require('../libs/util');
const logger = require('../libs/logger');
const redis = require('../libs/redis');
const cron = require('node-cron');
const bencode = require('bencode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Push = require('./Push');

class Rss {
  constructor (rss) {
    this._rss = rss;
    this.id = rss.id;
    this.maxSleepTime = rss.maxSleepTime;
    this.lastRssTime = 0;
    this.alias = rss.alias;
    this.urls = rss.rssUrls;
    this.clientArr = rss.clientArr || [rss.client];
    this.clientSortBy = rss.clientSortBy;
    this.onlyReseed = rss.onlyReseed;
    this.reseedClients = rss.reseedClients;
    this.pushMessage = rss.pushMessage;
    this.skipSameTorrent = rss.skipSameTorrent;
    this.scrapeFree = rss.scrapeFree;
    this.scrapeHr = rss.scrapeHr;
    this.sleepTime = rss.sleepTime;
    this.cookie = rss.cookie;
    this.savePath = rss.savePath;
    this.category = rss.category;
    this.paused = rss.paused;
    this.autoTMM = rss.autoTMM;
    this.useCustomRegex = rss.useCustomRegex;
    this.regexStr = rss.regexStr;
    this.replaceStr = rss.replaceStr;
    this.addCountPerHour = +rss.addCountPerHour || 20;
    this.addCount = 0;
    this.pushTorrentFile = rss.pushTorrentFile;
    this.notify = util.listPush().filter(item => item.id === rss.notify)[0] || {};
    this.notify.push = rss.pushNotify;
    this.notify.dryrun = rss.dryrun;
    this.ntf = new Push(this.notify);
    this._acceptRules = rss.acceptRules || [];
    this._rejectRules = rss.rejectRules || [];
    this.acceptRules = util.listRssRule().filter(item => (this._acceptRules.indexOf(item.id) !== -1)).sort((a, b) => +b.priority - +a.priority);
    this.rejectRules = util.listRssRule().filter(item => (this._rejectRules.indexOf(item.id) !== -1)).sort((a, b) => +b.priority - +a.priority);
    this.downloadLimit = util.calSize(rss.downloadLimit, rss.downloadLimitUnit);
    this.uploadLimit = util.calSize(rss.uploadLimit, rss.uploadLimitUnit);
    this.maxClientUploadSpeed = util.calSize(rss.maxClientUploadSpeed, rss.maxClientUploadSpeedUnit);
    this.maxClientDownloadSpeed = util.calSize(rss.maxClientDownloadSpeed, rss.maxClientDownloadSpeedUnit);
    this.maxClientDownloadCount = +rss.maxClientDownloadCount;
    if (!rss.dryrun) {
      this.rssJob = cron.schedule(rss.cron, async () => { try { await this.rss(); } catch (e) { logger.error(this.alias, e); } });
      this.clearCount = cron.schedule('0 * * * *', () => { this.addCount = 0; });
      logger.info('Rss 任务', this.alias, '初始化完毕');
    }
  }

  _all (str, keys) {
    if (!keys || keys.length === 0) return true;
    for (const key of keys) {
      if (str.indexOf(key) === -1) return false;
    }
    return true;
  };

  _sum (arr) {
    let sum = 0;
    for (const item of arr) {
      sum += item;
    }
    return sum;
  }

  _getSum (a, b) {
    return a + b;
  };

  async _downloadTorrent (url, _hash) {
    const torrentPath = path.join(__dirname, '../../storage/torrents', _hash + '.torrent');
    logger.info(`Checking for ${_hash} at ${torrentPath}`);
    if (_hash && fs.existsSync(torrentPath)) {
      logger.info(`使用已下载的种子文件: ${_hash}`);
      return { hash: _hash, filepath: torrentPath };
    }
    const res = await util.requestPromise({
      url: url,
      method: 'GET',
      encoding: null,
      headers: {
        cookie: this.cookie
      }
    });
    const buffer = Buffer.from(res.body, 'utf-8');
    const torrent = bencode.decode(buffer);
    const size = torrent.info.length || torrent.info.files.map(i => i.length).reduce(this._getSum, 0);
    const hash = crypto.createHash('sha1').update(bencode.encode(torrent.info)).digest('hex');
    const filepath = path.join(__dirname, '../../storage/torrents', hash + '.torrent');
    fs.writeFileSync(filepath, buffer);
    return {
      filepath,
      hash,
      size,
      name: torrent.info.name.toString()
    };
  };

  _fitConditions (_torrent, conditions) {
    let fit = true;
    const torrent = { ..._torrent };
    torrent.description = torrent.description || '';
    for (const condition of conditions) {
      let value;
      switch (condition.compareType) {
      case 'equals':
        fit = fit && (torrent[condition.key] === condition.value || torrent[condition.key] === +condition.value);
        break;
      case 'bigger':
        value = 1;
        condition.value.split('*').forEach(item => {
          value *= +item;
        });
        fit = fit && torrent[condition.key] > value;
        break;
      case 'smaller':
        value = 1;
        condition.value.split('*').forEach(item => {
          value *= +item;
        });
        fit = fit && torrent[condition.key] < value;
        break;
      case 'contain':
        fit = fit && condition.value.split(',').filter(item => torrent[condition.key].indexOf(item) !== -1).length !== 0;
        break;
      case 'includeIn':
        fit = fit && condition.value.split(',').indexOf(torrent[condition.key]) !== -1;
        break;
      case 'notContain':
        fit = fit && condition.value.split(',').filter(item => torrent[condition.key].indexOf(item) !== -1).length === 0;
        break;
      case 'notIncludeIn':
        fit = fit && condition.value.split(',').indexOf(torrent[condition.key]) === -1;
        break;
      case 'regExp':
        fit = fit && (torrent[condition.key] + '').match(new RegExp(condition.value, 'ig'));
        break;
      case 'notRegExp':
        fit = fit && !(torrent[condition.key] + '').match(new RegExp(condition.value, 'ig'));
        break;
      }
    }
    return fit;
  }

  _fitRule (_rule, _torrent) {
    const rule = { ..._rule };
    const torrent = { ..._torrent };
    if (rule.type === 'javascript') {
      try {
        // eslint-disable-next-line no-eval
        return (eval(rule.code))(torrent);
      } catch (e) {
        logger.error(this.alias, 'Rss 规则', rule.alias, '存在语法错误\n', e);
        return false;
      }
    } else {
      try {
        return rule.conditions.length !== 0 && this._fitConditions(torrent, rule.conditions);
      } catch (e) {
        logger.error(this.alias, 'Rss 规则', rule.alias, '遇到错误\n', e);
        return false;
      }
    }
  }

  destroy () {
    logger.info('销毁 Rss 实例:', this.alias);
    this.rssJob.stop();
    delete this.rssJob;
    this.clearCount.stop();
    delete this.clearCount;
    delete global.runningRss[this.id];
  }

  reloadRssRule () {
    logger.info('重新载入 Rss 规则', this.alias);
    this.acceptRules = util.listRssRule().filter(item => (this._acceptRules.indexOf(item.id) !== -1));
    this.rejectRules = util.listRssRule().filter(item => (this._rejectRules.indexOf(item.id) !== -1));
  }

  reloadPush () {
    logger.info('Rss', this.alias, '重新载入推送方式');
    this.notify = util.listPush().filter(item => item.id === this._rss.notify)[0] || {};
    this.notify.push = this._rss.pushNotify;
    this.ntf = new Push(this.notify);
  }

  async _pushTorrent (torrent, _client) {
    if (!this.onlyReseed) {
      let speed;
      if (_client.sameServerClients) {
        speed = {
          uploadSpeed: this._sum(_client.sameServerClients.map(index => global.runningClient[index]?.maindata?.uploadSpeed || 0)),
          downloadSpeed: this._sum(_client.sameServerClients.map(index => global.runningClient[index]?.maindata?.downloadSpeed || 0))
        };
      } else {
        speed = {
          uploadSpeed: _client.avgUploadSpeed,
          downloadSpeed: _client.avgDownloadSpeed
        };
      }
      if (_client.maxUploadSpeed && speed.uploadSpeed > _client.maxUploadSpeed) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 超过下载器最大上传速度 ${util.formatSize(speed.uploadSpeed)}/s`]);
        await this.ntf.rejectTorrent(this._rss, _client, torrent, `拒绝原因: 超过下载器最大上传速度 ${util.formatSize(speed.uploadSpeed)}/s`);
        return;
      }
      if (_client.maxDownloadSpeed && speed.downloadSpeed > _client.maxDownloadSpeed) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 超过下载器最大下载速度 ${util.formatSize(speed.downloadSpeed)}/s`]);
        await this.ntf.rejectTorrent(this._rss, _client, torrent, `拒绝原因: 超过下载器最大下载速度 ${util.formatSize(speed.downloadSpeed)}/s`);
        return;
      }
      const leechNum = _client.maindata.leechingCount;
      if (_client.maxLeechNum && leechNum >= _client.maxLeechNum) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 超过下载器最大下载数量 ${leechNum}`]);
        await this.ntf.rejectTorrent(this._rss, _client, torrent, `拒绝原因: 超过下载器最大下载数量 ${leechNum}`);
        return;
      }
      if (_client.minFreeSpace && _client.maindata.freeSpaceOnDisk <= _client.minFreeSpace) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 低于下载器最小剩余空间 ${util.formatSize(_client.maindata.freeSpaceOnDisk)}`]);
        await this.ntf.rejectTorrent(this._rss, _client, torrent, `拒绝原因: 低于下载器最小剩余空间 ${util.formatSize(_client.maindata.freeSpaceOnDisk)}`);
        return;
      }
      const fitRules = this.acceptRules.filter(item => this._fitRule(item, torrent));
      if (fitRules.length === 0 && this.acceptRules.length !== 0) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: 不符合所有规则']);
        await this.ntf.rejectTorrent(this._rss, _client, torrent, '拒绝原因: 不符合所有规则');
        return;
      }
      if (this.scrapeFree) {
        try {
          if (!await util.scrapeFree(torrent.link, this.cookie)) {
            const isScraped = await redis.get(`qbitrace:scrape:free:${torrent.hash}`);
            if (this.sleepTime && (moment().unix() - +this.sleepTime) < torrent.pubTime && !isScraped) {
              logger.info(this.alias, '已设置等待时间', this.sleepTime, ', ', torrent.name, '发布时间为', moment(torrent.pubTime * 1000).format('YYYY-MM-DD HH:mm:ss'), ', 跳过');
              await redis.setWithExpire(`qbitrace:scrape:free:${torrent.hash}`, '7777', 3600 * 4);
            } else {
              await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: 非免费种']);
            }
            await this.ntf.rejectTorrent(this._rss, _client, torrent, '拒绝原因: 非免费种');
            return;
          }
        } catch (e) {
          logger.error(this.alias, '抓取免费种子失败: ', e.message);
          await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 抓取免费种子失败 ${e.message}`]);
          await this.ntf.scrapeError(this._rss, torrent);
          return;
        }
      }
      if (this.scrapeHr) {
        try {
          if (await util.scrapeHr(torrent.link, this.cookie)) {
            await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: HR']);
            await this.ntf.rejectTorrent(this._rss, _client, torrent, '拒绝原因: HR');
            return;
          }
        } catch (e) {
          logger.error(this.alias, '抓取 HR 种子失败: ', e.message);
          await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 抓取 HR 种子失败 ${e.message}`]);
          await this.ntf.scrapeError(this._rss, torrent);
          return;
        }
      }
      if (this.skipSameTorrent) {
        for (const key of Object.keys(global.runningClient)) {
          const client = global.runningClient[key];
          if (!client || !client.maindata || client._client.type !== 'qBittorrent') {
            continue;
          }
          for (const _torrent of client.maindata.torrents) {
            if (+_torrent.size === +torrent.size) {
              await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: 跳过同大小种子']);
              await this.ntf.rejectTorrent(this._rss, _client, torrent, '拒绝原因: 跳过同大小种子');
              return;
            }
          }
        }
        const sameTorrent = await util.getRecord('select * from torrent_r where size = ? and record_time > ?', [torrent.size, moment().unix() - 1200]);
        if (sameTorrent && sameTorrent.id) {
          await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: 跳过同大小种子']);
          await this.ntf.rejectTorrent(this._rss, _client, torrent, '拒绝原因: 跳过同大小种子');
          return;
        }
      }
      const fitRule = fitRules[0] || {};
      let savePath = fitRule.savePath || this.savePath;
      if (savePath) {
        savePath = savePath.replace('{RANDOM}', util.uuid.v4().replace(/-/g, ''));
      }
      const category = fitRule.category || this.category;
      const client = fitRule.client ? global.runningClient[fitRule.client] : _client;
      try {
        let truehash = '';
        this.addCount += 1;
        if (this.pushTorrentFile) {
          const { filepath, hash } = await this._downloadTorrent(torrent.url, torrent.hash);
          truehash = hash;
          await client.addTorrentByTorrentFile(filepath, hash, false, this.uploadLimit, this.downloadLimit, savePath, category, this.autoTMM, this.paused);
        } else {
          if (this.useCustomRegex) {
            const match = this.regexStr.match(/^\/(.*)\/([gimuy]*)$/);
            if (match) {
              const [, pattern, flags] = match;
              const regex = new RegExp(pattern, flags);
              await client.addTorrent(torrent.url.replace(regex, this.replaceStr), torrent.hash, false, this.uploadLimit, this.downloadLimit, savePath, category, this.autoTMM, this.paused);
            }
          } else {
            await client.addTorrent(torrent.url, torrent.hash, false, this.uploadLimit, this.downloadLimit, savePath, category, this.autoTMM, this.paused);
          }
        }
        try {
          await this.ntf.addTorrent(this._rss, client, torrent);
        } catch (e) {
          logger.error('通知信息发送失败: \n', e);
        }
        const hashToUse = truehash || torrent.hash;
        await util.runRecord(
          'INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [hashToUse, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), category, 1, '添加种子']
        );
      } catch (error) {
        logger.error(this.alias, '下载器', client.alias, '添加种子失败:', error.message);
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), category, 3, '添加种子失败']);
        try {
          await this.ntf.addTorrentError(this._rss, client, torrent);
        } catch (e) {
          logger.error('通知信息发送失败: \n', e);
        }
      }
    }
  }

  async rss (_torrents) {
    let torrents = [];
    if (_torrents) {
      torrents = _torrents;
    } else {
      torrents = await Promise.all(this.urls.map(async url => {
        const cacheKey = `qbitrace:rss:${url}`;
        const lockKey = `${cacheKey}:lock`;
        const lock = await redis.set(lockKey, 'locked', 'NX', 'EX', 50); // 60 秒锁定时间
        if (!lock) {
          logger.info(`Rss 任务 ${this.alias} 正在等待缓存`);
          // 等待缓存数据
          while (true) {
            const cachedTorrents = await redis.get(cacheKey);
            if (cachedTorrents) {
              logger.info(`Rss 任务 ${this.alias} 使用缓存`);
              try {
                return JSON.parse(cachedTorrents); // 解析缓存的数据
              } catch (e) {
                logger.error(`解析缓存数据失败: ${e.message}`);
                return []; // 返回空数组以继续处理
              }
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // 等待 0.2 秒后重试
          }
        }
        // 1. 从缓存中获取结果
        const cachedTorrents = await redis.get(cacheKey);
        if (cachedTorrents) {
          logger.info(`Rss 任务 ${this.alias} 使用缓存`);
          try {
            await redis.del(lockKey); // 释放锁
            return JSON.parse(cachedTorrents); // 解析缓存的数据
          } catch (e) {
            logger.error(`解析缓存数据失败: ${e.message}`);
            await redis.del(lockKey); // 释放锁
            return []; // 返回空数组以继续处理
          }
        }
        // 2. 如果缓存中没有结果，则请求 RSS 地址
        const torrents = await rss.getTorrents(url);
        // 3. 将结果缓存一段时间
        try {
          await redis.setWithExpire(cacheKey, JSON.stringify(torrents), 50); // 120 秒
          logger.info(`Rss 任务 ${this.alias} 缓存`);
        } catch (e) {
          logger.error(`缓存数据失败: ${e.message}`);
        } finally {
          await redis.del(lockKey); // 释放锁
        }
        return torrents;
      }));
      torrents = torrents.flat(); // 使用 flat 展平数组
    }
    for (const torrent of torrents) {
      const availableClients = this.clientArr
        .map(item => global.runningClient[item])
        .filter(item => {
          return !!item && !!item.status && !!item.maindata &&
          (!this.maxClientUploadSpeed || this.maxClientUploadSpeed > item.avgUploadSpeed) &&
          (!this.maxClientDownloadSpeed || this.maxClientDownloadSpeed > item.avgDownloadSpeed) &&
          (!this.maxClientDownloadCount || this.maxClientDownloadCount > item.maindata.leechingCount);
        });
      const firstClient = availableClients
        .filter(item => {
          return (!item.maxDownloadSpeed || item.maxDownloadSpeed > item.avgDownloadSpeed) &&
          (!item.maxUploadSpeed || item.maxUploadSpeed > item.avgUploadSpeed) &&
          (!item.maxLeechNum || item.maxLeechNum > item.maindata.leechingCount) &&
          (!item.minFreeSpace || item.minFreeSpace < item.maindata.freeSpaceOnDisk);
        })
        .sort((a, b) => (this.clientSortBy === 'freeSpaceOnDisk' ? -1 : 1) *
        (a.maindata[this.clientSortBy] - b.maindata[this.clientSortBy])
        )[0] || availableClients[0];
      const sqlRes = await util.getRecord('SELECT * FROM torrent_r WHERE hash = ? AND rss_id = ?', [torrent.hash, this.id]);
      if (sqlRes && sqlRes.id) continue;
      if (torrent.name.indexOf('[FROZEN]') !== -1) continue;
      if (this.addCount >= this.addCountPerHour) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝原因: 达到单小时推送上限: ${this.addCount} / ${this.addCountPerHour}`]);
        await this.ntf.rejectTorrent(this._rss, undefined, torrent, `拒绝原因: 达到单小时推送上限: ${this.addCount} / ${this.addCountPerHour}`);
        return;
      }
      if (moment().unix() - this.lastRssTime > +this.maxSleepTime) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: 最长休眠时间']);
        await this.ntf.rejectTorrent(this._rss, undefined, torrent, '拒绝原因: 最长休眠时间');
        continue;
      }
      if (!firstClient) {
        await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, '拒绝原因: 无可用下载器']);
        await this.ntf.rejectTorrent(this._rss, undefined, torrent, '拒绝原因: 无可用下载器');
        logger.error(this.alias, '无可用下载器');
        continue;
      }
      let reject = false;
      for (const rejectRule of this.rejectRules) {
        if (this._fitRule(rejectRule, torrent)) {
          await util.runRecord('INSERT INTO torrent_r (hash, name, size, rss_id, link, record_time, category, record_type, record_note) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [torrent.hash, torrent.name, torrent.size, this.id, torrent.link, moment().unix(), this.category, 2, `拒绝规则: ${rejectRule.alias}`]);
          await this.ntf.rejectTorrent(this._rss, undefined, torrent, `拒绝规则: ${rejectRule.alias}`);
          reject = true;
          break;
        }
      }
      if (!reject) {
        await this._pushTorrent(torrent, firstClient);
      }
    }
    this.lastRssTime = moment().unix();
  }

  async dryrun () {
    const torrents = (await Promise.all(this.urls.map(url => rss.getTorrents(url)))).flat();
    for (const torrent of torrents) {
      let reject = false;
      for (const rejectRule of this.rejectRules) {
        if (this._fitRule(rejectRule, torrent)) {
          torrent.status = '匹配到拒绝规则: ' + rejectRule.alias;
          reject = true;
          break;
        }
      }
      if (reject) {
        continue;
      }
      const fitRules = this.acceptRules.filter(item => this._fitRule(item, torrent));
      if (this.acceptRules.length === 0) {
        torrent.status = '无选择规则, 默认选中该种子';
        continue;
      } else if (fitRules.length === 0) {
        torrent.status = '未匹配到规则';
        continue;
      } else {
        torrent.status = '匹配到选择规则: ' + fitRules[0].alias;
        continue;
      }
    }
    return torrents;
  }

}
module.exports = Rss;