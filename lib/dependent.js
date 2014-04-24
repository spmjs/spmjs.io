var Package = require('../models/package');
var Project = require('../models/project');
var _ = require('lodash');

exports.calculate = function(package, action) {
  var dependencies = package.dependencies || [];
  dependencies.forEach(function(d) {
    var name = d.split('@')[0];
    var version = d.split('@')[1];
    var p = new Package({
      name: name,
      version: version
    });

    if (p.md5) {
      p.dependents = p.dependents || [];
      var dep = package.name + '@' + package.version;
      if (action === 'update') {
        if (p.dependents.indexOf(dep) < 0) {
          p.dependents.push(dep);
        }
      } else if (action === 'delete') {
        p.dependents.splice(p.dependents.indexOf(dep), 1);
      }
      p.save();
      var project = new Project({ name: name });
      project.packages[version] = p;
      project.save();
    }
  });
};

exports.getSortedDependents = function() {
  var result = [];
  Project.getAll().forEach(function(name) {
    var dependents;
    var p = new Project({
      name: name
    });
    p.packages.forEach(function(package) {
      dependents = dependents.concat(package.dependents || []);
    });
    dependents = _.uniq(dependents);
    result.push({
      name: name,
      count: dependents.length
    });
  });

  return result.sort(function(a, b) {
    return b.count - a.count;
  });
};
