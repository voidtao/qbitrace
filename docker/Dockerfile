FROM node:20-alpine
LABEL maintainer="voidtao"
LABEL build_from="https://github.com/voidtao/vertex"

ENV TZ=Asia/Shanghai
RUN \
  apk add --no-cache gcc g++ python3 git cmake make npm libc-dev xvfb libstdc++ chromium harfbuzz nss redis freetype ttf-freefont font-noto-emoji tzdata bash shadow && \
  rm -rf /var/cache/* && mkdir /var/cache/apk && \
  git clone https://github.com/voidtao/vertex.git /app/vertex && \
  cd /app/vertex && \
  git checkout COMMIT_ID && \
  rm .git webui -rf && \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm i --save && \
  mkdir /vertex && \
  ln -s /vertex/data /app/vertex/app/data && \
  ln -s /vertex/db /app/vertex/app/db && \
  ln -s /vertex/logs /app/vertex/logs && \
  ln -s /vertex/torrents /app/vertex/torrents && \
  mv /app/vertex/app/config /app/vertex/app/config_backup && \
  ln -s /vertex/config /app/vertex/app/config && \
  ln -s /app/localtime /etc/localtime && \
  chmod +x /usr/bin/chromium && \
  apk del gcc g++ python3 git cmake make npm libc-dev && \
  echo 'bind 127.0.0.1' >> /app/redis.conf && \
  echo 'daemonize yes' >> /app/redis.conf && \
  echo 'vm.overcommit_memory = 1' >> /etc/sysctl.conf
COPY src/static /app/vertex/app/static
RUN \
  useradd -d /app/vertex -s /bin/sh vt && \
  chown -R vt /vertex && \
  chmod +x /vertex
EXPOSE 3000
CMD \
  bash /app/vertex/docker/start.sh
