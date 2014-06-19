# Package.json

---

package.json of `spm` share most fileds with package.json of `npm`, but add a `spm` filed containing some custom attributes.

### Fields

Field | Description |
------------ | ------------- |
name* | name of your package, all lowercase, use a `-` or `.` as a separator between words
version* | Semantic Versioning like 1.0.0
private | prevent accidental publication of private repositories, default `false`
description | a brief description of your package
keywords | an array contains keywords
homepage | url of your package's website
author | author of this package: `Hsiaoming Yang <me@lepture.com>` or `{ "name": "Hsiaoming Yang", "email": "me@lepture.com" }`
maintainers | an array of maintainers, just like author
repository | Specify the place where your code lives. `{ "type": "git", "url": "http://github.com/isaacs/npm.git" }`
bugs | The url to your project's issue tracker and / or the email address to which issues should be reported.
license | license
**spm*** |
spm.main | the only entry point of package, default `index.js`, could be a json or css file
spm.output | an array of other files need to output
spm.dependencies | specify dependencies relation of the package
spm.devDependencies | specify dependencies relation of the package in developing stuation
spm.engines | specify the loader envirement of executing the package, it would be used for local demo debugging.
spm.tests | specify all test files, support glob patterns: `tests/*-spec.js`
spm.buildArgs | specify the cli arguments for `spm build`
spm.ignore | an array of ignore files in package, same function as `.spmignore`

### A basic example

```json
{
  "name": "arale-calendar",
  "version": "1.1.0",
  "description": "Calendar widget.",
  "keywords": [
    "widget",
    "month",
    "datepicker"
  ],
  "author": "Hsiaoming Yang <me@lepture.com>",
  "maintainers": [
    "hotoo <hotoo.cn@gmail.com>",
    "shengyan <shengyan1985@gmail.com>"
  ],
  "homepage": "http://aralejs.org/calendar/",
  "repository": {
    "type": "git",
    "url": "https://github.com/aralejs/calendar.git"
  },
  "bugs": {
    "url": "https://github.com/aralejs/calendar/issues"
  },
  "license": "MIT",
  "spm": {
    "main": "calendar.js",
    "dependencies": {
      "jquery": "1.7.2",
      "moment": "2.6.0",
      "arale-base": "1.1.0",
      "arale-position": "1.1.0",
      "arale-iframe-shim": "1.1.0",
      "handlebars": "1.3.0",
      "arale-widget": "1.2.0"
    },
    "devDenpendencies": {
      "expect.js": "0.3.1"
    },
    "engines": {
      "seajs": "2.2.1",
      "seajs-text": "1.1.0"
    },
    "tests": "tests/*-spec.js",
    "ignore": ["dist"],
    "buildArgs": "--ignore jquery"
  }
}
```
