#!/bin/bash

# 安装node和redis
apt update&&apt upgrade -y

apt install lsb-release curl gpg -y

curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh

bash nodesource_setup.sh

apt update

apt install bash git nodejs redis-server -y

systemctl enable redis-server

systemctl start redis-server

npm install pm2 -g

PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 安装依赖
npm i --save


# 创建目录
mkdir -p \
  storage/data \
  storage/data/rss \
  storage/data/client \
  storage/data/rule/{delete,rss} \
  storage/data/push \
  storage/data/script \
  storage/data/setting \
  webui/public/assets/styles \
  storage/logs \
  storage/db \
  storage/torrents

# 备份和复制配置文件
cp app/config_backup/sql.db storage/db/sql.db
cp app/config_backup/*.yaml app/config/
cp app/config_backup/setting.json storage/data/
cp app/config_backup/setting.json storage/data/link-mapping.json
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

npm i --legacy-peer-deps --save-dev
npm run build

cd ..

service redis-server start
service redis-server stop
# 启动应用
pm2 start redis-server
pm2 start app/app.js --name qbitrace
pm2 save