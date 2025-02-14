FROM debian:stable-slim AS builder
ARG PAT
RUN apt update && apt install -y --no-install-recommends git bash && \
    git clone https://${PAT}@github.com/voidtao/qbitrace.git /pt/qbitrace && \
    cd /pt/qbitrace && \
    bash install.sh

FROM node:lts-slim
LABEL maintainer="qbitrace"
LABEL build_from="https://github.com/voidtao/qbitrace"
ENV TZ=Asia/Shanghai

COPY --from=builder /pt/qbitrace /pt/qbitrace

RUN apt update && \
    apt install -y --no-install-recommends bash redis-server && \
    npm install pm2 -g && \
    npm cache clean --force && \
    apt-get clean && \
    rm -rf \
        /pt/qbitrace/.github \
        /pt/qbitrace/webui \
        /pt/qbitrace/.eslintrc.yml \
        /pt/qbitrace/.gitignore \
        /pt/qbitrace/Dockerfile \
        /pt/qbitrace/install.sh \
        /pt/qbitrace/package-lock.json \
        /pt/qbitrace/package.json \
        /pt/qbitrace/README.md \
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