# Handle css and template

---

Css and html template are significant parts in front-end development, and spm is just good for it.

## Css

The spm package could be a pure css package, use `main` and `output` to specify endpoint files.

For Example, there is a `main-style` package for our site layout:

```
button.css
tip.css
index.css
package.json
```

```json
{
  "name": "main-style",
  "version": "1.0.0",
  "spm": {
    "dependencies": {
      "normalize.css": "3.0.1"
    },
    "main": "index.css"
  }
}
```

Simply import files and other packages  by a standard `@import`.

```
/* index.css */
@import url('normalize.css');

@import url('./button.css');
@import url('./tip.css');
```

[alice-button](https://github.com/aliceui/button) is a nice example as well.

You can also require css package in js file, just like js package but without exports.

```
require('main-style');
var moment = require('moment');
```

spm will use [import-style](http://spmjs.io/package/import-style) to import css package's content after building.


## Template

Fisrtly, write your template in file, named it as `*.html` or `*.tpl` or `*.handlebars`.

```html
<!-- defalut.tpl -->
<div>
  <span>{{name}}</span>
  <span>{{content}}</span>
</div>
```

Then require it in js file.

```js
var Handlebars = require('handlebars');
var source = require('./defalut.tpl'); // string content of defalut.tpl

var template = Handlebars.compile(source);  // compile it with your compiler
var result = template({
  name: 'alex',
  content: 'content'
});
```

If the extension is `.handlebars`, `spm build` will precompile it and import [handlebars-runtime](http://spmjs.io/package/handlebars-runtime) automaticly for better perfermance, just similar with css's procedure.


## Precompile language

People prefer a lot precompile languages both for css and template, such as [less](http://lesscss.org/), [scss](http://sass-lang.com/), [mustache](https://github.com/janl/mustache.js), [Hogan.js](https://github.com/twitter/hogan.js), [doT](https://github.com/olado/doT) and etc.

Consider [spm.scripts](/documentation/package.json#fields) in package.json for precompileing procedure.
