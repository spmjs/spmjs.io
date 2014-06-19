# Spm Commands

---

`spm` have a collection of commands for pakcage lifecycle management.

There is a simple list of them, and you can type `spm help [command]` to learn more details.

![](https://i.alipayobjects.com/i/localhost/png/201405/2alMyZIHqB.png)

#### spm init
Init a package from template.

#### spm login
Login for getting permission.

#### spm install `[name[@version]]`
Install dependencies and engines to local folder.

#### spm publish
Publish a package.

#### spm unpublish `[name[@version]]`
Unpublish a package.

#### spm info `[name[@version]]`
Show infomation by package name.

#### spm search `[query]`
Search packages.

#### spm tree
Show the dependencies tree of the package.

#### spm doc `[build|watch|publish]`
Documentation management toolkit.

* spm doc build

  Build a demo package to `_site` folder.

* spm doc watch

  Build and start a watching server at http://127.0.0.1:8000.

* spm doc publish

  Publish `_site` folder to [spmjs.io](http://spmjs.io/). The demo url is `http://spmjs.io/docs/{{package-name}}`

#### spm test
Run test case in phantomjs.

#### spm build
Build package for browser.

* -O [dir] `output directory, default: dist`
* --include [include] `determine which files will be included, optional: relative, all, standalone`
  - relative `default`

    Only contain relative dependencies. Absolute dependencies should also be deployed so that it can run on Sea.js.
    ```js
    // would load abc, and abc's dependencies separately.
    seajs.use('abc');
    ```
  - all

    Contain relative and absolute dependencies.
    ```js
    // only need to load abc.
    seajs.use('abc');
    ```
  - standalone

    Build a standalone package that could be used in script tag way without any loader.
    ```html
    <script src="path/to/abc.js"></script>
    ```

* --ignore [ignore] `determine which id will not be transported`
* --idleading [idleading] `prefix of module name, default: {{name}}/{{version}}`
