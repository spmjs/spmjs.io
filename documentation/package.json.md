# Package.json

---

package.json of `spm` share most fileds with package.json of `npm`, but add a `spm` filed to indicate some custom attributes.

### Fields

Field | Description |
------------ | ------------- |
name* | name of your package, all lowercase, use a "-" as a separator between words
version* | Semantic Versioning like 1.0.0
description | a brief description of your package
keywords | a array contains keywords
homepage | url of your package's website
author | author of this package: `Hsiaoming Yang <me@lepture.com>` or `{ "name": "Hsiaoming Yang", "email": "me@lepture.com" }`
maintainers | a array of maintainers, just like author
repository | Specify the place where your code lives. `{ "type": "git", "url": "http://github.com/isaacs/npm.git" }`
bugs | The url to your project's issue tracker and / or the email address to which issues should be reported.
license | license
**spm*** |
spm.main | the only entry point of package, default `index.js`, could be a json or css file
spm.output | a array of other files need to output
spm.dependencies | specify dependencies relation of the package
spm.devDependencies | specify dependencies relation of the package in developing stuation
spm.engines | specify the loader envirement of executing the package, it would be used for local demo debugging.
spm.tests | specify all test files, support glob patterns: `tests/*-spec.js`
spm.buildArgs | specify the cli arguments for `spm build`

### A basic example

```json
{
  "name": "arale-calendar",
  "version": "1.0.0",
  "description": "Calendar widget.",
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
  "keywords": ["widget", "month", "datepicker"],
  "license": "MIT",
  "spm": {
    "main": "src/calendar.js",
    "dependencies": {
      "jquery": "1.7.2",
      "moment": "2.0.0",
      "arale-base": "1.0.0",
      "arale-position": "1.0.0",
      "arale-iframe-shim": "1.0.2",
      "handlebars": "1.0.2",
      "arale-widget": "1.1.1"
    },
    "devDenpendencies": {
      "expect": "0.2.0"
    },
    "engines": {
      "seajs": "2.1.1",
      "seajs-text": "1.0.3",
      "seajs-style": "1.0.2"
    },
    "tests": "tests/*-spec.js"
    "buildArgs": "--exclude $",
  }
}
```
