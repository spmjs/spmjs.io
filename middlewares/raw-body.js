var getRawBody = require('raw-body');

module.exports = function(options) {
 return  function(req, res, next) {
  if (options.contentTypes.indexOf(req.headers['content-type']) < 0) {
    return next();
  }
  getRawBody(req, {
    length: req.headers['content-length'],
    limit: options.limit || '50mb'
  }, function (err, string) {
    if (err)
      return next(err)
    req.body = string
    next()
  })
  }
};
