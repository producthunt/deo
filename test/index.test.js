import {expect} from 'chai'

import deo from '../src'

describe('deo', () => {
  it('returns the default value if the key is not present in the env', () => {
    const config = deo({ foo: true })
    expect(config('foo')).to.equal(true)
  })

  it('throws an error if the key does not exist', () => {
    const config = deo({})

    expect(() => {
      config('foo')
    }).to.throw("'foo' is not set!")
  })

  it('throws an error if any key is null or undefined', () => {
    expect(() => {
      deo({ foo: { bar: null } })
    }).to.throw("'foo.bar' must be set!")
  })

  it('returns an immutable structure', () => {
    const config = deo({
      foo: { bar: 0 }
    })

    const value = config('foo')

    expect(() => {
      value.bar = 1
    }).to.throw('Cannot change value "bar" to "1" of an immutable property')
  })

  it('can lookup nested keys', () => {
    const config = deo({
      foo: { bar: 0 }
    })

    expect(config('foo.bar')).to.equal(0)
  })

  it('returns the env value if the key is present in the env', () => {
    const config = deo(
      { foo: 'default', bar: { baz: 4, boo: { boo: 3 } } },
      { FOO: 'env', BAR_BAZ: 5, BAR_BOO_BOO: 4 }
    )

    expect(config('foo')).to.equal('env')
    expect(config('bar.baz')).to.equal(5)
    expect(config('bar.boo.boo')).to.equal(4)
  })
})
