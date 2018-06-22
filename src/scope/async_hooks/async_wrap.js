'use strict'

const asyncHook = require('async-hook-jl')

const parents = {}

let currentUid = -1

module.exports = {
  createHook: (callbacks) => {
    const hooks = {
      init: (uid, handle, provider, parentUid, parentHandle) => {
        parents[uid] = parentUid
        callbacks.init(uid, provider, parentUid, parentHandle)
      },
      pre: (uid, handle) => {
        currentUid = uid
        callbacks.before(uid)
      },
      post: (uid, handle, didThrow) => {
        callbacks.after(uid)
        currentUid = parents[uid] || -1
      },
      destroy: (uid) => {
        callbacks.destroy(uid)
        delete parents[uid]
      }
    }

    asyncHook.addHooks(hooks)
    asyncHook.enable()

    return {
      disable: () => asyncHook.removeHooks(hooks)
    }
  },

  executionAsyncId: () => currentUid
}
