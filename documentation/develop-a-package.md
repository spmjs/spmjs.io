# Develop A Package

---

You can follow the steps to develop a package using [spm](https://github.com/spmjs/spm).

```
$ spm --version
3.x.x
```

Make sure that spm@3.x is installed.

## init

```bash
$ mkdir now
$ cd now
$ spm init
```

```
Please answer the following:
[?] Package name (now)
[?] Version (1.0.0)
[?] Description
[?] Project git repository (git://github.com/afc163/now.git)
[?] Do you need to make any changes to the above before continuing? (y/N)

Writing .gitignore...OK
Writing .spmignore...OK
Writing .travis.yml...OK
Writing HISTORY.md...OK
Writing README.md...OK
Writing examples/index.md...OK
Writing index.js...OK
Writing package.json...OK
Writing tests/now-spec.js...OK

Initialized from template "init-template".

Done, without errors
```

Then you have a package named `now`.

## Install dependencies

Install default engines and devDependencies first.

```bash
$ spm install
```

We need [moment](http://momentjs.com) as a dependency which can be found [here](http://spmjs.io/package/moment).

```bash
$ spm install moment --save
```

## Code and Debug

Edit `index.js` as follow, just like nodejs.

```javascript
var moment = require('moment');
var now = moment().format('MMMM Do YYYY, h:mm:ss a');

module.exports = now;
```

Then edit `examples/index.md`:

<pre>
# Demo

---

## Normal usage

````javascript
seajs.use('index', function(now) {
  alert(now); // add this
});
````
</pre>


Run `spm doc watch` to start a documentation service at `127.0.0.1:8000` .

```bash
$ spm doc watch
```

Open [http://127.0.0.1:8000/examples/](http://127.0.0.1:8000/examples/) in browser to see the result.

Except using three &#96; in Markdown file, you can also use four &#96; to wrap your code.

It is a special rule that make your code highlighted and would be inserted to document page as a script block so they can be excuted at the same time. That is very useful for debugging your demo and writing a beautiful documentation both.

If you want to insert a iframe in your demo, make your code to `iframe` type.

<pre>
````iframe:600
I am in a iframe of 600px high
````
</pre>


> If you don't want to debug your code by `spm doc watch`, you can try [seajs-wrap](https://github.com/seajs/seajs-wrap) or [spm-server](https://github.com/spmjs/spm-server/) to debug `CommonJS` modules in development.

## Add Test Case

Edit test file at `tests/now-spec.js`. We introduce a default assert solution [expect.js](http://spmjs.io/package/expect.js).

```javascript
var expect = require('expect.js');
var now = require('../index');

describe('now', function() {

  it('normal usage', function() {
    expect(now).to.be.a('string');  // add this
  });

});
```

See tests result.

```bash
$ spm test
```

You can also open [http://127.0.0.1:8000/tests/runner.html](http://127.0.0.1:8000/tests/runner.html) in browser.

## Publish

Now you have a great package having wonderful function and complete tests case, you can publish the package to [spmjs.io](http://spmjs.io/).

```bash
$ spm publish
```

You should run `spm login` first to get permission, otherwise it would propmt the authorization problem. 

```bash
$ spm login
```

`username` is the name of your github account, and `authkey` can be found at http://spmjs.io/account after signing in.

> The package `now` is published by me, of cause. You should change other name and retry.

## Documentation

spmjs.io can host your package's documentation. What all you need to do is editing `README.md` and `examples` folder, preview it by `spm doc watch`, then publish it to spmjs.io.

```bash
$ spm doc publish
```

The documentation url is `http://spmjs.io/docs/{{name}}/` for latest version and `http://spmjs.io/docs/{{name}}/{{version}}/` for each versions.

For example, http://spmjs.io/docs/now/.

## Build

```bash
$ spm build
```

This command will build the files indicated by `spm.main` and `spm.output` field to `dist` folder. The `spm.buildArgs` would be executed as arguments.

The default build result is a package which could be deployed at cdn. Then you can use it by using [Sea.js](https://github.com/seajs/seajs/), [seajs@2.2.1](https://raw.githubusercontent.com/seajs/seajs/2.2.1/dist/sea.js) for example.


```html
<script src="http://cdn.example.com/path/to/sea.js"></script>
<script src="http://cdn.example.com/path/to/seajs-combo.js"></script><!-- If your need that -->
<script>
  seajs.config({
    base: 'http://cdn.example.com/',
    alias: {
      now: 'now/1.0.0/index.js'
    }
  });
  // load http://cdn.example.com/??now/1.0.0/index.js,moment/2.6.0/moment.js
  seajs.use(['now'], function(now) {
    console.log(now);
  });
</script>
```

You can also build a [standalone](/documentation/spm-commands#spm-build) package by adding an argument.

```bash
$ spm build --include standalone
```

```html
<!-- use it without loader -->
<script src="http://cdn.example.com/path/to/standalone.js"></script>
```

## Congratulation

Now you learn how to develop a package using spm, welcome to publish your packages here!
