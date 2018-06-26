'use strict'

class Context {
  constructor (id, parent) {
    this.id = id
    this.parent = parent || null
    this.active = null
    this.count = 0
    this.set = []
  }
}

module.exports = Context