import { Numbra } from '@/core/numbra'

describe('sub function', () => {
  it('sub function should be return a new instance of Numbra', () => {
    const x1 = new Numbra(12.34)
    const x2 = new Numbra(0.34)
    expect(x1.sub(x2)).toBeInstanceOf(Numbra)
    expect(x1.sub(x2)).toMatchObject({ d: [1200], e: -2, s: 1 })
    expect(x1.sub(x2).toString()).toBe('12.00')
  })

  it('덧셈의 항등원 (0)', () => {
    const x1 = new Numbra(100000)
    const x2 = new Numbra(0)
    expect(x1.sub(x2)).toMatchObject({ d: [100000], e: 0, s: 1 })
    expect(x1.sub(x2).toString()).toBe('100000')
    const x3 = new Numbra(0)
    const x4 = new Numbra(100000)
    expect(x3.sub(x4)).toMatchObject({ d: [100000], e: 0, s: -1 })
    expect(x3.sub(x4).toString()).toBe('-100000')
    const x5 = new Numbra(0)
    const x6 = new Numbra(0)
    expect(x5.sub(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x5.sub(x6).toString()).toBe('0')
  })

  it('덧셈의 역원', () => {
    const x1 = new Numbra(100000)
    const x2 = new Numbra(-100000)
    expect(x1.sub(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x1.sub(x2).toString()).toBe('0')
    const x5 = new Numbra(1)
    const x6 = new Numbra(-1)
    expect(x5.sub(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x5.sub(x6).toString()).toBe('0')
    const x7 = new Numbra(-100000)
    const x8 = new Numbra(100000)
    expect(x7.sub(x8)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x7.sub(x8).toString()).toBe('0')
    const x9 = new Numbra(-1)
    const x10 = new Numbra(1)
    expect(x9.sub(x10)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x9.sub(x10).toString()).toBe('0')
  })

  it('different sign of arguments', () => {
    const x1 = new Numbra(12.34)
    const x2 = new Numbra(-0.34)
    expect(x1.sub(x2)).toMatchObject({ d: [1268], e: -2, s: 1 })
    expect(x1.sub(x2).toString()).toBe('12.68')
    const x3 = new Numbra(-12.34)
    const x4 = new Numbra(0.34)
    expect(x3.sub(x4)).toMatchObject({ d: [1268], e: -2, s: -1 })
    expect(x3.sub(x4).toString()).toBe('-12.68')
    const x5 = new Numbra(-5)
    const x6 = new Numbra(3)
    expect(x5.add(x6)).toMatchObject({ d: [2], e: 0, s: -1 })
    expect(x5.add(x6).toString()).toBe('-2')
    const x7 = new Numbra(3)
    const x8 = new Numbra(5)
    expect(x7.sub(x8)).toMatchObject({ d: [2], e: 0, s: -1 })
    expect(x7.sub(x8).toString()).toBe('-2')
    const x9 = new Numbra(5)
    const x10 = new Numbra(-3)
    expect(x9.sub(x10)).toMatchObject({ d: [8], e: 0, s: 1 })
    expect(x9.sub(x10).toString()).toBe('8')
    const x11 = new Numbra(5)
    const x12 = new Numbra(3)
    expect(x11.sub(x12)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x11.sub(x12).toString()).toBe('2')
    const x13 = new Numbra(-5)
    const x14 = new Numbra(-3)
    expect(x13.sub(x14)).toMatchObject({ d: [2], e: 0, s: -1 })
    expect(x13.sub(x14).toString()).toBe('-2')
  })
  it('even argument of sub function is over the Number.MIN_SAFE_INTEGER, it should be calculated correctly', () => {
    const x1 = new Numbra(Number.MIN_SAFE_INTEGER) // -9_007_199_254_740_991
    const x2 = new Numbra(100)
    expect(x1.sub(x2)).toMatchObject({ d: [90, 719925, 4741091], e: 0, s: -1 })
    expect(x1.sub(x2).toString()).toBe('-9007199254741091')
  })
  it('two different sign numbers', () => {
    const x1 = new Numbra(10000000)
    const x2 = new Numbra(1000)
    expect(x1.sub(x2)).toMatchObject({
      d: [9999000],
      e: 0,
      s: 1,
    })
    expect(x1.sub(x2).toString()).toBe('9999000')
  })
  it('enough big numbers sub', () => {
    const x1 = new Numbra(102734461911601)
    const x2 = new Numbra(80756122400245)
    expect(x1.sub(x2)).toMatchObject({
      d: [2197833, 9511356],
      e: 0,
      s: 1,
    })
    expect(x1.sub(x2).toString()).toBe('21978339511356')
  })
  it('333.3333333 - 55555555.55555 = -55555222.2222167', () => {
    const x1 = new Numbra('333.3333333')
    const x2 = new Numbra('55555555.55555')
    expect(x1.sub(x2)).toMatchObject({
      d: [5, 5555222, 2222167],
      e: -7,
      s: -1,
    })
    expect(x1.sub(x2).toString()).toBe('-55555222.2222167')
  })
  it('93.653709066251990591672543179386313 - 22222 = -22128.346290933748009408327456820613687', () => {
    const x1 = new Numbra('93.653709066251990591672543179386313')
    const x2 = new Numbra('22222')
    expect(x1.sub(x2)).toMatchObject({
      d: [221, 2834629, 933748, 94083, 2745682, 613687],
      e: -33,
      s: -1,
    })
    expect(x1.sub(x2).toString()).toBe(
      '-22128.346290933748009408327456820613687',
    )
  })
  it('93.6537090662519905916725431793863135 - 93.65370906625199059167254317938631349999999999 = 0.00000000000000000000000000000000000000000001', () => {
    const x1 = new Numbra('93.6537090662519905916725431793863135')
    const x2 = new Numbra('93.65370906625199059167254317938631349999999999')
    expect(x1.sub(x2)).toMatchObject({
      d: [1],
      e: -44,
      s: 1,
    })
    expect(x1.sub(x2).toString()).toBe(
      '0.00000000000000000000000000000000000000000001',
    )
  })
  it('936537090662519905916.72543179386313 - 22222 = 936537090662519883694.72543179386313', () => {
    const x1 = new Numbra('936537090662519905916.72543179386313')
    const x2 = new Numbra('22222')
    expect(x1.sub(x2)).toMatchObject({
      d: [9365370, 9066251, 9883694, 7254317, 9386313],
      e: -14,
      s: 1,
    })
    expect(x1.sub(x2).toString()).toBe('936537090662519883694.72543179386313')
  })
})
