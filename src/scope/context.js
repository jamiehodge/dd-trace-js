'use strict'

class Context {
  constructor (id, parent) {
    this.id = id
    this.parent = parent || null
    this.children = new Map()
    this.active = null
    this.count = 0
    this.exited = false
    this.set = []
  }

  retain () {
    this.count++
  }

  release () {
    this.count--
  }

  remove () {
    if (this.parent) {
      if (this.set.length === 0) {
        this.destroy()
      } else if (this.count === 0) {
        for (let i = this.set.length - 1; i >= 0; i--) {
          this.set[i].close()
        }
      }
    }
  }

  link () {
    if (this.parent) {
      this.parent.children.set(this.id, this)
      this.parent.retain()
    }
  }

  destroy () {
    if (this.parent) {
      this.children.forEach((child) => {
        child.parent = this.parent
        this.parent.children.set(child.id, child)
        this.parent.retain()
      })
      this.children.clear()

      this.parent.children.delete(this.id)
      this.parent.release()
      this.parent.remove()
      this.parent = null
      this.count = -1
    }
  }
}

module.exports = Context
