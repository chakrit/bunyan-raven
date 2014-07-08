
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

    if (!err) {
      this.client.captureMessage(record.msg);
      return callback(null);
    }

    if (err instanceof Error) {
      this.client.captureError(err);
      return callback(null);
    }

    // Bunyan's serializer kicks in in some cases which requires reconverting the object to an error
    var convertedError = new Error(err.message);
    convertedError.name = err.name;
    convertedError.code = err.code;
    convertedError.signal = err.signal;
    convertedError.stack = err.stack;
    this.client.captureError(convertedError);
    return callback(null);
  };

  return RavenStream;

})();

