## 原始项目
https://github.com/vertex-app/vertex
原始项目的开源许可证为mit，具体参见LICENSE.origin.txt
## 相较于原版的改动

0. 此版本不会有任何超出源版本的功能。

1. 改动了 tracker 信息的获取机制（该改动会增大 qbittorrent 负担，并未合并到原版内）。

2. 更新所有 package 最新版本，以下除外：

   -  `ant-design-vue` 4.x 版本放弃了 less，重写与测试工作量较大。
   -  `bencode` 该模块在 2.0.3 之后从 commonjs 转向 esm，模块混用测试工作量较大。
   -  `redis` `connect-redis` 这两个包都把调用方式改了，重写与测试工作量较大。
   -  `eslint` `eslint9` 更改了配置文件，自动转换效果不好，重写与测试工作量较大。
   -  `less` `less-loader` 升级版本会出现内联 javascript 的问题，因为 `ant-design-vue` 已经不采用 less，重写与测试不值得。

3. 改动了部分结构，使其符合 ecma14 规范。

4. 默认改为实机部署，以方便和python脚本交互。

5. 默认监听 127.0.0.1，强制反向代理。

6. 删除所有自动观影相关的前端内容（后端删除太费时间了/(ㄒoㄒ)/~~）。

7. 改动了相关的数据存储方式，便于备份还原。

## 计划的修改


## 已知的问题

1. `log4js` 的 `defaultParseCallStack error` 报错 [log4js-node/log4js-node#1413](https://github.com/log4js-node/log4js-node/issues/1413)
2. pt.soulvoice.club 在原始代码中，获取rss时需要带上cookie，我删除了site模块，没号进行测试，因而处理办法为硬编码cookie进代码，填写位置为app/libs/rss.js（主要现在对代码全局还不熟悉，不然直接使用抓免中填写的cookie应该问题不大）

## 不会提供的功能

1. moviepilot ptpp autobrr所含有的相关功能，这些软件已高度发达到难以替代。

