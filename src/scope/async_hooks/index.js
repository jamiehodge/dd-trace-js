'use strict'

const semver = require('semver')

if (process && semver.gte(process.versions.node, '8.0.0')) {
  module.exports = require('./async_hooks')
} else if (process && semver.satisfies(process.versions.node, '^4.7 || ^6.9.2 || ^7.3')) {
  module.exports = require('./async_wrap')
} else {
  throw new Error('This version of Node is not supported.')
}
