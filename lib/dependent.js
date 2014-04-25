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

exports.getSortedDependents = function(count) {
  count = count || 10;
  var result = [];
  Project.getAll().forEach(function(name) {
    var dependents = [];
    var p = new Project({
      name: name
    });
    for (var v in p.packages) {
      dependents = dependents.concat(p.packages[v].dependents || []);
    }
    dependents = dependents.map(function(d) {
      return d.split('@')[0];
    });
    dependents = _.uniq(dependents);
    result.push({
      name: name,
      count: dependents.length
    });
  });

  result = result.sort(function(a, b) {
    return b.count - a.count;
  })

  result = result.filter(function(item) {
    return item.count > 0;
  });

  return result.splice(0, count);
};
