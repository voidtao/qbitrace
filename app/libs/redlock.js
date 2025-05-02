const Redlock = require('redlock');
const redis = require('redis');

const config = require('./config');
const logger = require('./logger');

const client = redis.createClient(config.getRedisConfig());

client.connect().catch(err => {
  logger.error('Redis connection error for Redlock:', err);
});

client.on('error', (err) => {
  logger.error('Redlock Redis client error:', err);
});

module.exports = new Redlock(
  [client], {
    driftFactor: 0.01,
    retryCount: 100,
    retryDelay: 100,
    retryJitter: 100
  }
);