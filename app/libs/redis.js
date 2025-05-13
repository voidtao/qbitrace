const redis = require('redis');

const config = require('./config');
const logger = require('./logger');

const client = redis.createClient(config.getRedisConfig());
client.on('error', (err) => {
  logger.error(err);
});
client.on('connect', () => {
  logger.info('Redis connected!');
});
client.connect().catch(err => {
  logger.error('Redis connection error:', err);
});

exports.set = async (key, value, ...args) => {
  try {
    // 处理第一个参数是对象的情况（向后兼容）
    if (args.length === 1 && typeof args[0] === 'object') {
      return await client.set(key, value, args[0]);
    }
    
    // 处理命令行风格的参数
    if (args.length > 0) {
      let options = {};
      for (let i = 0; i < args.length; i += 2) {
        if (args[i] === 'NX') {
          options.NX = true;
        } else if (args[i] === 'XX') {
          options.XX = true;
        } else if (args[i] === 'EX') {
          options.EX = parseInt(args[i + 1]);
        } else if (args[i] === 'PX') {
          options.PX = parseInt(args[i + 1]);
        }
      }
      return await client.set(key, value, options);
    }

    // 基础set调用
    return await client.set(key, value);
  } catch (error) {
    logger.error('Redis set error:', error);
    throw error;
  }
};

exports.get = async (key) => await client.get(key);
exports.del = async (key) => await client.del(key);
exports.expire = async (key, seconds) => await client.expire(key, seconds);
exports.scan = async (cursor, ...args) => await client.scan(cursor, ...args);

exports.setWithExpire = async function (k, v, ex) {
  if (!ex || isNaN(ex)) {
    throw new Error('illegal expire: must be a valid number');
  }
  try {
    // 使用 redis 的原子操作设置值和过期时间
    return await client.set(k, v, {
      EX: parseInt(ex)
    });
  } catch (error) {
    logger.error('Redis setWithExpire error:', error);
    throw error;
  }
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