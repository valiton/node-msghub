# msghub

A simple communication layer for inter-process communcation between mulitple worker processes in a clustered environment.

This module works best in combination with the [various-cluster](https://npmjs.org/package/various-cluster) module

## Getting Started

$ npm install msghub

require it in your code, and use it:


```javascript
var msghub = require('msghub');
msghub.on('my-custom-event', function (msg) {
  console.log(msg); // will print 'wow, thats cool!' to the console
});
msghub.send('my-custom-event', 'wow, thats cool!');
```

## Examples

see the examples-directory!

## Documentation

api-docs: (open doc/index.html in your browser)

### Steps:

#### you need to require it in your master!

```javascript
require('msghub');
```

#### and in all workers you want:

```javascript
var msghub = require('msghub');
```

#### append Event-Listeners and name them whatever you want:

```javascript
msghub.on('my-event-listener', function (msg) {
  // do something with message
});
```

#### now you can send from anywhere inside your application to all workers which are binded to that event:

```javascript
msghub.send('my-event-listener', 'just a simple message');
```

#### or send a message to some random listener inside your application:

```javascript
msghub.random('my-event-listener', 'just a simple message');
```

#### or send a message in roundrobin manner to one listener inside your application:

```javascript
msghub.roundrobin('my-event-listener', 'just a simple message');
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint your code using [Grunt](http://gruntjs.com/)

## Release History

- 0.1.1 add hint to various-cluster to readme

- 0.1.0 Initial Release

## Contributors

- Bastian "hereandnow" Behrens

## License
Copyright (c) 2013 Valiton GmbH
Licensed under the MIT license.

