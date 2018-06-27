'use strict'

class Scope {
  constructor (span, context, finishSpanOnClose) {
    this._span = span
    this._context = context
    this._finishSpanOnClose = !!finishSpanOnClose
  }

  span () {
    return this._span
  }

  close () {
    if (this._finishSpanOnClose) {
      this._span.finish()
    }

    const index = this._context.set.lastIndexOf(this)

    this._context.set.splice(index, 1)
    this._context.active = this._context.set[this._context.set.length - 1]

    if (this._context.exited && !this._context.active) {
      this._context.destroy()
    }
  }
}

module.exports = Scope
