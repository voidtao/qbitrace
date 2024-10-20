#!/bin/bash

# 环境变量设置
apt update&&apt upgrade -y
apt install nodejs npm redis-server -y
npm install pm2 -g

PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 安装依赖
npm i --save


# 创建目录
mkdir -p \
  app/data/rss \
  app/data/client \
  app/data/server \
  app/data/rule/{delete,rss,race,raceSet,link} \
  app/data/push \
  app/data/script \
  app/data/watch/set \
  app/data/site \
  app/data/irc \
  app/data/race \
  app/data/setting \
  app/data/douban/set \
  webui/public/assets/styles \
  logs \
  app/data \
  app/db \
  torrents

# 备份和复制配置文件
cp app/config_backup/sql.db app/db/sql.db
cp app/config_backup/*.yaml app/config/
cp app/config_backup/setting.json app/data/
cp app/config_backup/setting.json app/data/link-mapping.json
cp app/config_backup/setting.json app/data/bulk-link-history.json
cp app/config_backup/torrent-history-setting.json app/data/setting/
cp app/config_backup/torrent-mix-setting.json app/data/setting/
cp app/config_backup/site-push-setting.json app/data/setting/
cp app/config_backup/torrent-push-setting.json app/data/setting/
cp app/config_backup/proxy.json app/data/setting/

# 前端构建
cd webui
npm i --save --legacy-peer-deps

node light.js
node dark.js
node cyber.js

# 生成 cyber.less 文件
cat << EOF > ../app/static/assets/styles/cyber.less
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

systemctl start redis-server

# 启动应用
PORT=3000 pm2 start app/app.js