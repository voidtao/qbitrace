## 原始项目
**[vertex 仓库](https://github.com/vertex-app/vertex)**  
数据库不兼容，无法直接导入
---
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voidtao_qbitrace&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=voidtao_qbitrace)
---
**可手动复制配置文件导入，其他配置兼容。**  
**大规模商业使用建议使用原版vertex，本项目未计划提供商业支持**  
**使用第三方提供的本软件请向第三方咨询技术支持**  
**欢迎提issue，我会尽快回复，空闲时会尽量解决**
---
本机安装命令
```
git clone https://github.com/voidtao/qbitrace.git /pt/qbitrace
cd /pt/qbitrace
bash install.sh
```
---
docker 安装命令
```
mkdir -p /app/qbitrace/storage
sudo chown -R www-data:www-data /app/qbitrace/storage
sudo chmod -R 755 /app/qbitrace/storage
docker run -d --name qbitrace --restart unless-stopped --network host -v /app/qbitrace/storage:/pt/qbitrace/storage -e TZ=Asia/Shanghai -e HOST=0.0.0.0 taovoid/qbitrace:latest
```
---

## 相较于原版的改动

1. **删除 trackersync 相关功能**  
   - 原先为遍历所有 vt 添加的种子  
   - 后改为遍历所有qbittorrent种子，实际负担过大
   - 现直接删了，建议改为外部 Python 脚本定期任务处理

2. **更新所有软件包至新版本，以下除外：**  
   - `bencode` 2.0.3 后转向 esm，没有必须进行混用的升级项。
   - `redis`、`connect-redis` 新调用方式，没有必须升级的功能 。
   - `eslint` 9.x 改动配置文件，自动转换效果差  

3. **部分结构调整，符合 ECMA 14 规范**

4. **默认启用物理机部署**  
   - 便于与 Python 脚本交互

5. **默认监听 127.0.0.1**  
   - 强制反向代理

6. **删除了一系列可替代功能**

7. **调整数据存储方式**  
   - 便于备份与还原

8. **删除清除历史记录功能**  
   - 可通过定时脚本实现

9. **更改数据结构**  
   - 现在sqllite数据库共三张表
   - 1.torrent_r 用于记录通过qbitrace的rss功能添加的数据。
   - 2.torrent_d 用于记录通过qbitrace的删种功能删除的种子，仅在删种时进行记录
   - 3.client_q 用于记录qbittorrent的随时间变化的基本数据。

10. **调整soulvoice.club**
   - 在原始代码中，`pt.soulvoice.club` 获取 RSS 时需带上 Cookie  
   - 原先使用site模块参数实现，我把这个模块删了 ，改为从rss模块获取
   - 使用方法为：
   1.手动更改storage/data/rss/下该站点的文件名为soul1234.json
   2.填写抓免栏的 Cookie，保存，然后取消勾选抓免功能，保存。
   （其他更优雅的实现需要改动函数过多，碰到这种需要带cookie进行rss的，更推荐使用jackett）

11. **尝试性支持jackett**
   - 需要反向代理域名内包含jackett
   - rss链接形如jackett.1.com/api/v2.0/indexers......
   - 对于jackett的rss链接，最好打开跳过大小相同种子的功能，容错更高。

12. **删除fakehash与truehash**
   - 对于没有hash的rss链接，改为由链接地址生成hash
   - 不再补充记录真实hash，torrent_r中的hash仅用于去重

13. **更改缓存方式**
   - 现在缓存为在app/common/Rss.js统一进行，缓存50秒，而不在app/libs/rss.js进行。
   - 缓存的应用场景为对相同rss链接创建多个任务，其他场景请调大rss周期。
---

## 计划的修改
   - i18n支持（但感觉没有必要，外站大多有irc，而本软件核心为rss。） 

---

## 已知的问题

1. `log4js` 的 `defaultParseCallStack error`  
   参见 [log4js-node #1413](https://github.com/log4js-node/log4js-node/issues/1413)


---

## 不会提供的功能

1. `moviepilot`、`ptpp`、`autobrr` 中的相关功能  
   - 这些软件已高度成熟，难以替代