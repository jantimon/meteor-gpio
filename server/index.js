/* global gpio: true, Async: false, console: false */
// Server
'use strict';
gpio = (function() {

  var EventEmitter = Npm.require('eventemitter3');
  var onoff = Npm.require('onoff');
  var gpioEvents = new EventEmitter();
  var gpio = {};
  var ports = {};
  var values = {};
  var config = {
    ports: {},
    publish: false,
    poll: true
  };

  gpio.events = gpioEvents;

  gpio.configure = function(newConfig) {
    config = newConfig;
    // Initialize all ports
    Object.keys(config.ports || {}).forEach(function(port) {
      port = parseInt(port, 10);
      gpio.getPort.apply(gpio, [port].concat(config.ports[port]));
    });
  };

  gpio.read = function(port) {
    return Async.runSync(function(done) {
      gpio.getPort(port, 'in', 'both').read(function(err, result) {
        done(err, result);
      });
    }).result;
  };

  gpio.write = function(port, value) {
    return Async.runSync(function(done) {
      gpio.getPort(port, 'out').write(value, function(err, result) {
        if(result) {
          values[port] = value;
          gpioEvents.emit('change', {port: port, value: value});
        }
        done(err, result);
      });
    }).result;
  };

  /**
   * Helper function to get a onoff gpio instance
   * It has the same arguments like `new onoff.Gpio()`.
   * So `gpio.getPort(97, 'in')` will be turned into new Gpio(97, 'in');
   */
  gpio.getPort = function(port, direction) {
    if(!ports[port]) {
      if (arguments.length === 1) {
        throw new Error('direction is undefined');
      }
      var args = Array.prototype.slice.call(arguments);
      var Gpio = Function.prototype.bind.apply(onoff.Gpio, [null].concat(args));
      var gpio = new Gpio();
      ports[port] = gpio;
      gpioEvents.emit('new', {port: port, value: undefined});
      // Get initial state
      gpio.read(function(err, value) {
        if(value !== values[port]) {
          values[port] = value;
          gpioEvents.emit('change', {port: port, value: value});
        }
      });
      // Watch port changes
      if(config.poll) {
        if(direction === 'in') {
          var poll = function() {
            gpio.read(function(err, value) {
              if(value !== values[port]) {
                values[port] = value;
                gpioEvents.emit('change', {port: port, value: value});
              }
              setTimeout(poll, 25);
            });
          };
          setTimeout(poll);
        }
      } else {
        gpio.watch(function(err, value) {
          values[port] = value;
          gpioEvents.emit('change', {port: port, value: value});
        });
      }
    }
    return ports[port];
  };

  // Publish ports
  Meteor.publish('gpio', function (port) {
    var self = this;
    var showAll = false;
    var added = {};
    if (port === undefined) {
      showAll = true;
    }
    function update(data) {
      if (showAll === false && port !== data.port) {
        return;
      }
      self[added[data.port] ? 'changed' : 'added']('gpio', data.port, data);
      added[data.port] = true;
    }
    if(config.publish === true) {
      // Register all ports
      Object.keys(ports).forEach(function(port) {
        update({port: parseInt(port, 10), value: values[port]});
      });
      gpioEvents.on('change', update);
      gpioEvents.on('new', update);
    } else {
      console.log('Access on GPIO ports denied as config.publish is set to false');
    }
    self.ready();
    self.onStop(function () {
      gpioEvents.removeListener('change', update);
      gpioEvents.removeListener('new', update);
    });
  });

  // Backend
  Meteor.methods({
    'readGpio': function readGpio(port) {
      if(config.publish) {
        return gpio.read(port);
      } else {
        console.log('Reading values is only allowed if options.publish is set to true');
      }
    },
    'writeGpio': function writeGpio(port, value) {
      if(config.publish) {
        return gpio.write(port, value);
      } else {
        console.log('Changing values is only allowed if options.publish is set to true');
      }
    }
  });

  return gpio;
}());