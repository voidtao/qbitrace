#!/bin/bash
set -e

# 检查是否已经初始化过数据
if [ -z "$(ls -A /pt/qbitrace/storage)" ]; then
    echo "Initializing storage directory with default data..."
    cp -r /pt/qbitrace/storage.init/* /pt/qbitrace/storage/
fi

# 启动 Redis 服务
redis-server --daemonize yes

# 等待 Redis 启动
sleep 2

# 启动应用并保持前台运行
cd /pt/qbitrace
pm2 start app/app.js --name qbitrace
pm2 logs --no-daemon