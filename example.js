
// example.js - Ad-hoc test for me and some doc for others :p
module.exports = (function() {

  var RavenStream = require('./index.js')
    , bunyan = require('bunyan')
    , raven = require('raven');

  console.log("init...");

  client = new raven.Client(); // should gets dsn from process.env.SENTRY_DSN

  var opts =
    { name: "Bunyan-Raven Test"
    , streams:
      [ { type: 'raw'
        , stream: new RavenStream(client)
        , level: 'trace'
        }
      , { stream: process.stdout }
      ]
    };

  var log = bunyan.createLogger(opts)
    , err = function() { return new Error("test error!"); };

  log.trace("hello trace!");
  log.debug("hello debug!");
  log.info("hello info!");
  log.warn("hello warn!");
  log.error("hello error!");
  log.fatal("hello fatal!");
  log.fatal({ err: err() }, "fatal with obj!");
  log.error({ err: err() }, "error with obj!");
  log.warn({ err: err() }, "warn with obj!");
  log.info({ err: err() }, "info with obj!");
  log.debug({ err: err() }, "debug with obj!");
  log.trace({ err: err() }, "trace with obj!");

  log.error(new Error("This gets picked up by Bunyan's serializer"));
  log.error("This is send as a message to Raven");

  // Send additional data as 'extra' to Raven/GetSentry
  log.error({myCustomField: 'I like dolphins', err: err()});
  log.error({myCustomField: 'I like dolphins'}, 'error message');

  // Circular objects are safely catched
  function Foo() {
    this.abc = "Hello";
    this.circular = this;
  }
  var foo = new Foo();
  logger.error({err: err(), foo: foo});

  for (var i = 0; i < 10; i++) log.trace("flood!");

  // wait for sentry to flush before letting app dies
  setTimeout(function() { }, 10000);

})();
