'use strict'

class Scope {
  constructor (span, manager, id, finishOnClose) {
    this._id = id
    this._manager = manager
    this._finishOnClose = finishOnClose
    this.span = span
  }

  close () {
    this._manager._deactivate(this)
  }
}

module.exports = Scope
