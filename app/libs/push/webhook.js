const util = require('../util');

class Webhook {
  constructor (webhook) {
    this.webhookurl = webhook.webhookurl;
    this.token = webhook.token;
    this.alias = webhook.alias;
  };

  async pushWebhook (event, payload) {
    if (payload.client && typeof payload.client === 'object') {
      payload.client = {
        id: payload.client.id,
        alias: payload.client.alias,
        clientUrl: payload.client.clientUrl
      };
    }
    payload.event = event;
    const option = {
      url: this.webhookurl,
      method: 'POST',
      headers: {
        'x-vertex-token': this.token
      },
      json: payload
    };
    await util.requestPromise(option);
    return '';
  };

  async rssError (rss) {
    await this.pushWebhook('rss.error', rss);
  };

  async scrapeError (rss, torrent) {
    await this.pushWebhook('rss.scrape.error', { rss, torrent });
  };

  async addTorrent (rss, client, torrent) {
    await this.pushWebhook('rss.torrent.add', { rss, client, torrent });
  };

  async addTorrentError (rss, client, torrent) {
    await this.pushWebhook('rss.torrent.add.error', { rss, client, torrent });
  };

  async rejectTorrent (rss, client = {}, torrent, note) {
    await this.pushWebhook('rss.torrent.reject', { rss, client, torrent, note });
  };

  async deleteTorrent (client, torrent, rule, deleteFile) {
    await this.pushWebhook('client.torrent.delete', { client, torrent, rule, deleteFile });
  };

  async deleteTorrentError (client, torrent, rule) {
    await this.pushWebhook('client.torrent.delete.error', { client, torrent, rule });
  };

  async reannounceTorrent (client, torrent) {
    await this.pushWebhook('client.torrent.reannounce', { client, torrent });
  };

  async reannounceTorrentError (client, torrent) {
    await this.pushWebhook('client.torrent.reannounce.error', { client, torrent });
  };

  async connectClient (client) {
    await this.pushWebhook('client.connect', { client });
  };

  async clientLoginError (client, message) {
    await this.pushWebhook('client.connect.error', { client, message });
  };

  async getMaindataError (client) {
    await this.pushWebhook('client.maindata.error', { client });
  };

  async spaceAlarm (client) {
    await this.pushWebhook('client.space.alarm', { client });
  };

};

module.exports = Webhook;
