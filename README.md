
# BUNYAN-RAVEN

BUNYAN-RAVEN is an `objectMode` [`stream.Writable`][1] implementation that expects
[node-bunyan][0] log records and sends them to an instance of [raven-node][2].

Basically, this module lets you integrate your existing [node-bunyan][0] logs with
[getsentry.com][3] nice and easy without having to rewrite any code except for where you
initialize your [node-bunyan][0] logger.

# USAGE

First, create your [raven-node][2] client as usual:

```js
var raven = require('raven')
  , client = new raven.Client("___YOUR_SENTRY_DSN__OR_DEFER_TO_env.SENTRY_DSN___");

client.patchGlobal(); // optional
```

Then when you create your [node-bunyan][0] logger, include an instance of the
`RavenStream` as well and configure it to match your desired logging level:

```js
var bunyan = require('bunyan')
  , RavenStream = require('bunyan-raven');

var logger = bunyan.createLogger(
  { name: 'test logger'

  // IMPORTANT PART:
  , streams:
    [ { type: 'raw'
      , stream: new RavenStream(client)
      , level: 'error'
      }
    ]
  };
```

`RavenStream` will automatically logs any error objects if it is passed in the `err` key
of the log record or will simply creates a new Error object with the log record's message.

# SUPPORT / CONTRIBUTE

PRs welcome. Bug reports/assistance, just [file a GitHub issue][4].

# LICENSE

BSD-2-clause


[0]: https://github.com/trentm/node-bunyan
[1]: http://nodejs.org/api/stream.html#stream_class_stream_writable
[2]: https://github.com/mattrobenolt/raven-node
[3]: https://getsentry.com/
[4]: https://github.com/chakrit/bunyan-raven/issues

