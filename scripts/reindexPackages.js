// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;
var elastical = require('elastical');
var client = new elastical.Client();
var Project = require('../models/project');

client.deleteIndex('spmjs', function() {
  console.log('Deleted index spmjs.');

  client.createIndex('spmjs', {
    "mappings" : {
        "package" : {
            "properties" : {
                "suggest" : { "type" : "string", "index" : "not_analyzed" }
            }
        }
    }
  }, function() {
    var operations = [];
    Project.getAll().forEach(function(name) {
      var p = new Project({
        name: name
      });
      operations.push({
        create: {
          index: 'spmjs',
          type: 'package',
          id: p.name,
          data: {
            name: p.name,
            description : p.description,
            keywords : p.keywords,
            suggest: p.name
          }
        }
      });
    });
    client.bulk(operations, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Imported ' + result.items.length + ' packages:');
      console.log(result.items.map(function(item) {
        return item.create._id;
      }).join(', '));
    });
  });
});
