var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var Package = require('./package');
var moment = require('moment');
var semver = require('semver');

function Project(project) {
  if (!project.name || !project.version) {
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
    return path.join('data', 'repository', this.name, 'index.json');
  },

  save: function() {
    fs.outputJsonSync(this.datafile(), this);
    return this;
  },

  remove: function(version) {},

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
      'version',
      'homepage',
      'description',
      'keywords',
      'repository',
      'author',
      'license',
      'maintainers'
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
    this.version = Object.keys(this.packages).sort(function(a, b) {
      return semver.lt(a, b);
    })[0];

    this['created_at'] = this['created_at'] || now;
    this['updated_at'] = now;
    this.save();
    return this;
  }
};

Project.getByUser = function() {};
Project.getAll = function() {};

module.exports = Project;
