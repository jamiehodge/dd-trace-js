'use strict'

// const Span = require('../../src/span')
const Scope = require('../../src/scope/scope')

describe('ScopeManager', () => {
  let ScopeManager
  let scopeManager

  beforeEach(() => {
    ScopeManager = require('../../src/scope/scope_manager')
    scopeManager = new ScopeManager()
  })

  afterEach(() => {
    scopeManager._destroy()
  })

  it('should support activating a span', () => {
    const span = {}

    scopeManager.activate(span)

    expect(scopeManager.active()).to.be.instanceof(Scope)
    expect(scopeManager.active().span).to.equal(span)
  })

  it('should support closing a scope', () => {
    const span = {}
    const scope = scopeManager.activate(span)

    scope.close()

    expect(scopeManager.active()).to.be.null
  })

  it('should support multiple simultaneous scopes', () => {
    const span1 = {}
    const span2 = {}
    const scope1 = scopeManager.activate(span1)
    const scope2 = scopeManager.activate(span2)

    expect(scopeManager.active()).to.equal(scope2)

    scope2.close()

    expect(scopeManager.active()).to.equal(scope1)

    scope1.close()

    expect(scopeManager.active()).to.be.null
  })

  it('should support automatically finishing the span on close', () => {
    const span = { finish: sinon.stub() }
    const scope = scopeManager.activate(span, true)

    scope.close()

    expect(span.finish).to.have.been.called
  })

  it('should automatically close pending scopes when the context exits', done => {
    const span1 = {}
    const span2 = {}

    let scope1
    let scope2

    setTimeout(() => {
      scope1 = scopeManager.activate(span1)
      scope2 = scopeManager.activate(span2)

      sinon.spy(scope1, 'close')
      sinon.spy(scope2, 'close')
    })

    setTimeout(() => {
      expect(scope1.close).to.have.been.called
      expect(scope2.close).to.have.been.called

      done()
    })
  })

  it('should wait the end of the asynchronous context before closing pending scopes', done => {
    const span = {}

    let scope

    setTimeout(() => {
      scope = scopeManager.activate(span)

      sinon.spy(scope, 'close')

      setTimeout(() => {
        expect(scope.close).to.not.have.been.called

        done()
      })
    })
  })

  it('should propagate parent context to children', done => {
    const span = {}
    const scope = scopeManager.activate(span)

    setTimeout(() => {
      expect(scopeManager.active()).to.equal(scope)

      done()
    })
  })

  // it('should propagate parent context to ancestors', done => {
  //   const span1 = {}
  //   const span2 = {}
  //   const scope1 = scopeManager.activate(span1)

  //   setTimeout(() => {
  //     const scope2 = scopeManager.activate(span2)

  //     setTimeout(() => {
  //       expect(scopeManager.active()).to.equal(scope1)

  //       done()
  //     })

  //     scope2.close()
  //   })
  // })

  // it('should support asynchronous scopes using timers', () => {
  //   const span1 = {}
  //   const span2 = {}
  //   const span3 = {}

  //   const scope1 = scopeManager.activate()

  //   setImmediate(() => {
  //     const scope2 = scopeManager.activate(span1)

  //     setImmediate(() => {
  //       const scope3 = scopeManager.activate(span1)
  //     })
  //   })

  //   expect()
  //   const scope2 = scopeManager.activate(span2)

  //   expect(scopeManager.active()).to.equal(scope2)

  //   scope2.close()

  //   expect(scopeManager.active()).to.equal(scope1)

  //   scope1.close()

  //   expect(scopeManager.active()).to.be.null
  // })
})
