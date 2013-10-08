
// index.js - Main bunyan-raven stream export
module.exports = (function(undefined) {

  var util = require('util')
    , assert = require('assert')
    , Writable = require('stream').Writable;

  function RavenStream(client) {
    assert(client != null, "Please provide a raven client.");
    Writable.call(this, { objectMode: true });
  }

  util.inherits(RavenStream, Writable);

  RavenStream.prototype.client = null;
  RavenStream.prototype._write = function(record, encoding, callback) {
    // mangle the error message a bit to make sure we have the log record's message
    // showing up on sentry as well or at least also logs the message itself if no error
    // object are provided.
    var err = record.err;
    if (err) {
      err.message = record.msg + " (" + err.message + ")";
    } else {
      err = new Error(record.msg);
    }

    client.captureError(err);
    callback(null);
  };

  return RavenStream;

})();

