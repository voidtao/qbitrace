## 原始项目

[vertex 原始仓库](https://github.com/vertex-app/vertex)  
开源许可证：MIT
---

## 相较于原版的改动

1. **删除 trackersync 相关功能**  
   - 原先为遍历所有 vt 添加的种子  
   - 后改为遍历所有qbittorrent种子，实际负担过大
   - 现直接删了，建议改为外部 Python 脚本定期任务处理

2. **更新所有软件包至最新版本，以下除外：**  
   - `ant-design-vue` 4.x 废弃了 less，需要大量重写和测试  
   - `bencode` 2.0.3 后转向 esm，兼容性测试工作量大  
   - `redis`、`connect-redis` 新调用方式，需要重写和测试  
   - `eslint` 9.x 改动配置文件，自动转换效果差  
   - `less`、`less-loader` 升级后会出现内联 JS 问题，重新编译不值得

3. **部分结构调整，符合 ECMA 14 规范**

4. **默认启用物理机部署**  
   - 便于与 Python 脚本交互

5. **默认监听 127.0.0.1**  
   - 强制反向代理

6. **删除其余可替代功能**

7. **调整数据存储方式**  
   - 便于备份与还原

8. **删除清除历史记录功能**  
   - 可通过定时脚本实现

---

## 计划的修改

1. **更改数据结构，改为redis存储删种数据，sqllite存储rss历史数据**  

---

## 已知的问题

1. `log4js` 的 `defaultParseCallStack error`  
   参见 [log4js-node #1413](https://github.com/log4js-node/log4js-node/issues/1413)

2. `pt.soulvoice.club` 获取 RSS 时需带上 Cookie  
   - 删除 site 模块且无号可测试  
   - 目前硬编码 Cookie 至 `app/libs/rss.js`
   - 理论上可以改为填写抓免栏的 Cookie，然后取消勾选抓免功能。

---

## 不会提供的功能

1. `moviepilot`、`ptpp`、`autobrr` 中的相关功能  
   - 这些软件已高度成熟，难以替代