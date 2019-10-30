import Layout from '../src/layout'

describe('Layout', () => {
  let layout
  beforeEach(() => {
    layout = new Layout({})
  })
  describe('CRUD', () => {
    it('should run on config change', (done) => {
      layout.update([1])
      layout.coords = [1]
      layout.on('end', done)
      layout.p = { v: 'value' }
    })
  })
})
