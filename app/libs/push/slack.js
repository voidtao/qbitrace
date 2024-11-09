const moment = require('moment');
const logger = require('../logger');
const util = require('../util');
const path = require('path');

class Slack {
  constructor (slack) {
    this.slackWebhook = slack.slackWebhook;
    this.slackToken = slack.slackToken;
    this.alias = slack.alias;
  };

  async pushSlack (title, desp, poster) {
    let _poster = poster || global.wechatCover || 'https://pic.lswl.in/images/2022/07/11/bf4eabf1afa841f4527db4d207d265c3.png';
    _poster = `https://image.qbitrace-app.top/api/image/cut/0.425/${path.basename(_poster)}/${encodeURIComponent(_poster)}`;
    const option = {
      url: this.slackWebhook,
      method: 'POST',
      json: {
        attachments: [
          {
            color: util.randomColor(),
            fallback: title,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: title,
                  emoji: true
                }
              },
              {
                type: 'image',
                image_url: _poster,
                alt_text: 'inspiration'
              },
              {
                type: 'context',
                elements: [
                  {
                    text: desp,
                    type: 'mrkdwn'
                  }
                ]
              },
              {
                type: 'context',
                elements: [
                  {
                    text: '发送自: qbitrace',
                    type: 'mrkdwn'
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    const res = await util.requestPromise(option);
    const json = res.body;
    if (json !== 'ok') {
      logger.error('推送失败', this.alias, title, res.body);
      return;
    }
    return '';
  };

  async rssError (rss) {
    const title = 'RSS 失败';
    const desp = `*RSS 任务*: ${rss.alias}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushSlack(title, desp);
  };

  async scrapeError (rss, torrent) {
    const title = '抓取失败';
    const desp = `*RSS 任务*: ${rss.alias}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子 hash*: ${torrent.hash}\n` +
      '请确认 Rss 站点是否支持抓取免费或抓取 HR, 若确认无问题, 请前往 qbitrace 日志页面查看详细原因';
    await this.pushSlack(title, desp);
  };

  async addTorrent (rss, client, torrent) {
    const title = '添加种子';
    const desp = `*RSS 任务*: ${rss.alias}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子大小*: ${util.formatSize(torrent.size)}\n` +
      `*种子 hash*: ${torrent.hash}`;
    await this.pushSlack(title, desp);
  };

  async selectTorrentError (alias, wish, note) {
    const title = `豆瓣搜索种子失败 - ${wish.name}`;
    let desp = `*豆瓣账号*: ${alias}\n` +
      `*搜索项目*: ${wish.name}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`;
    if (note) {
      desp += note;
    } else {
      desp += wish.episodes ? `*进度信息*: 已完成至 ${wish.episodeNow} 集 / 全 ${wish.episodes} 集` : '';
    }
    await this.pushSlack(title, desp);
  };

  async startRefreshWish (key) {
    const title = `刷新豆瓣任务 - ${key.split('/')[0].trim()}`;
    const desp = `*信息*: ${key}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`;
    await this.pushSlack(title, desp);
  };

  async startRefreshWishError (key) {
    const title = '刷新想看列表失败';
    const desp = `信息: ${key}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`;
    await this.pushSlack(title, desp);
  };

  async torrentFinish (note) {
    const wish = note.wish;
    const title = `种子已完成 - ${wish.name}`;
    let desp = `*${wish.name}*\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`;
    desp += `*种子信息*: ${note.torrent.site} / ${note.torrent.title}`;
    desp += wish.episodes ? `\n*进度信息*: 已完成至 ${wish.episodeNow} 集 / 全 ${wish.episodes} 集` : '';
    await this.pushSlack(title, desp, wish.poster);
  };

  async addTorrentError (rss, client, torrent) {
    const title = `添加种子失败 - ${rss.alias}`;
    const desp = `*RSS 任务*: ${rss.alias}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子大小*: ${util.formatSize(torrent.size)}\n` +
      `*种子 hash*: ${torrent.hash}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushSlack(title, desp);
  };

  async rejectTorrent (rss, client = {}, torrent, note) {
    const title = '拒绝种子 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `*RSS 任务*: ${rss.alias}\n` +
      `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias || '未定义'}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子大小*: ${util.formatSize(torrent.size)}\n` +
      `*种子 hash*: ${torrent.hash}\n` +
      `*其它信息*: ${note}`;
    await this.pushSlack(title, desp);
  };

  async deleteTorrent (client, torrent, rule, deleteFile) {
    const title = '删除种子';
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子大小*: ${util.formatSize(torrent.size)}\n` +
      `*种子 hash*: ${torrent.hash}\n` +
      `*已完成量*: ${util.formatSize(torrent.completed)}\n` +
      `*种子状态*: ${torrent.state}\n` +
      `*添加时间*: ${moment(torrent.addedTime * 1000).format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*删除时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*所属分类*: ${torrent.category}\n` +
      `*流量统计*: ${util.formatSize(torrent.uploaded)} ↑ / ${util.formatSize(torrent.downloaded)} ↓\n` +
      `*即时速度*: ${util.formatSize(torrent.uploadSpeed)}/s ↑ / ${util.formatSize(torrent.downloadSpeed)}/s ↓\n` +
      `*分享比率*: ${(+torrent.ratio).toFixed(2)}\n` +
      `*站点域名*: ${torrent.tracker}\n` +
      `*删除文件*: ${deleteFile}\n` +
      `*符合规则*: ${rule.alias}`;
    await this.pushSlack(title, desp);
  };

  async deleteTorrentError (client, torrent, rule) {
    const title = '删除种子失败';
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子大小*: ${util.formatSize(torrent.size)}\n` +
      `*种子 hash*: ${torrent.hash}\n` +
      `*已完成量*: ${util.formatSize(torrent.completed)}\n` +
      `*种子状态*: ${torrent.completed.state}\n` +
      `*所属分类*: ${torrent.category}\n` +
      `*流量统计*: ${util.formatSize(torrent.uploaded)} ↑ / ${util.formatSize(torrent.downloaded)}\n` +
      `*即时速度*: ${util.formatSize(torrent.uploadSpeed)}/s ↑ / ${util.formatSize(torrent.downloadSpeed)}/s\n` +
      `*分享比率*: ${(+torrent.ratio).toFixed(2)}\n` +
      `*站点域名*: ${torrent.tracker}\n` +
      `*符合规则*: ${rule.alias}\n`;
    await this.pushSlack(title, desp);
  };

  async reannounceTorrent (client, torrent) {
    const title = '重新汇报种子';
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子 hash*: ${torrent.hash}`;
    await this.pushSlack(title, desp);
  };

  async reannounceTorrentError (client, torrent) {
    const title = '重新汇报种子失败';
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `下载器名: ${client.alias}\n` +
      `*种子名称*: ${torrent.name}\n` +
      `*种子 hash*: ${torrent.hash}`;
    await this.pushSlack(title, desp);
  };

  async connectClient (client) {
    const title = '下载器已连接';
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}`;
    await this.pushSlack(title, desp);
  };

  async clientLoginError (client, message) {
    const title = '下载器登录失败';
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*附加信息*: ${message}`;
    await this.pushSlack(title, desp);
  };

  async scrapeTorrent (alias, torrentName, scrapedName) {
    const title = `种子识别成功 - ${scrapedName}`;
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n*监控分类*: ${alias}\n*种子名称*: ${torrentName}\n*识别名称*: ${scrapedName}`;
    await this.pushSlack(title, desp);
  };

  async scrapeTorrentFailed (alias, torrentName, note) {
    const title = '种子识别失败';
    let desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*监控分类*: ${alias}\n` +
      `*种子名称*: ${torrentName}`;
    if (note) {
      desp += `\n错误信息: ${note}`;
    }
    await this.pushSlack(title, desp);
  };

  async getMaindataError (client) {
    const title = `获取下载器信息失败 - ${client.alias}`;
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushSlack(title, desp);
  };

  async spaceAlarm (client) {
    const title = `剩余空间警告 - ${client.alias}`;
    const desp = `*当前时间*: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `*下载器名*: ${client.alias}\n` +
      `*剩余空间*: ${util.formatSize(client.maindata.freeSpaceOnDisk)}`;
    await this.pushSlack(title, desp);
  };

  async selectWish (note) {
    const title = '选择想看';
    const desp = note;
    await this.pushSlack(title, desp);
  };

  async pushSlackRaw (raw) {
    const option = {
      url: this.slackWebhook,
      method: 'POST',
      json: raw
    };
    const res = await util.requestPromise(option);
    const json = res.body;
    if (json !== 'ok') {
      logger.error('Slack 推送原始信息失败', this.alias, res.body);
      return;
    }
    return '';
  };

  async openSlackView (raw) {
    const option = {
      url: 'https://slack.com/api/views.open',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.slackToken
      },
      json: raw
    };
    const res = await util.requestPromise(option);
    const json = res.body;
    if (!json.ok) {
      logger.error('Slack 推送视图失败', this.alias, res.body);
      return;
    }
    return '';
  };
};

module.exports = Slack;