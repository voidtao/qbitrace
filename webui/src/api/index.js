import user from './user';
import server from './server';
import site from './site';
import setting from './setting';
import notification from './notification';
import downloader from './downloader';
import deleteRule from './deleteRule';
import rssRule from './rssRule';
import rss from './rss';
import script from './script';
import torrent from './torrent';
import log from './log';

const api = {
  user,
  setting,
  downloader,
  server,
  site,
  notification,
  deleteRule,
  rssRule,
  rss,
  script,
  torrent,
  log
};

export default () => { return api; };
