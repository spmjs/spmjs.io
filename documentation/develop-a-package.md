# Develop A Package

---

You can follow the steps to develop a package using spm (should install spm@3.x first).

```
$ spm -V
3.0.0
```

Make sure that spm@3.x is installed.

## init

```
$ mkdir now
$ spm init
```

```
Please answer the following:
[?] Package name (now)
[?] author afc163
[?] Version (1.0.0)
[?] Description (The best project ever.)
[?] Project git repository (git://github.com/afc163/now.git)
[?] Project homepage (https://github.com/afc163/now)
[?] Licenses (MIT)
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

```
$ spm install
```

We need [moment](http://momentjs.com) as a dependency which can be found [here](http://spmjs.io/package/moment).

```
$ spm install moment --save
```

## Code and Debug

Edit `src/now.js` as follow, just like nodejs.

```js
var moment = require('moment'); // in
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

```
$ spm doc watch
```

Open [http://127.0.0.1:8000/examples/](http://127.0.0.1:8000/examples/) in browser to see the result.

Use three ` is a basic way to write code in Markdown file.

Here you can also use four ` to wrap your code. It is a special rule that make your code highlighted and would be inserted to document page as a script block so they can be excuted at the same time. That is very useful for debugging your demo and writing a beautiful documentation both.

## Add Test Case

Edit test file at `tests/now-spec.js`. We introduce a default assert package [expect](http://spmjs.io/package/expect).

```
var expect = require('expect');
var now = require('../index');

describe('now', function() {

  it('normal usage', function() {
    expect(now).to.be.a('string');  // add this
  });

});
```

See tests result.

```
$ spm test
```

You can also open [http://127.0.0.1:8000/tests/runner.html](http://127.0.0.1:8000/tests/runner.html) in browser.

## Publish

Now you have a great package having wonderful function and complete tests case, you can publish the package to [spmjs.io](http://spmjs.io/).

```
$ spm publish
```

You should run `spm login` first to get permission, otherwise it would propmt the authorization problem. 

```
$ spm login
```

`username` is the name of your github account, and `authkey` can be found at http://spmjs.io/account after signing in.

> The package `now` is published by me, of cause. You should change other name and retry.

## Documentation

spmjs.io can host your package's documentation. What all you need to do is editing 'README.md' and 'examples', preview it by `spm doc watch`, then publish it to spmjs.io.

```
$ spm doc publish
```

The documentation url is `http://spmjs.io/docs/{{name}}` for latest version and `http://spmjs.io/docs/{{name}}/{{version}}` for each versions.

For example, http://spmjs.io/docs/now/.

## Build

```
$ spm build
```

This command will build the files indicated by `spm.main` and `spm.output` field to `dist` folder. The `spm.buildArgs` would be executed as arguments.

The build result is a package which cound be deployed at cdn. You can run it on the website where deployed [Sea.js](https://github.com/seajs/seajs/).


```
<script src="http://cdn.example.com/path/to/sea.js"></script>
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

## Congratulation

Now you learn how to develop a package using spm, welcome to publish your packages here!
