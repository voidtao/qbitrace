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

COPY --from=builder /pt/qbitrace/app /pt/qbitrace/app
COPY --from=builder /pt/qbitrace/node_modules /pt/qbitrace/node_modules
RUN mkdir -p /pt/qbitrace/storage.init
COPY --from=builder /pt/qbitrace/storage /pt/qbitrace/storage.init

RUN apt update && \
    apt install -y redis-server && \
    npm install pm2 -g && \
    npm cache clean --force && \
    apt-get clean && \
    rm -rf \
        /root/.cache \
        /root/.npm/_cacache \
        /var/lib/apt/lists/* \
        /var/tmp/* \
        /tmp/*

WORKDIR /pt/qbitrace
EXPOSE 3000

COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]