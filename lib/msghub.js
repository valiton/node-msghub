/**
 * @name msghub
 * @description A simple msghub to communicate in a clustered environ
 * @author Valiton GmbH, Bastian "hereandnow" Behrens
*/

/**
 * Standard library imports
*/

var EventEmitter, Msghub, SimplePool, cluster,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

EventEmitter = require('events').EventEmitter;

cluster = require('cluster');

/**
 * 3rd library imports
*/


SimplePool = require('simple-pool');

Msghub = (function(_super) {
  var _addListener, _send;

  __extends(Msghub, _super);

  /**
   * send to the master
   *
   * @param {array} args where args[0] is the event and args[1] is the message
   * @param {string} to which is one of all|get|random
   * @private
  */


  _send = function(args, to) {
    return process.nextTick(function() {
      return process.send({
        type: 'msghub',
        event: args[0],
        msg: args[1],
        to: to
      });
    });
  };

  /**
   * when a new Listener is added, put it into the SimplePool
   *
   * @param {array} args where args[0] is the event and args[1] is the message
   * @param {string} to which is one of all|get|random
   * @private
  */


  _addListener = function(msg) {
    var id, worker, _base, _name, _ref, _results;
    _ref = cluster.workers;
    _results = [];
    for (id in _ref) {
      worker = _ref[id];
      if (worker.process.pid === msg.pid) {
        (_base = this.pool)[_name = msg.listener] || (_base[_name] = new SimplePool());
        _results.push(this.pool[msg.listener].add(worker));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  /**
   * create a new Msghub instance
   *
   * @memberOf global
   *
   * @constructor
   * @this {Msghub}
  */


  function Msghub() {
    var _this = this;
    if (cluster.isMaster) {
      this.listeners = {};
      this.pool = {};
      process.nextTick(function() {
        var id, worker, _ref, _results;
        _ref = cluster.workers;
        _results = [];
        for (id in _ref) {
          worker = _ref[id];
          _results.push(worker.on('message', function(msg) {
            var to;
            if (msg.type === 'msghubListener') {
              return _addListener.call(_this, msg);
            }
            if (msg.type === 'msghub' && (_this.pool[msg.event] != null)) {
              to = _this.pool[msg.event][msg.to]();
              if (!Array.isArray(to)) {
                return to.send(msg);
              }
              return to.forEach(function(_worker) {
                return _worker.send(msg);
              });
            }
          }));
        }
        return _results;
      });
    } else {
      this.setMaxListeners(0);
      this.on('newListener', function(listener) {
        return process.send({
          type: 'msghubListener',
          listener: listener,
          pid: process.pid
        });
      });
      process.on('message', function(msg) {
        if (msg.type !== 'msghub') {
          return;
        }
        return _this.emit(msg.event, msg.msg);
      });
    }
  }

  /**
   * send a message to all workers who binded to the given event
   *
   * @param {string} event send only to workers which binded to this event
   * @param {*} message the message which should be sent
   * @function global.Msghub.prototype.send
  */


  Msghub.prototype.send = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _send(args, 'all');
  };

  /**
   * send a message to a worker who binded to the given event in a roundrobin manner
   *
   * @param {string} event consider only workers which binded to this event
   * @param {*} message the message which should be sent
   * @function global.Msghub.prototype.send
  */


  Msghub.prototype.roundrobin = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _send(args, 'get');
  };

  /**
   * send a message to a worker who binded to the given event in a random manner
   *
   * @param {string} event consider only workers which binded to this event
   * @param {*} message the message which should be sent
   * @function global.Msghub.prototype.send
  */


  Msghub.prototype.random = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _send(args, 'random');
  };

  return Msghub;

})(EventEmitter);

module.exports = new Msghub();
