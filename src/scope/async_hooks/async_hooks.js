'use strict'

const asyncHooks = require('async_hooks')

module.exports = {
  createHook: asyncHooks.createHook.bind(asyncHooks),

  executionAsyncId: asyncHooks.executionAsyncId
    ? asyncHooks.executionAsyncId.bind(asyncHooks) // Node >=8.2.0
    : asyncHooks.currentId.bind(asyncHooks) // Node >=8.0.0 <8.2.0
}
