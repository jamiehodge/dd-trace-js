'use strict'

const fs = require('fs')
const asyncHooks = require('async_hooks')
const Scope = require('./scope')

// TODO: use currentId() if executionAsyncId() is not available

class ScopeManager {
  constructor () {
    const id = asyncHooks.executionAsyncId()
    const context = {
      id,
      count: 0,
      parent: null,
      active: null,
      set: []
    }

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
    if (scope._finishOnClose) {
      scope.span.finish()
    }

    const context = this._context.get(scope._id)

    if (!context) return

    const index = context.set.lastIndexOf(scope)

    context.set.splice(index, 1)
    context.active = context.set[context.set.length - 1]
  }

  _init () {
    this._hook = asyncHooks.createHook({
      init: (asyncId, type, triggerAsyncId, resource) => {
        const parent = this._context.get(triggerAsyncId)

        this._context.set(asyncId, {
          id: asyncId,
          count: 0,
          parent,
          active: null,
          set: []
        })

        this._retain(parent)
      },

      destroy: (asyncId) => {
        const context = this._context.get(asyncId)

        this._remove(context)
      }
    })

    this._hook.enable()
  }

  _retain (context) {
    context && context.count++
  }

  _release (context) {
    context && context.count--
  }

  _remove (context) {
    if (context && context.count === 0) {
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
