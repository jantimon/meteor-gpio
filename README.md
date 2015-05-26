# jantimon:gpio

Getting and setting GPIO values for Raspberry Pi / Odroid / BeagleBone

## Installation

```
    meteor add jantimon:gpio
```

## Description

Allows to set and get the pin values of the [general-purpose input/output](http://en.wikipedia.org/wiki/General-purpose_input/output).

```
  // Configuration
  if (Meteor.isServer) {
    gpio.configure({
      poll: true,
      publish: true,
      ports: {
        104: 'out',
        102: 'out',
        97: 'out',
        101: 'out',
        83: 'out',
        88: 'out',
        108: 'in'
      }
    });
  }

  // Reactive active on the client
  if (Meteor.isClient) {
    var Gpio = new Mongo.Collection('gpio');
    Meteor.subscribe('gpio');
    Template.demo.helpers({
      gpios: function() {
        return Gpio.find().fetch();
      }
    });
  }

  // Setting values on click
  if (Meteor.isClient) {
    Template.demo.events({
      'click [data-id]': function(event) {
        gpio.write(97, 1);
      }
    });
  }

  // Setting values on server startup
  if (Meteor.isServer) {
    gpio.write(97, 1);
  }
```

## Running meteor on arm

Meteor rejects to install on arm however there are workarounds:

http://meteor-universal.tumblr.com/post/111452119634/build-and-install-up-to-date-nodejs
http://meteor-universal.tumblr.com/post/111447034269/install-meteor-universal-to-your-system

# Fixing gpio permission issues

## installation

odroid-c1:

```
git clone https://github.com/hardkernel/wiringPi
cd wiringPi
./build

gpio export 97 out
```

raspberry

```
git clonde https://github.com/tobetter/wiringPi
cd wiringPi
./build

gpio export 97 out
```


