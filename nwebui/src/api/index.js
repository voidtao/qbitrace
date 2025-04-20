import user from './user';
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
  notification,
  deleteRule,
  rssRule,
  rss,
  script,
  torrent,
  log
};

export default () => { return api; };
