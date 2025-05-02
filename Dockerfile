FROM debian:stable AS builder
ARG PAT
RUN apt-get update && apt-get upgrade -y && apt-get install -y git bash && \
    git clone -b dev https://${PAT}@github.com/voidtao/qbitrace.git /pt/qbitrace && \
    cd /pt/qbitrace && \
    bash install.sh

FROM node:lts-slim
LABEL maintainer="qbitrace"
LABEL build_from="https://github.com/voidtao/qbitrace"
ENV TZ=Asia/Shanghai

# 创建非 root 用户和必要的目录
RUN mkdir -p /pt/qbitrace/storage.init /pt/qbitrace/storage

COPY --from=builder /pt/qbitrace/app /pt/qbitrace/app
COPY --from=builder /pt/qbitrace/node_modules /pt/qbitrace/node_modules
COPY --from=builder /pt/qbitrace/storage /pt/qbitrace/storage.init

COPY docker-entrypoint.sh /

RUN apt-get update && \
    apt-get install --no-install-recommends -y redis-server && \
    # 创建 redis 数据目录并设置权限
    mkdir -p /var/lib/redis && \
    chown redis:redis /var/lib/redis && \
    chmod 770 /var/lib/redis && \
    # 设置应用目录权限
    chown -R www-data:www-data /pt/qbitrace && \
    chmod +x /docker-entrypoint.sh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /root/.cache

WORKDIR /pt/qbitrace

USER www-data

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]