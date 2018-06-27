'use strict'

const fs = require('fs')

class Context {
  constructor (id, parent) {
    this.id = id
    this.parent = parent || null
    this.children = new Map()
    this.active = null
    this.count = 0
    this.exited = false
    this.set = []

    fs.writeSync(1, `context ctor: ${this.id} ${parent && this.parent.id}\n`)

    if (parent) {
      parent.children.set(id, this)
      parent.retain()
    }
  }

  retain () {
    this.count++
  }

  release () {
    this.count--
  }

  remove () {
    if (this.parent) {
      // test
    }
  }

  destroy () {
    if (this.parent) {
      fs.writeSync(1, `context dest: ${this.id} ${this.parent.id}\n`)

      this.children.forEach((child) => {
        child.parent = this.parent
        this.parent.children.set(child.id, child)
        this.parent.retain()
      })

      this.parent.children.delete(this.id)
      this.parent.release()
      // this.parent = null
      // this.count = 0
    }
  }
}

module.exports = Context
