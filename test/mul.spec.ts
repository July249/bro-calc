import { Numbra } from '@/core/numbra'

describe('mul function', () => {
  it('multiply two positive numbers', () => {
    const x1 = new Numbra(1000000)
    const x2 = new Numbra(1000000)
    expect(x1.mul(x2)).toMatchObject({ d: [100000, 0], e: 0, s: 1 })
    expect(x1.mul(x2).toString()).toBe('1000000000000')
    const x3 = new Numbra(10000000)
    const x4 = new Numbra(10000000)
    expect(x3.mul(x4)).toMatchObject({ d: [1, 0, 0], e: 0, s: 1 })
    expect(x3.mul(x4).toString()).toBe('100000000000000')
    const x5 = new Numbra(2)
    const x6 = new Numbra(3)
    expect(x5.mul(x6)).toMatchObject({ d: [6], e: 0, s: 1 })
    expect(x5.mul(x6).toString()).toBe('6')
    const x7 = new Numbra(20000)
    const x8 = new Numbra(30000)
    expect(x7.mul(x8)).toMatchObject({ d: [60, 0], e: 0, s: 1 })
    expect(x7.mul(x8).toString()).toBe('600000000')
  })
  it('multiply two negative numbers', () => {
    const x1 = new Numbra(-2)
    const x2 = new Numbra(-3)
    expect(x1.mul(x2)).toMatchObject({ d: [6], e: 0, s: 1 })
    expect(x1.mul(x2).toString()).toBe('6')
  })
  it('multiply one positive and one negative number', () => {
    const x1 = new Numbra(2)
    const x2 = new Numbra(-3)
    expect(x1.mul(x2)).toMatchObject({ d: [6], e: 0, s: -1 })
    expect(x1.mul(x2).toString()).toBe('-6')
    const x3 = new Numbra(-2)
    const x4 = new Numbra(3)
    expect(x3.mul(x4)).toMatchObject({ d: [6], e: 0, s: -1 })
    expect(x3.mul(x4).toString()).toBe('-6')
  })
  it('multiply identity element', () => {
    const x1 = new Numbra(123456789)
    const x2 = new Numbra(1)
    expect(x1.mul(x2)).toMatchObject({ d: [12, 3456789], e: 0, s: 1 })
    expect(x1.mul(x2).toString()).toBe('123456789')
    const x3 = new Numbra(-123456789)
    const x4 = new Numbra(1)
    expect(x3.mul(x4)).toMatchObject({ d: [12, 3456789], e: 0, s: -1 })
    expect(x3.mul(x4).toString()).toBe('-123456789')
    const x5 = new Numbra(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x6 = new Numbra(1)
    expect(x5.mul(x6)).toMatchObject({ d: [90, 719925, 4740991], e: 0, s: 1 })
    expect(x5.mul(x6).toString()).toBe('9007199254740991')
    const x7 = new Numbra(-Number.MAX_SAFE_INTEGER) // -9_007_199_254_740_991
    const x8 = new Numbra(1)
    expect(x7.mul(x8)).toMatchObject({ d: [90, 719925, 4740991], e: 0, s: -1 })
    expect(x7.mul(x8).toString()).toBe('-9007199254740991')
  })
  it('multiply inverse element', () => {
    const x1 = new Numbra(10)
    const x2 = new Numbra(0.1)
    expect(x1.mul(x2)).toMatchObject({ d: [10], e: -1, s: 1 })
    expect(x1.mul(x2).toString()).toBe('1.0')
    const x3 = new Numbra(-10)
    const x4 = new Numbra(-0.1)
    expect(x3.mul(x4)).toMatchObject({ d: [10], e: -1, s: 1 })
    expect(x3.mul(x4).toString()).toBe('1.0')
    const x5 = new Numbra(0.125)
    const x6 = new Numbra(8)
    expect(x5.mul(x6)).toMatchObject({ d: [1000], e: -3, s: 1 })
    expect(x5.mul(x6).toString()).toBe('1.000')
    const x7 = new Numbra(-0.125)
    const x8 = new Numbra(-8)
    expect(x7.mul(x8)).toMatchObject({ d: [1000], e: -3, s: 1 })
    expect(x7.mul(x8).toString()).toBe('1.000')
  })
  it('even the argument of mul function is over the 2^53 - 1, it should be calculated correctly', () => {
    const test1 = new Numbra(123456789)
    const test2 = new Numbra(123456789)
    expect(test1.mul(test2)).toMatchObject({
      d: [152, 4157875, 190521],
      e: 0,
      s: 1,
    })
    expect(test1.mul(test2).toString()).toBe('15241578750190521')
    const test3 = new Numbra('1234567890123456789012345678')
    const test4 = new Numbra('1234567890123456789012345678')
    expect(test3.mul(test4)).toMatchObject({
      d: [
        152415, 7875323, 8836750, 4953515, 4031397, 6765279, 6829976, 5279684,
      ],
      e: 0,
      s: 1,
    })
    expect(test3.mul(test4).toString()).toBe(
      '1524157875323883675049535154031397676527968299765279684',
    )
    const x1 = new Numbra(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x2 = new Numbra(2)
    expect(x1.mul(x2)).toMatchObject({
      d: [180, 1439850, 9481982],
      e: 0,
      s: 1,
    })
    expect(x1.mul(x2).toString()).toBe('18014398509481982')
    const x3 = new Numbra(Number.MAX_SAFE_INTEGER)
    const x4 = new Numbra(Number.MAX_SAFE_INTEGER)
    expect(x3.mul(x4)).toMatchObject({
      d: [8112, 9638414, 6066636, 8139049, 5662081],
      e: 0,
      s: 1,
    })
    expect(x3.mul(x4).toString()).toBe('81129638414606663681390495662081')
  })
  it('multiply more test cases', () => {
    const x1 = new Numbra('1234567890123456789012345678')
    const x2 = new Numbra('0.0000000000000000000000000001')
    expect(x1.mul(x2)).toMatchObject({
      d: [1234567, 8901234, 5678901, 2345678],
      e: -28,
      s: 1,
    })
    expect(x1.mul(x2).toString()).toBe('0.1234567890123456789012345678')
  })
  it('multiply many digits', () => {
    const x1 = new Numbra(
      '99999999999999999999999999999999999999999999999999999',
    )
    const x2 = new Numbra(
      '0.0000000000000000000000000000000000000000000000000001',
    )
    expect(x1.mul(x2)).toMatchObject({
      d: [9999, 9999999, 9999999, 9999999, 9999999, 9999999, 9999999, 9999999],
      e: -52,
      s: 1,
    })
    expect(x1.mul(x2).toString()).toBe(
      '9.9999999999999999999999999999999999999999999999999999',
    )
  })
})
