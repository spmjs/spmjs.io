# spmjs.io

![](https://i.alipayobjects.com/i/localhost/png/201404/2YQnurYxW1.png)

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
- documentation in english
  * some great features in index page
  * 1. getting started (introduce and hello-world)
  * 2. delelop a module
  * 3. spm commands
  * 4. diff from spm2.x
- spm owner [ls|add|rm] ?
