import { get, post } from '../util/axios';

export default {
  get: async () => {
    const url = '/api/setting/get';
    return await get(url);
  },
  modify: async (body) => {
    const url = '/api/setting/modify';
    return await post(url, body);
  },
  getRunInfo: async () => {
    const url = '/api/setting/getRunInfo?_=' + Math.random();
    return await get(url);
  },
  getHosts: async () => {
    const url = '/api/setting/getHosts';
    return await get(url);
  },
  save: async (body) => {
    const url = '/api/setting/save';
    return await post(url, body);
  },
  export: async () => {
    const url = '/api/setting/export';
    return await get(url);
  },
  import: async () => {
    const url = '/api/setting/import';
    return await get(url);
  },
  networkTest: async (body) => {
    const url = '/api/setting/networkTest';
    return await post(url, body);
  },
  getProxy: async () => {
    const url = '/api/setting/getProxy';
    return await get(url);
  },
  saveProxy: async (body) => {
    const url = '/api/setting/saveProxy';
    return await post(url, body);
  }
};
