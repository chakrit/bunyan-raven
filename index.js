
// index.js - Main bunyan-raven stream export
module.exports = (function(undefined) {

  var util = require('util')
    , assert = require('assert')
    , Writable = require('stream').Writable;

  var nameFromLevel = [];
  nameFromLevel[10] = 'trace';
  nameFromLevel[20] = 'debug';
  nameFromLevel[30] = 'info';
  nameFromLevel[40] = 'warning';
  nameFromLevel[50] = 'error';
  nameFromLevel[60] = 'fatal';

  function RavenStream(client) {
    assert(client != null, "Please provide a raven client.");
    Writable.call(this, { objectMode: true });

    this.client = client;
  }

  util.inherits(RavenStream, Writable);

  RavenStream.prototype.client = null;
  RavenStream.prototype._write = function(record, encoding, callback) {
    // mangle the error message a bit to make sure we have the log record's message
    // showing up on sentry as well or at least also logs the message itself if no error
    // object are provided.
    var err = record.err;

    // Get level value string, since bunyan uses numbers for levels
    if (record.level && typeof record.level === 'number') {
      record.level = nameFromLevel[record.level];
    }

    var options = this._gatherRavenMetaData(record);

    if (!err) {
      this.client.captureMessage(record.msg, options);
      return callback(null);
    }

    if (record.msg) {
      err.message = record.msg + " (" + err.message + ")";
    }

    if (err instanceof Error) {
      this.client.captureError(err, options);
      return callback(null);
    }

    // Bunyan's serializer kicks in in some cases which requires reconverting the object to an error
    var convertedError = new Error(err.message);
    convertedError.name = err.name;
    convertedError.code = err.code;
    convertedError.signal = err.signal;
    convertedError.stack = err.stack;
    this.client.captureError(convertedError, options);
    return callback(null);
  };

  RavenStream.prototype._gatherRavenMetaData = function(record) {
    var options = {tags: {}, extra: {}};
    // Level doesn't go in tags or extra
    options.level = record.level;

    // Add tags
    var tags = ['name', 'hostname', 'pid'];
    tags.forEach(function(tag) { options.tags[tag] = record[tag]; });

    // Add 'extra' meta-data from record
    var skip = ['msg', 'time', 'v', 'err', 'level'];
    for (var key in record) {
      if (tags.indexOf(key) != -1) continue;
      if (skip.indexOf(key) != -1) continue;
      options.extra[key] = JSON.stringify(record[key], safeCycles());
    }
    return options;
  };

  // A JSON stringifier that handles cycles safely.
  // Usage: JSON.stringify(obj, safeCycles())
  function safeCycles() {
      var seen = [];
      return function (key, val) {
          if (!val || typeof (val) !== 'object') {
              return val;
          }
          if (seen.indexOf(val) !== -1) {
              return '[Circular]';
          }
          seen.push(val);
          return val;
      };
  }

  return RavenStream;

})();

