const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const redisClient = new Redis({ host: '127.0.0.1', port: 6379 });

const maxWrongAttemptsByIPperHour = 100;
const maxWrongAttemptsByUsernameAndIP = 5;

const limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_ip',
    points: maxWrongAttemptsByIPperHour,
    duration: 60 * 60 // per hour
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_consec',
    points: maxWrongAttemptsByUsernameAndIP,
    duration: 60 * 60 * 24 // keep for 24h
});

module.exports = { limiterSlowBruteByIP, limiterConsecutiveFailsByUsernameAndIP }