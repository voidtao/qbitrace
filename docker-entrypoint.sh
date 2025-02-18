#!/bin/bash
set -e

# 如果 storage 目录为空, 则初始化
if [ -z "$(ls -A /pt/qbitrace/storage)" ]; then
    echo "Initializing storage directory with default data..."
    cp -r /pt/qbitrace/storage.init/* /pt/qbitrace/storage/
fi

# 使用 Unix socket 方式启动 Redis
redis-server --unixsocket /tmp/redis.sock --unixsocketperm 777 --daemonize yes

# 等待 Redis 启动
sleep 2

# 切换工作目录
cd /pt/qbitrace

# 启动应用并输出日志
npx pm2 start app/app.js --name qbitrace 

npx pm2 logs --no-daemon