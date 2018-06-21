'use strict'

const asyncHooks = require('async_hooks')
const Scope = require('./scope')

class ScopeManager {
  constructor () {
    this._id = -1
    this._set = []
    this._context = new Map()
    this.active = null

    this._setup()
  }

  activate (span, finishOnClose) {
    this._set.push(this.active)

    this.active = new Scope(span, this)

    return this.active
  }

  _deactivate (scope) {
    if (this.active === scope) {
      // assert.ok(this._set.length, "can't remove top context");
      this.active = this._set.pop()
      return
    }

    const index = this.stack.lastIndexOf(scope)

    this.stack.splice(index, 1)
  }

  _init () {
    this._hook = asyncHooks.createHook({
      init (asyncId, type, triggerAsyncId, resource) {
        this._id = asyncId
        this._context.set(asyncId, [])
      },

      destroy (asyncId) {
        this._context.delete(asyncId)
      }
    })

    this._hook.enable()
  }

  _destroy () {
    this._hook.disable()
  }
}

module.exports = ScopeManager

async_hooks.createHook({
  init (asyncId, type, triggerAsyncId, resource) {

  },
  before (asyncId) {

  },
  after (asyncId) {

  },
  destroy (asyncId) {
    currentUid = async_hooks.executionAsyncId()

    namespace._contexts.delete(asyncId)
  }
