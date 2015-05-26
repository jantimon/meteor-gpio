/* global gpio:true */

// Public API
gpio = (function(){
  'use strict';
  return {
    read: function readGpio(port, callback) {
      Meteor.call('readGpio', port, callback);
    },
    write: function writeGpio(port, state, callback) {
      Meteor.call('writeGpio', port, state, callback);
    }
  };
}());