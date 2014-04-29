# spmjs.io

[![NPM version](https://badge.fury.io/js/spmjs.io.png)](http://badge.fury.io/js/spmjs.io)
[![David Status](https://david-dm.org/afc163/spmjs.io.png)](https://david-dm.org/afc163/spmjs.io)

The distributed packaging server perfectly matching with [spm3.x](https://github.com/spmjs/spm/tree/master).
[Yuan](https://github.com/spmjs/yuan/) is the precursors. Now `spmjs.io` is rewrited in javascript, and it is faster, more powerful and easier to deploy.

## Install

```bash
$ git clone git://github.com/spmjs/spmjs.io.git
$ cd spmjs.io
$ npm install
```

## Config

Modify `config/base.yaml` as you need.

## Deploy

Start and stop server by a simple command.

```bash
$ npm run start
```

```bash
$ npm run stop
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

## TODO:

- packages sync server
- spm owner [ls|add|rm] ?
