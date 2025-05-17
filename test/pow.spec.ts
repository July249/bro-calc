import { Numbra } from '@/core/numbra'

// ********** Power handling Part **********
describe('pow function', () => {
  it('integer power', () => {
    const x1 = new Numbra(2)
    const x2 = new Numbra(3)
    expect(x1.pow(x2)).toMatchObject({ d: [8], e: 0, s: 1 })
    expect(x1.pow(x2).toString()).toBe('8')
    const x3 = new Numbra(2)
    const x4 = new Numbra(-3)
    expect(x3.pow(x4)).toMatchObject({ d: [125], e: -3, s: 1 })
    expect(x3.pow(x4).toString()).toBe('0.125')
    const x5 = new Numbra(-1)
    const x6 = new Numbra(2)
    expect(x5.pow(x6)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x5.pow(x6).toString()).toBe('1')
  })
  it('fractional power', () => {
    const x1 = new Numbra(2, 10)
    const x2 = new Numbra(0.5, 10)
    expect(() => x1.pow(x2)).toThrow('Non-integer exponent is not supported in this implementation.')
  })
  it('negative power', () => {
    const x1 = new Numbra(2)
    const x2 = new Numbra(-3)
    expect(x1.pow(x2)).toMatchObject({ d: [125], e: -3, s: 1 })
    expect(x1.pow(x2).toString()).toBe('0.125')
  })
  it('zero power', () => {
    const x1 = new Numbra(2)
    const x2 = new Numbra(0)
    expect(x1.pow(x2)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x1.pow(x2).toString()).toBe('1')
  })
  it('big number power', () => {
    const x1 = new Numbra(2)
    const x2 = new Numbra(100)

    expect(x1.pow(x2)).toMatchObject({
      d: [126, 7650600, 2282294, 149670, 3205376],
      e: 0,
      s: 1,
    })
    expect(x1.pow(x2).toString()).toBe('1267650600228229401496703205376')
  })
})
