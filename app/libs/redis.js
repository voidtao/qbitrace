const redis = require('redis');

const config = require('./config');
const logger = require('./logger');

// 创建客户端
const client = redis.createClient(config.getRedisConfig());

// 错误和连接监听
client.on('error', (err) => {
  logger.error(err);
});

client.on('connect', () => {
  logger.info('Redis connected!');
});

// 连接到 Redis 服务器
client.connect().catch(err => {
  logger.error('Redis connection error:', err);
});

exports.set = async (key, value) => await client.set(key, value);
exports.get = async (key) => await client.get(key);
exports.del = async (key) => await client.del(key);
exports.expire = async (key, seconds) => await client.expire(key, seconds);
exports.scan = async (cursor, ...args) => await client.scan(cursor, ...args);

exports.setWithExpire = async function (k, v, ex) {
  if (!ex && +ex !== ex) {
    throw 'illegal expire';
  }
  await client.set(k, v, { EX: ex }); // 直接在 set 命令中设置过期时间
};

exports.deleteAll = async function (str, cursor = '0') {
  const res = await exports.scan(cursor, 'MATCH', str, 'COUNT', '10');
  // 注意：cursor 现在是 string 类型，避免使用数值类型转换
  if (res[0] === '0' && res[1].length === 0) {
    return logger.info('Redis Delete All', str);
  } else {
    for (const key of res[1]) {
      await exports.del(key);
      logger.debug('redis delete', key);
    }
    return await exports.deleteAll(str, res[0]);
  }
};