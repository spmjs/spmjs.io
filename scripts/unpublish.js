'use strict';

/**
 * Usage:
 *
 * # unpublish a project
 * node scripts/unpublish.js foo
 *
 * # unpublish a package
 * node scripts/unpublish.js foo@0.1.0
 */

var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;

var confirm = require('confirm-cli');
var remove = require('fs-extra').removeSync;
var join = require('path').join;
var hook = require('../lib/hook');
var Project = require('../models/project');
var Package = require('../models/package');

Package.prototype.delete = function() {
  remove(join(CONFIG.wwwroot, 'repository', this.name, this.version));
  return this;
};

Project.prototype.delete = function() {
  var that = this;
  this.getVersions().forEach(function(version) {
    that.remove(version);
  });
  remove(join(CONFIG.wwwroot, 'repository', this.name));
  return this;
};

var pkg = process.argv[2];
if (!pkg) {
  console.log('pkg not found');
  process.exit(1);
}

confirm('Confirm to unpublish ' + pkg + '?', function() {
  var hasVersion = pkg.indexOf('@') > -1;
  if (hasVersion) {
    pkg = pkg.split('@');
    deletePackage(pkg[0], pkg[1]);
  } else {
    deleteProject(pkg);
  }
});

function deletePackage(name, version) {
  var pkg = new Package({name:name, version:version});
  var project = new Project({name:name});

  hook.emit('delete:package', pkg);
  var leftPackageCount = project.remove(pkg.version);
  if (leftPackageCount === 0) {
    hook.emit('delete:project', project);
  }
}

function deleteProject(name) {
  var project = new Project({name:name});
  hook.emit('delete:project', project);
  project.delete();
}
