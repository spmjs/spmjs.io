# spmjs.io

The distributed packaging server perfectly matching with [spm3.x](https://github.com/spmjs/spm/tree/master). Now `spmjs.io` is rewrited in javascript from [Yuan](https://github.com/spmjs/yuan/)(the precursors), and it is faster, more powerful and easier to deploy.

![](https://i.alipayobjects.com/i/localhost/png/201404/2YQxOTYoFp.png)

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
- data backup
- spm build integration
- great features in index page
  * for browser
  * commonjs and seajs
  * local development
  * document hosted
  * css module
  * powerful command line tool
- documentation in english
  * 1. getting started (introduce and hello-world)
  * 2. delelop a module
  * 3. spm commands
  * 4. diff from spm2.x
- spm owner [ls|add|rm] ?
