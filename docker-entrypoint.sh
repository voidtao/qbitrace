#!/bin/bash
# 启动 Redis
redis-server --daemonize yes

# 启动应用
cd /pt/qbitrace
pm2 start app/app.js --name qbitrace
pm2 logs