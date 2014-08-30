# Getting Started

---

## Introdution

[spm](https://github.com/spmjs/spm) is a powerful and integrated static package manager designed for browser-side solutions including JavaScript, CSS and template.

[![](https://i.alipayobjects.com/i/localhost/png/201404/2YQxOTYoFp.png)](https://github.com/spmjs/spm)

All packages in `spmjs.io` are organized by CommonJS, run on [Sea.js](https://github.com/seajs/seajs). We supply a complete lifecycle managment of package by using [spm](https://github.com/spmjs/spm), including the following features:

- Initialization
- Dependencies Installation
- Local Development
- Publishing on [spmjs.io](http://spmjs.io)
- Test Runner
- Documentation Host
- Build

[spmjs.io](http://spmjs.io/) is packages management service for spm. You can browse for packages you need, or publish your package here.

`spmjs.io` is a new version of [spmjs.org](https://spmjs.org/) which is based on the old `spm@2.x`.

## Installation

```bash
$ npm install spm -g
```

> `npm install spm@2.x -g` for old spm2.

## Basic Usage

Init a spm package.

```bash
$ mkdir example
$ cd example
$ spm init
```

Install dependencies.

```bash
$ spm install jquery --save
$ spm install moment@2.6.0 --save
```

Publish the package to [spmjs.io](http://spmjs.io/)

```bash
$ spm publish
```

> You should run `spm login` first to get permission. The `authkey` will be displayed at http://spmjs.io/account after signing in.

Add `.spmignore` for ignoring useless files to avoid oversize of package.

## Contribution

Anyone is welcome to contribute by the following ways.

- [Bug reports](https://github.com/spmjs/spm/issues)
- [Feature requests](https://github.com/spmjs/spm/issues)
- [Pull requests](https://github.com/spmjs/spm/pulls)
- Promote spm on your social network.
