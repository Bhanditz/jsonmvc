const Emitter = require('events').EventEmitter
const most = require('most')
const _ = require('lodash')

function createController(controller, path) {
  let emitter = new Emitter()
  let inStream = most.fromEvent('data', emitter)
  let unsubscribes = []

  unsubscribes.push(db.on(path, x => {
    emitter.emit('data', x)
  }))

  let outStream = controller(inStream)

  unsubscribes.push(outStream.subscribe({
    next: x => {
      if (x && !_.isArray(x)) {
        x = [x]
      }
      db.patch(x)
    },
    complete: x => {
      console.log(`Controller ${name} has ended`)
    },
    error: x => {
      console.error(`Controller ${name} has an error`, x)
    }
  }))

  return function unsubscribeController() {
    unsubscribes.forEach(x => {
      x()
    })
  }
}


function createControllers(controllers, schema) {
  let names = Object.keys(controllers)

  let instances = names.reduce((acc, x) => {
    acc[x] = createController(controllers[x], schema[x])
    return acc
  }, {})

  return instances
}

module.exports = createControllers
