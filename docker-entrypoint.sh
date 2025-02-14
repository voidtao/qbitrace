#!/bin/bash
set -e

# 启动 Redis 服务
redis-server --daemonize yes

# 等待 Redis 启动
sleep 2

# 启动应用并保持前台运行
cd /pt/qbitrace
pm2 start app/app.js --name qbitrace
pm2 logs --no-daemon