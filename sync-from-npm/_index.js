'use strict';

var path = require('path');
var join = path.join;

// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load(join(__dirname, '../config/base.yaml'));
global.CONFIG = CONFIG;

var registry = CONFIG.npmSyncRegistry || 'registry.npmjs.org';

var hook = require('../lib/hook');

var request = require('co-request');
var semver = require('semver');
var co = require('co');
var log = require('spm-log');
var format = require('util').format;
var extend = require('extend');
var thunkify = require('thunkify');
var crypto = require('crypto');
var clientTar = require('spm-client').tar;
var moment = require('moment');

var Project = require('../models/project');
var Package = require('../models/package');

var tar = require('tar');
var download = thunkify(_download);
var untar = thunkify(_untar);
var createTar = thunkify(_createTar);

var readFile = require('fs').readFileSync;

// 有些 pkg 是纯粹的 node 包，不迁移
var BLACK_PKGS = [
  'envify',
  'jsdom'
];

module.exports = function(id, count, owner, callback) {
  co(function *() {
    if (id.indexOf('@') > -1) {
      id = id.split('@');
      yield syncPackage(id[0], id[1], owner);
    } else {
      yield syncPackages(id, count, owner);
    }
  }).then(function() {
    callback();
  }, function(err) {
    log.error('error', err);
    console.error(err.stack);
    callback(err);
  });
};

function *syncPackages(name, count, owner) {
  var url = 'http://' + registry + '/' + name;
  log.info('npm request', url);
  var result = yield request(url);
  if (result.statusCode === 404) {
    throw Error(format('pkg %s not found on npm', name))
  }
  var pkg = JSON.parse(result.body);
  var versions = Object.keys(pkg.versions);
  log.info('versions', versions.join(', '));
  var project = new Project({name:name});

  versions = versions.filter(function(v) {
    return /^\d+\.\d+\.\d+$/.test(v);
  });

  versions = versions.sort(function(a, b) {
    return moment(pkg.time[b]) - moment(pkg.time[a]);
  });

  if (project && project.packages) {
    var newVersions = [];
    for (var j = 0; j < versions.length; j++) {
      var v = versions[j];
      if (project.packages[v]) {
        break;
      } else {
        newVersions.push(v);
      }
    }
    versions = newVersions;
  }

  versions = versions.slice(0, count);
  versions = versions.sort(function(a, b) {
    return semver.compare(a, b);
  });
  log.info('versions filtered', versions.join(', '));
  console.log();

  for (var i=0; i<versions.length; i++) {
    try {
      yield syncPackage(name, versions[i], owner);
    } catch(e) {
      log.error('skip', '%s@%s, %s', name, versions[i], e);
      console.log();
    }
  }
  log.info('done');
}

function *syncPackage(name, version, owner) {
  log.info('start sync', '%s@%s', name, version);

  // 验证当前 pkg 是否可被同步
  if (!testPkg(name, version)) {
    throw Error(format('pkg %s@%s can not be sync', name, version));
  }

  // 获取依赖包
  var pkgs = yield getPkgs(name, version);
  log.info('pkgs', Object.keys(pkgs));

  // 过滤依赖包
  pkgs = filterPkgs(pkgs);
  log.info('pkgs filtered', Object.keys(pkgs));

  // TODO: 并发下载，顺序 publish (因为下载容易出错)

  // 执行
  // TODO: 包的下载用队列和多线程
  for (var k in pkgs) {
    yield syncPkg(pkgs[k], owner);
  }

  log.info('end sync', '%s@%s', name, version);
  console.log();
}

function *syncPkg(pkg, owner) {
  // 下载 tar 包
  if (!pkg.dist.tarball) {
    throw Error('tarball not found in pkg %s@%s', pkg.name, pkg.version);
  }
  var filename = pkg.dist.tarball.replace(/(:|\/)/g, '_');
  var file = join(process.env.TMPDIR || '/tmp/', +new Date() + '_' + filename);
  yield download(pkg.dist.tarball, file);

  // 解压 tar 包
  yield untar(file, file);

  // 修改文件
  pkg = updatePackageJSON(join(file, 'package', 'package.json'));

  // 压缩成 tar 包
  var target = yield createTar(pkg, join(file, 'package'));
  log.info('tar', target);

  // 发布
  pkg.tag = 'stable';
  pkg.readme = getReadme(target);
  pkg.dependencies = getDependencies(pkg);

  var project = new Project(pkg);
  var pack = new Package(pkg);
  if (!project['created_at']) {
    // 更新 owners 信息
    pkg.owners = [owner];
    project.update(pkg);
    hook.emit('create:project', project, owner);
  }
  var tarfile = readFile(target);
  pack.md5 = crypto.createHash('md5').update(tarfile).digest('hex');
  pack.saveTarfile(tarfile);
  pack.publisher = owner;
  pack.save();
  project.update(pack);
  project.sync_from_npm = true;
  project.save();
  hook.emit('update:package', pack);
}

function getDependencies(pkg) {
  var deps = pkg.spm.dependencies || {};
  return Object.keys(deps).map(function(key) {
    return key + '@' + deps[key];
  });
}

function getReadme(dir) {
  var readmeFile = join(dir, 'README.md');
  return require('fs').existsSync(readmeFile) ? require('fs').readFileSync(readmeFile).toString(): '';
}

function _createTar(pkg, cwd, callback) {
  var tarfile = join(process.env.TMPDIR || '/tmp/', format('%s-%s.tar.gz', pkg.name, pkg.version));
  clientTar.create(cwd, tarfile, function(err, target) {
    if (err) {
      log.error('tar error %s', err.stack);
    }
    callback(err, target);
  });
}

function updatePackageJSON(file) {
  log.info('update package', file);
  var pkg = JSON.parse(require('fs').readFileSync(file, 'utf-8'));
  pkg.spm = {};
  if (pkg.main) pkg.spm.main = pkg.main;

  // 合并 peerDependencies 到 dependencies
  if (pkg.peerDependencies) {
    for (var k in pkg.peerDependencies) {
      pkg.dependencies = pkg.dependencies || {};
      pkg.dependencies[k] = pkg.peerDependencies[k];
    }
  }

  if (pkg.dependencies) {
    for (var k in pkg.dependencies) {
      if (BLACK_PKGS.indexOf(k) === -1) {
        if (!pkg.spm.dependencies) {
          pkg.spm.dependencies = {};
        }
        pkg.spm.dependencies[k] = pkg.dependencies[k];
      }
    }
  }
  require('fs').writeFileSync(file, JSON.stringify(pkg, null, 2));
  return pkg;
}

function _download(url, file, callback) {
  log.info('download', url);
  // TODO: 验证 md5 值，优先级不高
  require('request')(url)
    .pipe(require('fs').createWriteStream(file))
    .on('error', function(err) {
      throw Error(err);
    })
    .on('finish', function() {
      callback();
    });
}

function _untar(file, dest, callback) {
  log.info('untar', file);
  require('fs').createReadStream(file)
    .pipe(require('zlib').createGunzip())
    .pipe(tar.Extract({path: dest}))
    .on('error', function(err) {
      throw Error(err);
    })
  .on('finish', callback);
}

function filterPkgs(pkgs) {
  var ret = {};
  for (var k in pkgs) {
    if (testPkg(pkgs[k].name, pkgs[k].version)) {
      ret[k] = pkgs[k];
    }
  }
  return ret;
}

function semverPkgExist(name, version) {
  var project = new Project({name:name});
  if (!project.packages) return;

  var versions = Object.keys(project.packages);
  if (!versions.length) return;

  return semver.maxSatisfying(versions, version);
}

function testPkg(name, version) {
  var project = new Project({name:name});
  var projectExists = !!project.packages;
  var pkgExists = projectExists && project.packages[version];

  // 当前版本已存在，无需再同步
  if (pkgExists) {
    log.error('testPkg', format('pkg %s@%s is exist on server, do not need to sync again', name, version))
    return false;
  }

  if (!projectExists || (projectExists && project.sync_from_npm)) {
    return true;
  } else {
    // 没有标记 sync_from_npm 的，不能被同步
    if (!project.sync_from_npm) {
      throw Error(format('pkg %s is published by other user, if you need this pkg to be synced from npm, contact sorrycc#gmail.com', name));
    }
    // 从外部源同步回来的，不能二次同步
    if (project.sync_from_remote) {
      throw Error(format('pkg %s is sync from remote, can not do sync again', name));
    }
    return false;
  }
}

// TODO: 返回数组，然后倒序排列
function *getPkgs(name, version) {
  var pkgs = {};

  var pkg = yield getPkg(name, version);
  // 补充 .js 后缀，spm 现在的逻辑不支持自动补充 .js 后缀
  if (pkg.main && path.extname(pkg.main) === '') {
    pkg.main = pkg.main + '.js';
  }
  pkgs[pkg.name + '@' + pkg.version] = pkg;

  // 合并 peerDependencies 到 dependencies
  if (pkg.peerDependencies) {
    for (var k in pkg.peerDependencies) {
      pkg.dependencies = pkg.dependencies || {};
      pkg.dependencies[k] = pkg.peerDependencies[k];
    }
  }

  if (pkg.dependencies) {
    for (var n in pkg.dependencies) {
      if (BLACK_PKGS.indexOf(n) > -1) {
        log.warn('depencencies', 'have dependencies %s in BLACK_PKGS', n);
        continue;
      }

      var v = pkg.dependencies[n];
      //v = v.replace(/^([^\d]+)/, '');

      // 如果本地存在，则不添加到依赖项中
      if (semverPkgExist(n, v)) {
        continue;
      }

      if (!/^\d+\.\d+\.\d+$/.test(v)) {
        //throw Error('pkg version `' + v + '` of '+n+' is invalid');
        v = yield getVersion(n, v);
      }
      // TODO: 这里要用 semver 检查是否已存在于 pkgs 中，否则会出现死循环

      var depPkgs = yield getPkgs(n, v);
      extend(pkgs, depPkgs);
    }
  }

  return pkgs;
}

function *getVersion(name, range) {
  var url = 'http://' + registry + '/' + name;
  log.info('npm request', url);
  var result = yield request(url);
  if (result.statusCode === 404) {
    throw Error(format('pkg %s not found on npm', name))
  }
  var data = JSON.parse(result.body);
  var versions = Object.keys(data.versions);

  var version = semver.maxSatisfying(versions, range);
  if (!version) {
    throw Error('pkg version `' + range + '` of ' + name + ' is invalid');
  }
  return version;
}

var pkgCache = {};

function *getPkg(name, version) {
  var id = name + '@' + version;
  if (!pkgCache[id]) {
    var url = 'http://' + registry + '/' + name + '/' + version;
    log.info('npm request', url);
    var result = yield request(url);
    if (result.statusCode === 404) {
      throw Error(format('pkg %s@%s not found on npm', name, version))
    }
    var pkg = JSON.parse(result.body);
    pkgCache[id] = pkgCache[name+'@'+pkg.version] = pkg;
  }
  return pkgCache[id];
}


/**
TODO:

1. 同步依赖的时候要全量同步? 还是只同步最符合的那个版本?
2. 获取依赖版本时，不要请求 name/version，而是请求 name，然后拿 versions 进行 semver 校验
*/

