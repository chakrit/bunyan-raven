
// index.js - Main bunyan-raven stream export
module.exports = (function(undefined) {

  var util = require('util')
    , assert = require('assert')
    , Writable = require('stream').Writable;

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
    var options = this._gatherRavenMetaData(record);

    if (!err) {
      this.client.captureMessage(record.msg, options);
      return callback(null);
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

    // Add tags
    var tags = ['name', 'hostname', 'pid', 'level'];
    tags.forEach(function(tag) { options.tags[tag] = record[tag]; });

    return options;
  };

  return RavenStream;

})();

