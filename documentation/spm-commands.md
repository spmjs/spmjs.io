# Spm Commands

---

`spm` have a collection of commands for package lifecycle management.

There is a simple list of them, and you can type `spm [command] -h` to learn more details.

![](https://t.alipayobjects.com/images/T1Rj8cXhl5XXXXXXXX.png)

#### spm init
Init a package from template.

#### spm login
Login for getting permission.

#### spm install [name[@version]]
Install dependencies and engines to local folder.

#### spm publish
Publish a package.

#### spm unpublish [name[@version]]
Unpublish a package.

#### spm info [name[@version]]
Show information by package name.

#### spm search [query]
Search packages.

#### spm ls
Show the dependencies tree of the package.

#### spm doc [build|watch|publish]
Documentation management toolkit.

* spm doc

  Alias for `spm doc watch`.

* spm doc watch

  Build and start a watching server of demo site at http://127.0.0.1:8000 .

* spm doc build

  Build a demo package to `_site` folder.

* spm doc publish

  Publish `_site` folder to [spmjs.io](http://spmjs.io/). The demo site url is `http://spmjs.io/docs/{{package-name}}`

#### spm test

Run test case in phantomjs.

#### spm build

Build package for browser.

##### -O [dir]

  output directory, default: `dist`

##### -o [file] `since 3.4.0+`

  output single file.

  ```
  spm build index.js -o build.js
  ```

##### -s --standalone `since 3.4.0+`

  Build a standalone package that could be used in script tag way without any loader,
  equal with `--include standalone`.

##### --sea [mode] `since 3.4.0+`

  Build a [CMD](https://github.com/cmdjs/specification/blob/master/draft/module.md) package that could be loaded by [Sea.js](https://github.com/seajs/seajs), equal with `--include [relative|all]`.

  - relative `default`

    Only contain relative dependencies. Absolute dependencies should be online so that it can be loaded dynamicly.
    ```js
    // would load the-module, and load the-module's dependencies dynamicly.
    seajs.use('the-module');
    ```

  - all

    Contain relative and absolute dependencies.
    ```js
    // only load the-module, all dependencies will be packed in the-module.js.
    seajs.use('the-module');

##### --umd `since 3.4.0+`

  Build a umd package for both loader and global usage.

##### --include [include] `Deprecated`

  Determine which files will be included, optional: `relative`, `all`, `standalone`, `umd`.

  Deprecated, use --standalone, --umd [umd] and --sea <sea> instead.

  - relative `default`

    Only contain relative dependencies. Absolute dependencies should be online so that it can be loaded dynamicly.
    ```js
    // would load the-module, and load the-module's dependencies dynamicly.
    seajs.use('the-module');
    ```

  - all

    Contain relative and absolute dependencies.
    ```js
    // only load the-module, all dependencies will be packed in the-module.js.
    seajs.use('the-module');

    ```

  - standalone

    Build a standalone package that could be used in script tag way without any loader.
    ```html
    <script src="path/to/the-module.js"></script>
    ```

  - umd

    Build a umd package for both loader and global usage.


##### --ignore [ignore]

  Determine which id will not be transported.

##### --skip [skip]

  Determine which id will not be parsed when analyse.

##### --global [jquery:$,underscore:\_]

  Replace package name to global variable, format `jquery:$,underscore:_`.

##### --idleading [idleading]

  Prefix of module name, default: `{{name}}/{{version}}`.
