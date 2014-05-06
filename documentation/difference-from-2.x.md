# Difference From spm@2.x

---

[spm@3.x](https://github.com/spmjs/spm/tree/master) is new version of [spm@2.x](https://github.com/spmjs/spm/tree/2.x), we have a collection of updates now.

- [spmjs.org](https://spmjs.org) is package service for spm@2.x, now is [spmjs.io](http://spmjs.io) which is prettier and easier to [deploy in your compony](https://github.com/spmjs/spmjs.io/).
- Change spm profile from `~/.spm/spmrc` to `~/.spm/spmrc-3x`.
- `family` is removed from package.json.
- `spm.alias` is replaced by `spm.dependencies` now.
- `spm doc`, `spm init`, `spm build`, `spm test` are integrated to spm commands.
- [docs.spmjs.org](http://docs.spmjs.org) is old documentation for spm@2.x.
- No need to build first before publish, the package only contains source code. Building is needed just before using in your website.
