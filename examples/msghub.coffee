# run this from your project-directory like this:
# $ coffee examples/msghub.coffee

cluster = require 'cluster'
msghub = require "#{process.cwd()}/lib/msghub"


if cluster.isMaster
  # just creating 5 simple workers
  # and forward the number to the worker
  for i in [1..5]
    cluster.fork WORKERCOUNT: i

else

  # when the current worker isnt the last worker, then append the listener (because we use the last worker for sending)
  if parseInt(process.env.WORKERCOUNT, 10) isnt 5
    msghub.on 'my-test-listener', (msg) ->
      console.log "GOT MESSAGE: #{process.env.WORKERCOUNT}: #{msg}"
  else
    # the last worker will send all messages

    # send to all listeners:
    setTimeout ->
      msghub.send 'my-test-listener', 'send to all listeners'
    , 500

    # send to a random listeners:
    setTimeout ->
      msghub.random 'my-test-listener', 'send random'
    , 1000

    # send to 1 listeners in roundrobin manner:
    # this isnt necessarly the order in which you create the workers, because the cluster-module will not
    # spawn the workers exactly in this order! but you will see in this example, that the order of this output
    # will be 3 times the same!
    setTimeout ->
      for i in [1..12]
        setTimeout ->
          msghub.roundrobin 'my-test-listener', 'send roundrobin'
        , i * 10
    , 2000