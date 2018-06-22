'use strict'

const asyncHooks = require('./async_hooks')
const Scope = require('./scope')

class ScopeManager {
  constructor () {
    const id = asyncHooks.executionAsyncId()
    const context = this._createContext(id)

    this._context = new Map([[ id, context ]])

    this._init()
  }

  active () {
    const id = asyncHooks.executionAsyncId()

    let context = this._context.get(id)

    while (context !== null) {
      if (context.active) {
        return context.active
      }

      context = context.parent
    }

    return null
  }

  activate (span, finishOnClose) {
    const id = asyncHooks.executionAsyncId()
    const context = this._context.get(id)
    const scope = new Scope(span, this, id, finishOnClose)

    context.set.push(scope)
    context.active = scope

    return scope
  }

  _deactivate (scope) {
    const context = this._context.get(scope._id)

    if (!context) return

    const index = context.set.lastIndexOf(scope)

    context.set.splice(index, 1)
    context.active = context.set[context.set.length - 1]
  }

  _init () {
    const fs = require('fs')

    this._hook = asyncHooks.createHook({
      init: (asyncId, type, triggerAsyncId, resource) => {
        fs.writeSync(1, `init: ${asyncId}, trigger: ${triggerAsyncId}\n`)

        const parent = this._context.get(triggerAsyncId)
        const context = this._createContext(asyncId, parent)

        this._context.set(asyncId, context)

        this._retain(parent)
      },

      before: (asyncId) => {
        fs.writeSync(1, `before: ${asyncId}\n`)
      },

      after: (asyncId) => {
        fs.writeSync(1, `after: ${asyncId}\n`)

        const context = this._context.get(asyncId)

        this._remove(context) // remove early when possible
      },

      destroy: (asyncId) => {
        fs.writeSync(1, `destroy: ${asyncId}\n`)

        const context = this._context.get(asyncId)

        this._remove(context) // remove on garbage collection
      }
    })
  }

  _createContext (id, parent) {
    return {
      id,
      count: 0,
      parent: parent || null,
      active: null,
      set: []
    }
  }

  _retain (context) {
    context && context.count++
  }

  _release (context) {
    context && context.count--
  }

  _remove (context) {
    if (context && context.parent && context.count === 0) {
      context.count = -1

      for (let i = context.set.length - 1; i >= 0; i--) {
        context.set[i].close()
      }

      this._release(context.parent)
      this._remove(context.parent)
      this._context.delete(context.id)
    }
  }

  _destroy () {
    this._hook.disable()
  }
}

module.exports = ScopeManager
