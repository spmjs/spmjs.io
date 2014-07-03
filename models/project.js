var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var Package = require('./package');
var moment = require('moment');
var semver = require('semver');

function Project(project) {
  if (!project.name) {
    return;
  }
  this.name = project.name;

  var pkg;
  var datafile = this.datafile();
  if (fs.existsSync(datafile)) {
    pkg = fs.readJsonSync(datafile);
  } else {
    pkg = {};
  }
  _.merge(this, pkg);
  _.merge(this, project);
  return this;
}

Project.prototype = {
  datafile: function() {
    return path.join(CONFIG.wwwroot, 'repository', this.name, 'index.json');
  },

  save: function() {
    fs.outputJsonSync(this.datafile(), this);
    return this;
  },

  delete: function() {
    var that = this;
    this.getVersions().forEach(function(version) {
      that.remove(version);
    });
    fs.removeSync(path.join(CONFIG.wwwroot, 'repository', this.name));
    return this;
  },

  remove: function(version) {
    if (version in this.packages) {
      delete this.packages[version];
      if (Object.keys(this.packages).length === 0) {
        this.delete();
      } else {
        this.save();
      }
    }
    var p = new Package({
      name: this.name,
      version: version
    });
    if (p.md5) {
      p.delete();
      this.version = this.getLatestVersion();
      this.save();
    }
    return Object.keys(this.packages).length;
  },

  update: function(data) {
    var now = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    if (!data.name || !data.version) {
      return false;
    }
    if (this.name && data.name !== this.name) {
      return false;
    }

    // save package
    var pkg = new Package(data);
    pkg.save();

    var keys = [
      'name',
      'homepage',
      'description',
      'keywords',
      'repository',
      'license',
      'author',
      'maintainers',
      'owners'
    ];

    for (var key in data) {
      if (keys.indexOf(key) >= 0) {
        this[key] = data[key];
      } else {
        delete this[key];
      }
    }

    this.packages = this.packages || {};
    delete pkg.readme;

    this.packages[data.version] = pkg;
    this.version = this.getLatestVersion();

    this['created_at'] = this['created_at'] || now;
    this['updated_at'] = now;
    this.save();
    return this;
  },

  getVersions: function() {
    var versions = Object.keys(this.packages || []);
    return versions.sort(function(a, b) {
      if (semver.lt(a, b)) {
        return 1;
      } else {
        return -1;
      }
    });
  },

  getLatestVersion: function() {
    return this.getVersions()[0];
  }
};

Project.getAll = function() {
  return fs.readdirSync(path.join(CONFIG.wwwroot, 'repository'));
};

module.exports = Project;
