###*
 * @name msghub
 * @description A simple msghub to communicate in a clustered environ
 * @author Valiton GmbH, Bastian "hereandnow" Behrens
###

###*
 * Standard library imports
###
EventEmitter = require('events').EventEmitter
cluster = require 'cluster'

###*
 * 3rd library imports
###
SimplePool = require 'simple-pool'


class Msghub extends EventEmitter

  ###*
   * send to the master
   *
   * @param {array} args where args[0] is the event and args[1] is the message
   * @param {string} to which is one of all|get|random
   * @private
  ###
  _send = (args, to) ->
    process.nextTick ->
      msg = if args.length is 2 then args[1] else args[1..]
      process.send type: 'msghub', event: args[0], msg: msg, to: to


  ###*
   * when a new Listener is added, put it into the SimplePool
   *
   * @param {array} args where args[0] is the event and args[1] is the message
   * @param {string} to which is one of all|get|random
   * @private
  ###
  _addListener = (msg) ->
    for id, worker of cluster.workers
      if worker.process.pid is msg.pid
        @pool[msg.listener] or= new SimplePool()
        @pool[msg.listener].add worker


  ###*
   * create a new Msghub instance
   *
   * @memberOf global
   *
   * @constructor
   * @this {Msghub}
  ###
  constructor: ->
    if cluster.isMaster
      @listeners = {}
      @pool = {}
      process.nextTick =>
        for id, worker of cluster.workers
          worker.on 'message', (msg) =>
            return _addListener.call this, msg if msg.type is 'msghubListener'
            if msg.type is 'msghub' and @pool[msg.event]?
              to = @pool[msg.event][msg.to]()
              return to.send msg unless Array.isArray to
              to.forEach (_worker) ->
                _worker.send msg
    else
      @setMaxListeners 0
      @on 'newListener', (listener) ->
        process.send type: 'msghubListener', listener: listener, pid: process.pid
      process.on 'message', (msg) =>
        return if msg.type isnt 'msghub'
        @emit msg.event, msg.msg


  ###*
   * send a message to all workers who binded to the given event
   *
   * @param {string} event send only to workers which binded to this event
   * @param {*} message the message which should be sent
   * @function global.Msghub.prototype.send
  ###
  send: (args...) -> _send args, 'all'


  ###*
   * send a message to a worker who binded to the given event in a roundrobin manner
   *
   * @param {string} event consider only workers which binded to this event
   * @param {*} message the message which should be sent
   * @function global.Msghub.prototype.send
  ###
  roundrobin: (args...) -> _send args, 'get'


  ###*
   * send a message to a worker who binded to the given event in a random manner
   *
   * @param {string} event consider only workers which binded to this event
   * @param {*} message the message which should be sent
   * @function global.Msghub.prototype.send
  ###
  random: (args...) -> _send args, 'random'


module.exports = new Msghub()