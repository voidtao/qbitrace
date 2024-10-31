#!/bin/bash

# 安装node和redis
apt update&&apt upgrade -y
apt install lsb-release curl gpg
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
bash nodesource_setup.sh
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
apt update
apt install bash git nodejs npm redis -y
systemctl enable redis-server
systemctl start redis-server
npm install pm2 -g

PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 安装依赖
npm i --save


# 创建目录
mkdir -p \
  storage/data/rss \
  storage/data/client \
  storage/data/server \
  storage/data/rule/{delete,rss,race,raceSet,link} \
  storage/data/push \
  storage/data/script \
  storage/data/watch/set \
  storage/data/site \
  storage/data/irc \
  storage/data/race \
  storage/data/setting \
  storage/data/douban/set \
  webui/public/assets/styles \
  storage/logs \
  storage/data \
  storage/db \
  storage/torrents

# 备份和复制配置文件
cp app/config_backup/sql.db storage/db/sql.db
cp app/config_backup/*.yaml app/config/
cp app/config_backup/setting.json storage/data/
cp app/config_backup/setting.json storage/data/link-mapping.json
cp app/config_backup/setting.json storage/data/bulk-link-history.json
cp app/config_backup/torrent-history-setting.json storage/data/setting/
cp app/config_backup/torrent-mix-setting.json storage/data/setting/
cp app/config_backup/site-push-setting.json storage/data/setting/
cp app/config_backup/torrent-push-setting.json storage/data/setting/
cp app/config_backup/proxy.json storage/data/setting/

# 前端构建
cd webui
npm i --save --legacy-peer-deps

node light.js
node dark.js
node cyber.js

# 生成 cyber.less 文件
cat << EOF >> ./public/assets/styles/cyber.less

@import url(/api/setting/getBackground.less);

.body-bg {
  background:@vt-bg-image;
  background-position-x:center;
  background-position-y:center;
  background-size:cover;
}

.login-layout {
  background:@body-background;
}
EOF

# 创建 follow.less 文件
touch ./public/assets/styles/follow.less

npm i --scripts-prepend-node-path
npm run build --scripts-prepend-node-path

cd ..

service redis-server start
service redis-server stop
# 启动应用
pm2 start redis-server
pm2 start app/app.js --name qbitrace
pm2 save