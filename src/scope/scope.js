'use strict'

class Scope {
  constructor (span, manager, id) {
    this._id = id
    this._manager = manager
    this.span = span
  }

  close (finish) {
    finish && this.span.finish()
    this._manager._deactivate(this)
  }
}

module.exports = Scope
