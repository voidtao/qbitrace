FROM debian:stable AS builder
ARG PAT
RUN apt update && apt upgrade -y && apt install -y git bash && \
    git clone https://${PAT}@github.com/voidtao/qbitrace.git /pt/qbitrace && \
    cd /pt/qbitrace && \
    bash install.sh

FROM node:lts-slim
LABEL maintainer="qbitrace"
LABEL build_from="https://github.com/voidtao/qbitrace"
ENV TZ=Asia/Shanghai

# 创建非 root 用户和必要的目录
RUN groupadd -r qbitrace && useradd -r -g qbitrace -m -s /sbin/nologin qbitrace && \
    mkdir -p /pt/qbitrace/storage.init /pt/qbitrace/storage && \
    chown -R qbitrace:qbitrace /pt/qbitrace

COPY --from=builder /pt/qbitrace/app /pt/qbitrace/app
COPY --from=builder /pt/qbitrace/node_modules /pt/qbitrace/node_modules
COPY --from=builder /pt/qbitrace/storage /pt/qbitrace/storage.init
COPY docker-entrypoint.sh /

RUN apt update && \
    apt --no-install-recommends install -y redis-server sudo && \
    npm install --ignore-scripts pm2 -g && \
    npm cache clean --force && \
    # 添加 sudo 配置
    echo "qbitrace ALL=(redis) NOPASSWD: /usr/bin/redis-server" >> /etc/sudoers.d/qbitrace && \
    chmod 0440 /etc/sudoers.d/qbitrace && \
    # 设置入口脚本权限
    chmod +x docker-entrypoint.sh && \
    # 清理
    apt-get clean && \
    rm -rf \
        /root/.cache \
        /root/.npm/_cacache \
        /var/lib/apt/lists/* \
        /var/tmp/* \
        /tmp/* && \
    chown -R qbitrace:qbitrace /pt/qbitrace

WORKDIR /pt/qbitrace

# 最后才切换到非 root 用户
USER qbitrace

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]