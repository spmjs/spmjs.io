# spmjs.io

[![David Status](http://img.shields.io/david/spmjs/spmjs.io.svg?style=flat)](https://david-dm.org/spmjs/spmjs.io)

`spmjs.io` is the distributed packaging server perfectly matching with [spm@3.x](https://github.com/spmjs/spm/tree/master). Now it is rewritten in javascript from [Yuan](https://github.com/spmjs/yuan/)(the precursors), and is faster, more powerful and easier to deploy.

![](https://i.alipayobjects.com/i/localhost/png/201404/2YQxOTYoFp.png)

## Install

```bash
$ git clone git://github.com/spmjs/spmjs.io.git
$ cd spmjs.io
$ npm install
```

## Config

```bash
$ cp config/base.default.yaml config/base.yaml
```

Modify `config/base.yaml` as you need.

## Deploy

Start and stop server by a simple command. (For Unix/Linux)

```bash
$ npm start
```

```bash
$ npm stop
```

Then you have a complete package source server which can interact with [spm3.x](https://github.com/spmjs/spm/tree/master) after add the server address to `~/.spm/spmrc-3x`.

```ini
[source:default]
url = http://127.0.0.1:3000
```

Reindex the packages for elastic search.

```bash
$ npm run reindex
```

## elasticsearch

Require Java 7 environment : https://github.com/Homebrew/homebrew/issues/29910

## TODO:

- packages sync server
- data backup
- spm owner [ls|add|rm] ?
