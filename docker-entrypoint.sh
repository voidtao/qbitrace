#!/bin/bash
set -e

# 使用 gosu 切换到 redis 用户启动 redis-server
if [ -z "$(ls -A /pt/qbitrace/storage)" ]; then
    echo "Initializing storage directory with default data..."
    cp -r /pt/qbitrace/storage.init/* /pt/qbitrace/storage/
    # 确保复制后的文件权限正确
    chown -R qbitrace:qbitrace /pt/qbitrace/storage
fi

# 以非特权用户身份启动 redis
sudo -u redis redis-server --daemonize yes

# 等待 Redis 启动
sleep 2

# 确保工作目录权限正确
cd /pt/qbitrace

# 以 qbitrace 用户身份启动应用
exec pm2 start app/app.js --name qbitrace && pm2 logs --no-daemon