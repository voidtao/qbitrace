import { get } from '../util/axios';

export default {
  getHistoricalData: async (params) => {
    // 创建URLSearchParams实例来正确处理数组
    const searchParams = new URLSearchParams();
    
    // 特殊处理clientIds数组
    if (params.clientIds) {
      params.clientIds.forEach(id => searchParams.append('clientIds', id));
    }
    
    // 处理其他参数
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'clientIds') { // 跳过已处理的clientIds
        searchParams.append(key, value);
      }
    });

    const url = '/api/analytics/getHistoricalData?' + searchParams.toString();
    return await get(url);
  },
  getSummary: async (params) => {
    // 创建URLSearchParams实例来正确处理数组
    const searchParams = new URLSearchParams();
    
    // 特殊处理clientIds数组
    if (params.clientIds) {
      params.clientIds.forEach(id => searchParams.append('clientIds', id));
    }
    
    // 处理其他参数
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'clientIds') { // 跳过已处理的clientIds
        searchParams.append(key, value);
      }
    });

    const url = '/api/analytics/getSummary?' + searchParams.toString();
    return await get(url);
  },
  getClients: async () => {
    const url = '/api/analytics/getClients';
    return await get(url);
  }
};
