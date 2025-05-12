const path = require('path');
const util = require('../libs/util'); // 使用 util.js 中的数据库函数
const ClientMod = require('./ClientMod');

class AnalyticsMod {
  constructor() {
    this.clientMod = new ClientMod();
  }

  async getHistoricalData({ clientIds, timeRange, startTime, endTime }) { // Renamed clientId to clientIds
    let whereClause = '1 = 1';
    const params = [];

    // Handle clientIds (multiple selections)
    if (clientIds && Array.isArray(clientIds) && clientIds.length > 0 && !clientIds.includes('all')) {
      whereClause += ` AND clientid IN (${clientIds.map(() => '?').join(',')})`;
      params.push(...clientIds);
    } else if (clientIds && !Array.isArray(clientIds) && clientIds !== 'all') {
      // Handle single clientId if passed as string (backward compatibility or specific use case)
      whereClause += ' AND clientid = ?';
      params.push(clientIds);
    }
    // If clientIds includes 'all' or is empty/not provided, no client-specific WHERE clause is added, fetching all.

    // Handle time range
    const now = Math.floor(Date.now() / 1000);
    if (startTime && endTime) {
      whereClause += ' AND time >= ? AND time <= ?';
      params.push(parseInt(startTime, 10));
      params.push(parseInt(endTime, 10));
    } else if (timeRange) {
      let timeOffset;
      switch (timeRange) {
        case '1h':
          timeOffset = 3600;
          break;
        case '24h':
          timeOffset = 86400;
          break;
        case '7d':
          timeOffset = 604800;
          break;
        case '30d':
          timeOffset = 2592000;
          break;
        case '90d':
          timeOffset = 7776000;
          break;
        default:
          // Default to 1h if timeRange is present but not recognized, or handle as an error
          timeOffset = 3600; 
      }
      whereClause += ' AND time >= ?';
      params.push(now - timeOffset);
    } else {
      // Default query: last 1 hour if no time filter is specified
      whereClause += ' AND time >= ?';
      params.push(now - 3600);
    }
    
    const sql = `
      SELECT time, clientid, upspeed, dlspeed, upcount, dlcount, usedspace, freespace, uploaded, downloaded
      FROM client_q
      WHERE ${whereClause}
      ORDER BY time ASC
    `;
    return await util.getRecords(sql, params);
  }

  async getSummary({ clientIds, timeRange, startTime, endTime }) { // Renamed clientId to clientIds
    const data = await this.getHistoricalData({ clientIds, timeRange, startTime, endTime });
    
    // 获取客户端列表以便映射ID到别名
    const clientList = this.clientMod.list();
    const clientMap = {};
    
    clientList.forEach(client => {
      clientMap[client.id] = client.alias || client.id;
    });

    // 按客户端ID分组
    const groupedByClient = {};
    
    data.forEach(row => {
      if (!groupedByClient[row.clientid]) {
        groupedByClient[row.clientid] = [];
      }
      groupedByClient[row.clientid].push(row);
    });

    // 计算每个客户端的汇总数据
    const summary = [];
    
    for (const id in groupedByClient) {
      const clientData = groupedByClient[id];
      const alias = clientMap[id] || id;
      
      if (clientData.length === 0) continue;
      
      // 计算平均、最大、最小值
      const avgUpSpeed = clientData.reduce((sum, item) => sum + item.upspeed, 0) / clientData.length;
      const avgDlSpeed = clientData.reduce((sum, item) => sum + item.dlspeed, 0) / clientData.length;
      const maxUpSpeed = Math.max(...clientData.map(item => item.upspeed));
      const maxDlSpeed = Math.max(...clientData.map(item => item.dlspeed));
      
      // 计算上传/下载总量变化
      const firstRecord = clientData[0];
      const lastRecord = clientData[clientData.length - 1];
      
      let uploadedDelta = 0;
      let downloadedDelta = 0;
      
      if (firstRecord.uploaded !== null && lastRecord.uploaded !== null && 
          typeof firstRecord.uploaded === 'number' && typeof lastRecord.uploaded === 'number') {
        uploadedDelta = lastRecord.uploaded - firstRecord.uploaded;
      }
      
      if (firstRecord.downloaded !== null && lastRecord.downloaded !== null &&
          typeof firstRecord.downloaded === 'number' && typeof lastRecord.downloaded === 'number') {
        downloadedDelta = lastRecord.downloaded - firstRecord.downloaded;
      }
      
      summary.push({
        clientId: id,
        alias,
        records: clientData.length,
        avgUpSpeed,
        avgDlSpeed,
        maxUpSpeed,
        maxDlSpeed,
        uploadedDelta,
        downloadedDelta,
        latestUsedSpace: lastRecord.usedspace,
        latestFreeSpace: lastRecord.freespace
      });
    }
    
    return summary;
  }

  async getClients() {
    const sql = `
      SELECT DISTINCT clientid
      FROM client_q
    `;
    const rows = await util.getRecords(sql);
    const clientList = this.clientMod.list();
    const clientMap = {};
            
    clientList.forEach(client => {
      clientMap[client.id] = client.alias || client.id;
    });
            
    const clientOptions = rows.map(row => ({
      id: row.clientid,
      name: clientMap[row.clientid] || row.clientid
    }));
            
    // Remove "全部客户端" option as it's now multi-select
    // clientOptions.unshift({
    //   id: 'all',
    //   name: '全部客户端'
    // });
            
    return clientOptions;
  }
}

module.exports = AnalyticsMod;
