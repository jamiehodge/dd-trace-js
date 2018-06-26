'use strict'

const asyncHooks = require('./async_hooks')
const Scope = require('./scope')
const Context = require('./context')

class ScopeManager {
  constructor () {
    const id = -1
    const context = new Context(id)

    this._active = context
    this._set = []
    this._context = new Map([[ id, context ]])

    this._hook = asyncHooks.createHook({
      init: this._init.bind(this),
      before: this._before.bind(this),
      after: this._after.bind(this),
      destroy: this._destroy.bind(this),
      promiseResolve: this._promiseResolve.bind(this)
    })

    this._enable()
  }

  active () {
    let context = this._active

    while (context !== null) {
      if (context.active) {
        return context.active
      }

      context = context.parent
    }

    return null
  }

  activate (span, finishSpanOnClose) {
    const context = this._active
    const scope = new Scope(span, context, finishSpanOnClose)

    context.set.push(scope)
    context.active = scope

    return scope
  }

  _init (asyncId, type) {
    const parent = this._active
    const context = new Context(asyncId, parent)

    this._context.set(asyncId, context)

    this._retain(parent)
  }

  _before (asyncId) {
    const context = this._context.get(asyncId)

    this._enter(context)
  }

  _after (asyncId) {
    const context = this._context.get(asyncId)

    this._exit(context)
    this._remove(context) // remove early when possible
  }

  _destroy (asyncId) {
    const context = this._context.get(asyncId)

    this._remove(context) // remove on garbage collection
  }

  _promiseResolve (asyncId) {
    const context = this._context.get(asyncId)

    this._remove(context) // remove on promise resolve
  }

  _retain (context) {
    context && context.count++
  }

  _release (context) {
    context && context.count--
  }

  _enter (context) {
    this._set.push(this._active)
    this._active = context
  }

  _exit (context) {
    if (this.active === context) {
      if (this._set.length) {
        this.active = this._set.pop()
      }
    } else {
      const index = this._set.lastIndexOf(context)

      if (index !== -1) {
        this._set.splice(index, 1)
      }
    }
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

  _enable () {
    this._hook.enable()
  }

  _disable () {
    this._hook.disable()
  }
}

module.exports = ScopeManager
