const moment = require('moment');
const logger = require('../logger');
const util = require('../util');

class Ntfy {
  constructor (ntfy) {
    this.ntfyUrl = ntfy.ntfyUrl;
    this.ntfyUsername = ntfy.ntfyUsername;
    this.ntfyPassword = ntfy.ntfyPassword;
    this.ntfyToken = ntfy.ntfyToken;
    if (ntfy.ntfyPriority) {
      this.ntfyPriority = ntfy.ntfyPriority;
    } else {
      this.ntfyPriority = '3';
    }
    this.alias = ntfy.alias;
  };

  async pushNtfy (title, desp) {
    const option = {
      url: `${this.ntfyUrl}`,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-Title': '=?UTF-8?B?' + Buffer.from(title, 'utf-8').toString('base64') + '?=',
        'X-Priority': this.ntfyPriority,
        'User-Agent': 'qbitrace'
      },
      body: desp
    };
    if (this.ntfyUsername && this.ntfyPassword) {
      option.headers.Authorization = 'Basic ' + Buffer.from(this.ntfyUsername + ':' + this.ntfyPassword, 'utf-8').toString('base64');
    } else if (this.ntfyToken) {
      option.headers.Authorization = 'Bearer ' + this.ntfyToken;
    }
    const res = await util.requestPromise(option);
    const statusCode = res.statusCode;
    if (statusCode !== 200) {
      logger.error('推送失败', this.alias, title, res.body);
      return;
    }
    return JSON.parse(res.body).id;
  };

  async rssError (rss) {
    const title = 'RSS 失败';
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushNtfy(title, desp);
  };

  async scrapeError (rss, torrent) {
    const title = '抓取失败';
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `种子 hash: ${torrent.hash}\n` +
      `种子名称: ${torrent.name}\n` +
      '请确认 Rss 站点是否支持抓取免费或抓取 HR, 若确认无问题, 请前往 qbitrace 日志页面查看详细原因';
    await this.pushNtfy(title, desp);
  };

  async addTorrent (rss, client, torrent) {
    const title = '添加种子';
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushNtfy(title, desp);
  };

  async addTorrentError (rss, client, torrent) {
    const title = `添加种子失败 - ${rss.alias}`;
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushNtfy(title, desp);
  };

  async rejectTorrent (rss, client = {}, torrent, note) {
    const title = '拒绝种子 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias || '未定义'}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      `其它信息: ${note}`;
    await this.pushNtfy(title, desp);
  };

  async deleteTorrent (client, torrent, rule, deleteFile) {
    const title = '删除种子';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      `已完成量: ${util.formatSize(torrent.completed)}\n` +
      `种子状态: ${torrent.state}\n` +
      `添加时间: ${moment(torrent.addedTime * 1000).format('YYYY-MM-DD HH:mm:ss')}\n` +
      `删除时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `所属分类: ${torrent.category}\n` +
      `流量统计: ${util.formatSize(torrent.uploaded)} ↑ / ${util.formatSize(torrent.downloaded)} ↓\n` +
      `即时速度: ${util.formatSize(torrent.uploadSpeed)}/s ↑ / ${util.formatSize(torrent.downloadSpeed)}/s ↓\n` +
      `分享比率: ${(+torrent.ratio).toFixed(2)}\n` +
      `站点域名: ${torrent.tracker}\n` +
      `删除文件: ${deleteFile}\n` +
      `符合规则: ${rule.alias}`;
    await this.pushNtfy(title, desp);
  };

  async deleteTorrentError (client, torrent, rule) {
    const title = '删除种子失败';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      `已完成量: ${util.formatSize(torrent.completed)}\n` +
      `种子状态: ${torrent.completed.state}\n` +
      `所属分类: ${torrent.category}\n` +
      `流量统计: ${util.formatSize(torrent.uploaded)} ↑ / ${util.formatSize(torrent.downloaded)}\n` +
      `即时速度: ${util.formatSize(torrent.uploadSpeed)}/s ↑ / ${util.formatSize(torrent.downloadSpeed)}/s\n` +
      `分享比率: ${(+torrent.ratio).toFixed(2)}\n` +
      `站点域名: ${torrent.tracker}\n` +
      `符合规则: ${rule.alias}\n`;
    await this.pushNtfy(title, desp);
  };

  async reannounceTorrent (client, torrent) {
    const title = '重新汇报种子';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushNtfy(title, desp);
  };

  async reannounceTorrentError (client, torrent) {
    const title = '重新汇报种子失败';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushNtfy(title, desp);
  };

  async connectClient (client) {
    const title = '下载器已连接';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}`;
    return await this.pushNtfy(title, desp);
  };

  async clientLoginError (client, message) {
    const title = '下载器登录失败';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `附加信息: ${message}`;
    await this.pushNtfy(title, desp);
  };

  async getMaindataError (client) {
    const title = `获取下载器信息失败 - ${client.alias}`;
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushNtfy(title, desp);
  };

  async spaceAlarm (client) {
    const title = `剩余空间警告 - ${client.alias}`;
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `剩余空间: ${util.formatSize(client.maindata.freeSpaceOnDisk)}`;
    await this.pushNtfy(title, desp);
  };
};

module.exports = Ntfy;
