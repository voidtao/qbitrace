const moment = require('moment');
const logger = require('../logger');
const util = require('../util');

class Telegram {
  constructor (telegram) {
    this.telegramBotToken = telegram.telegramBotToken;
    this.telegramChannel = telegram.telegramChannel;
    this.alias = telegram.alias;
  };

  async pushTelegram (title, desp) {
    const option = {
      url: `${global.telegramProxy}/bot${this.telegramBotToken}/sendMessage`,
      method: 'POST',
      json: {
        chat_id: this.telegramChannel,
        text: '\\#' + title.replace(/-/g, '\\-') + '\n```\n' + desp + '\n```',
        parse_mode: 'MarkdownV2'
      }
    };
    const res = await util.requestPromise(option);
    const json = res.body;
    if (!json.ok) {
      logger.error('推送失败', this.alias, title, res.body);
      return;
    }
    return json.result.message_id;
  };

  async edit (messageId, maindata) {
    const torrents = maindata.torrents.sort((a, b) => b.uploadSpeed - a.uploadSpeed || b.downloadSpeed - a.downloadSpeed).slice(0, 10);
    let message = '';
    for (let i = 0; i < 10; i++) {
      if (!torrents[i]) break;
      message += `<pre>${i + 1}:</pre>\n`;
      message += `<pre>  ${torrents[i].name.length > 20 ? torrents[i].name.substring(0, 20) + '..' : torrents[i].name}</pre>\n`;
      message += `<pre>  ↑/↓: ${util.formatSize(torrents[i].uploadSpeed)}/s / ${util.formatSize(torrents[i].downloadSpeed)}/s</pre>\n`;
      message += `<pre>  ↑/↓: ${util.formatSize(torrents[i].uploaded)} / ${util.formatSize(torrents[i].downloaded)}</pre>\n`;
      message += `<pre>  Ratio: ${torrents[i].ratio.toFixed(3)}</pre>\n`;
      message += `<pre>  Size: ${util.formatSize(torrents[i].size)}</pre>\n`;
      message += `<pre>  Progress: ${torrents[i].progress.toFixed(3)}</pre>\n`;
      message += `<pre>  Tracker: ${torrents[i].tracker}</pre>\n`;
    }
    message += '\n';
    message += `<pre>S/L: ${maindata.seedingCount} / ${maindata.leechingCount}</pre>\n`;
    message += `<pre>↑/↓: ${util.formatSize(maindata.uploadSpeed)}/s / ${util.formatSize(maindata.downloadSpeed)}/s</pre>\n`;
    message += `<pre>Free Space: ${util.formatSize(maindata.freeSpaceOnDisk)}</pre>\n`;
    message += `<pre>Update Time: ${moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}</pre>`;
    const option = {
      url: `${global.telegramProxy}/bot${this.telegramBotToken}/editMessageText`,
      method: 'POST',
      json: {
        chat_id: this.telegramChannel,
        message_id: messageId,
        text: message,
        parse_mode: 'HTML'
      }
    };
    const res = await util.requestPromise(option);
    const json = res.body;
    if (!json.ok) {
      logger.error('推送失败, 请检查本通知工具是否已勾选 下载器已链接 推送类型! ', this.alias, res.body);
    }
  }

  async rssError (rss) {
    const title = 'RSS 失败';
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushTelegram(title, desp);
  };

  async scrapeError (rss, torrent) {
    const title = '抓取失败';
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}\n` +
      '请确认 Rss 站点是否支持抓取免费或抓取 HR, 若确认无问题, 请前往 qbitrace 日志页面查看详细原因';
    await this.pushTelegram(title, desp);
  };

  async addTorrent (rss, client, torrent) {
    const title = '添加种子';
    const desp = `RSS 任务: ${rss.alias}\n` +
      `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushTelegram(title, desp);
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
    await this.pushTelegram(title, desp);
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
    await this.pushTelegram(title, desp);
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
    await this.pushTelegram(title, desp);
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
    await this.pushTelegram(title, desp);
  };

  async reannounceTorrent (client, torrent) {
    const title = '重新汇报种子';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushTelegram(title, desp);
  };

  async reannounceTorrentError (client, torrent) {
    const title = '重新汇报种子失败';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushTelegram(title, desp);
  };

  async connectClient (client) {
    const title = '下载器已连接';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}`;
    return await this.pushTelegram(title, desp);
  };

  async clientLoginError (client, message) {
    const title = '下载器登录失败';
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `附加信息: ${message}`;
    await this.pushTelegram(title, desp);
  };

  async getMaindataError (client) {
    const title = `获取下载器信息失败 - ${client.alias}`;
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushTelegram(title, desp);
  };

  async spaceAlarm (client) {
    const title = `剩余空间警告 - ${client.alias}`;
    const desp = `当前时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `剩余空间: ${util.formatSize(client.maindata.freeSpaceOnDisk)}`;
    await this.pushTelegram(title, desp);
  };
};

module.exports = Telegram;