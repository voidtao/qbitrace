const util = require('../libs/util');
const logger = require('../libs/logger');
const path = require('path');

class TorrentMod {
  async list (options) {
    const clientsList = JSON.parse(options.clientList);
    let torrentList = [];
    const clients = global.runningClient;
    for (const clientId of Object.keys(clients)) {
      if (!clientsList.some(item => item === clientId)) continue;
      if (!clients[clientId].maindata) {
        throw new Error('客户端 ' + clients[clientId].alias + ' 未连接或未更新种子列表, 请稍后重试');
      }
      for (const torrent of clients[clientId].maindata.torrents) {
        const _torrent = { ...torrent };
        _torrent.clientAlias = clients[clientId].alias;
        _torrent.client = clientId;
        if (options.searchKey && !options.searchKey.split(' ').every(item => _torrent.name.toLowerCase().indexOf(item.toLowerCase()) !== -1)) continue;
        torrentList.push(_torrent);
      }
    }
    if (options.sortKey) {
      const sortType = options.sortType || 'desc';
      const sortKey = options.sortKey;
      const numberSet = {
        desc: [-1, 1],
        asc: [1, -1]
      };
      torrentList = torrentList.sort((a, b) => {
        if (typeof a[sortKey] === 'string') {
          return (a[sortKey] < b[sortKey] ? numberSet[sortType][1] : numberSet[sortType][0]);
        }
        return sortType === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      });
    }
    const total = torrentList.length;
    torrentList = torrentList.slice((options.page - 1) * options.length, options.page * options.length);
    const res = await util.getRecords(`select link, hash from torrents where hash in ('${torrentList.map(item => item.hash).join('\',\'')}')`);
    const hashMap = {};
    for (const r of res) {
      hashMap[r.hash] = r.link;
    }
    for (const torrent of torrentList) {
      torrent.link = hashMap[torrent.hash] || false;
    }
    return {
      torrents: torrentList,
      total
    };
  };

  async info (options) {
    const torrentHash = options.hash;
    const clients = global.runningClient;
    for (const clientId of Object.keys(clients)) {
      if (!clients[clientId].maindata) continue;
      for (const torrent of clients[clientId].maindata.torrents) {
        if (torrent.hash !== torrentHash) continue;
        const _torrent = { ...torrent };
        _torrent.clientAlias = clients[clientId].alias;
        _torrent.client = clientId;
        return _torrent;
      }
    }
    throw new Error('not found');
  }

  async getBulkLinkList (options) {
    const { keyword } = options;
    const clients = global.runningClient;
    const torrents = [];
    const torrentKeys = {};
    for (const clientId of Object.keys(clients)) {
      if (options.client && clientId !== options.client) continue;
      if (!clients[clientId].maindata) continue;
      for (const torrent of clients[clientId].maindata.torrents) {
        if (
          !(
            (torrent.tags && torrent.tags.indexOf(keyword) !== -1) ||
            (torrent.category && torrent.category.indexOf(keyword) !== -1) ||
            (torrent.savePath && torrent.savePath.indexOf(keyword) !== -1)
          )
        ) {
          continue;
        }
        const _torrent = { hash: torrent.hash, name: torrent.name, size: torrent.size, savePath: torrent.savePath };
        _torrent.clientAlias = clients[clientId].alias;
        _torrent.client = clientId;
        const key = `${torrent.savePath}-${torrent.name}-${torrent.size}`;
        if (torrentKeys[key]) {
          continue;
        }
        torrentKeys[key] = 1;
        torrents.push(_torrent);
      }
    }
    return torrents;
  }

  async listHistory (options) {
    const index = options.length * (options.page - 1);
    let where = 'where 1 = 1';
    if (options.type === 'rss') {
      where += ' and record_type IN (1,2,3)';
    } else if (options.type === 'bingewatching') {
      where += ' and record_type IN (4,6,98,99)';
    }
    if (options.rss) {
      if (options.rss === 'deleted') {
        where += ` and rss_id not in ('${util.listRss().map(item => item.id).join('\',\'')}')`;
      } else {
        where += ` and rss_id = '${options.rss}'`;
      }
    }
    if (options.key) {
      where += ` and (name like '%${options.key}%' or record_note like '%${options.key}%')`;
    }
    const params = [options.length, index];
    const torrents = await util.getRecords('select id, rss_id as rssId, name, size, link, record_type as recordType, record_note as recordNote, upload, download, tracker, record_time as recordTime, add_time as addTime, delete_time as deleteTime, hash from torrents ' + where + ' order by id desc limit ? offset ?',
      params);
    const total = (await util.getRecord('select count(*) as total from torrents ' + where)).total;
    return { torrents, total };
  }

  getDelInfo (options) {
    return global.linkMapping[options.hash] || [];
  }

  async deleteTorrent (options) {
    if (!global.runningClient[options.clientId]) {
      throw new Error('客户端 ' + options.clientId + ' 未连接或未更新种子列表, 请稍后重试');
    }
    if (!global.runningClient[options.clientId].maindata) {
      throw new Error('客户端 ' + global.runningClient[options.clientId].alias + ' 未连接或未更新种子列表, 请稍后重试');
    }
    const client = global.runningClient[options.clientId];
    let isError = false;
    try {
      await client.client.deleteTorrent(client.clientUrl, client.cookie, options.hash, true);
    } catch (e) {
      isError = true;
      logger.error('删除种子失败: ', e);
    }
    for (const file of options.files) {
      const { server, filepath } = file;
      try {
        logger.info(global.runningServer[server].server.alias, '执行删除文件命令:', `rm -f $'${filepath}'`);
        if (server === '$local') {
          await util.exec(`rm -f $'${filepath}'`);
        } else {
          await global.runningServer[server].run(`rm -f $'${filepath}'`);
        }
      } catch (e) {
        isError = true;
        logger.error(global.runningServer[server].server.alias, '执行删除文件命令报错:\n');
      }
    }
    if (!isError) {
      delete global.linkMapping[options.hash];
      util.saveLinkMapping();
    }
    return '任务执行完毕, 请检查错误日志是否存在报错信息, 若无报错信息, 才是成功执行';
  }
}

module.exports = TorrentMod;
