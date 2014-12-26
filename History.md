1.3.0 / 2014-12-26
==================

* 对 `publish -f` 和 `unpublish` 进行调整，只允许管理员进行操作。#81
* 增加对于 semver 版本号的下载支持。#81
* 用 [markdown-it](https://github.com/markdown-it/markdown-it) 代替 [marked](https://github.com/chjj/marked/)。
* 用 [pm2](https://github.com/Unitech/PM2/) 代替 forever 。#90
* 将 `elasticsearch.tar.gz` 移出仓库。#88
* [提升了首页的加载性能](https://github.com/spmjs/spmjs.io/commit/573d7d39dc32ae1d7cfcfc2aff872e8220e0f436)。
* 修复解析 md 文件里长 html 字符串时太慢的[问题](https://github.com/spmjs/spm/issues/1067)。
* 简化了 badge 的文案。
* [改进了 `/repository/search` 的输出格式](https://github.com/spmjs/spmjs.io/commit/7d91382dd6696e98c21f4e9713f6272bc5d9506d)。
* 部分依赖升级。

1.2.0 / 2014-09-09
==================

* 源同步方案。#53
* 发布白名单[方案](https://github.com/spmjs/spmjs.io/commit/3a16e98a70b3b642344eb99a0df8b6eb896b1afe)。
* 增加搜索框提示功能。
* 修复了一个 unpublish 导致模块依赖信息出错的问题。https://github.com/spmjs/spm/issues/948
* 一些样式、图标、信息架构上的优化。

1.1.2 / 2014-07-17
==================

* elasticsearch 升级到 1.3.0，修复命令执行漏洞。http://news.mydrivers.com/1/306/306326.htm
* github 账户权限修改为只读。#52

1.1.1 / 2014-07-17
==================

* 默认配置从 base.yaml 移到 base.default.yaml，部署前需要拷贝
* 修复 404 页面报错的问题

1.1.0 / 2014-07-16
==================

  * 增加今日下载次数和最近下载列表。
  * 增加了一个获取所有模块详细信息的接口。#44
  * 文档托管服务使用 [serve-spm](https://github.com/spmjs/serve-spm) 进行重构。#43
  * 更新了 badge 为扁平化样式。
  * 更新了默认的 base.yaml 配置。
  * 更新了底部UI。
  * 更新了部分文档。
  * 修复搜索结果排序的问题。#42
  * 修复最新版本号排序错误的问题。
  * 修复一个 repository 格式导致的报错。#29
  * 修复大量文案错误。

1.0.0 / 2014-06-10
==================

  * Initial release

