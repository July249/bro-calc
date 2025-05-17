import { Numbra } from '@/core/numbra'

describe('div function', () => {
  it('divide two positive numbers', () => {
    const x1 = new Numbra(1)
    const x2 = new Numbra(2)
    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.5')
  })
  it('divide two negative numbers', () => {
    const x1 = new Numbra(-1)
    const x2 = new Numbra(-2)
    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.5')
  })
  it('divide one positive and one negative number', () => {
    const x1 = new Numbra(1)
    const x2 = new Numbra(-2)
    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: -1 })
    expect(x1.div(x2).toString()).toBe('-0.5')
    const x3 = new Numbra(-1)
    const x4 = new Numbra(2)
    expect(x3.div(x4)).toMatchObject({ d: [5], e: -1, s: -1 })
    expect(x3.div(x4).toString()).toBe('-0.5')
  })
  it('divide identity element', () => {
    const x1 = new Numbra(100)
    const x2 = new Numbra(1)
    expect(x1.div(x2)).toMatchObject({ d: [100], e: 0, s: 1 })
    expect(x1.div(x2).toString()).toBe('100')
    const x3 = new Numbra(1)
    const x4 = new Numbra(100)
    expect(x3.div(x4)).toMatchObject({ d: [1], e: -2, s: 1 })
    expect(x3.div(x4).toString()).toBe('0.01')
  })
  it('divide inverse element', () => {
    const x1 = new Numbra(0.1)
    const x2 = new Numbra(1)
    expect(x1.div(x2)).toMatchObject({ d: [1], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.1')
    const x3 = new Numbra(-0.1)
    const x4 = new Numbra(-1)
    expect(x3.div(x4)).toMatchObject({ d: [1], e: -1, s: 1 })
    expect(x3.div(x4).toString()).toBe('0.1')
    const x5 = new Numbra(0.125)
    const x6 = new Numbra(0.125)
    expect(x5.div(x6)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x5.div(x6).toString()).toBe('1')
    const x7 = new Numbra(Number.MAX_SAFE_INTEGER)
    const x8 = new Numbra(Number.MAX_SAFE_INTEGER)
    expect(x7.div(x8)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x7.div(x8).toString()).toBe('1')
    const x9 = new Numbra(Number.MIN_SAFE_INTEGER)
    const x10 = new Numbra(Number.MIN_SAFE_INTEGER)
    expect(x9.div(x10)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x9.div(x10).toString()).toBe('1')
  })
  it('if denominator is 0, it should be throw an error', () => {
    const x1 = new Numbra(1)
    const x2 = new Numbra(0)
    expect(() => x1.div(x2)).toThrow('Division by zero is not allowed')
  })
  it('the case of infinite decimal, it should be return with precision', () => {
    // default precision is 10
    const x1 = new Numbra(1)
    const x2 = new Numbra(3)
    expect(x1.div(x2)).toMatchObject({ d: [333, 3333333], e: -10, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.3333333333')

    // custom precision is 20
    const x3 = new Numbra(1, 20)
    const x4 = new Numbra(3, 20)
    expect(x3.div(x4)).toMatchObject({
      d: [333333, 3333333, 3333333],
      e: -20,
      s: 1,
    })
    expect(x3.div(x4).toString()).toBe('0.33333333333333333333')

    // custom precision is 15
    const x5 = new Numbra(1, 15)
    const x6 = new Numbra(6, 15)
    expect(x5.div(x6)).toMatchObject({
      d: [1, 6666666, 6666666],
      e: -15,
      s: 1,
    })
    expect(x5.div(x6).toString()).toBe('0.166666666666666')

    // custom precision is 15
    const x7 = new Numbra(1, 14)
    const x8 = new Numbra(7, 14)
    expect(x7.div(x8)).toMatchObject({ d: [1428571, 4285714], e: -14, s: 1 })
    expect(x7.div(x8).toString()).toBe('0.14285714285714')

    // custom precision is 10
    const x9 = new Numbra(1, 10)
    const x10 = new Numbra(9, 10)
    expect(x9.div(x10)).toMatchObject({ d: [111, 1111111], e: -10, s: 1 })
    expect(x9.div(x10).toString()).toBe('0.1111111111')
  })

  it('the case of very big number', () => {
    const x1 = new Numbra('1234567890123456789012345678901234567890')
    const x2 = new Numbra('9876543210987654321')
    expect(x1.div(x2)).toMatchObject({
      d: [124, 9999988, 6093750, 15488, 2812384],
      e: -10,
      s: 1,
    })

    expect(x1.div(x2).toString()).toBe('124999998860937500015.4882812384')

    const x3 = new Numbra('1234567890123456789012345678901234567890', 30)
    const x4 = new Numbra('9876543210987654321', 30)
    expect(x3.div(x4)).toMatchObject({
      d: [12, 4999998, 8609375, 1548, 8281238, 4313964, 8451960, 7543943],
      e: -30,
      s: 1,
    })
    expect(x3.div(x4).toString()).toBe('124999998860937500015.488281238431396484519607543943')
  })
})
