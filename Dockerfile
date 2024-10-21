FROM debian:stable-slim
LABEL maintainer="qbitrace"
LABEL build_from="https://github.com/voidtao/qbitrace"

ENV TZ=Asia/Shanghai

# 使用构建参数 PAT 克隆私有仓库
ARG PAT
RUN \
    apt update&&apt install git bash -y && \
    git clone https://${PAT}@github.com/voidtao/qbitrace.git /pt/qbitrace && \
    cd /pt/qbitrace && \
    bash install.sh && \
    apt-get autoclean && \
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
        /var/lib/apt/lists/* \
        /var/tmp/* \
        /tmp/*

EXPOSE 3000