import { Numbra } from '@/core/numbra'

// ********** Square root handling Part **********
describe('sqrt function', () => {
  it('square root', () => {
    const x1 = new Numbra(4)
    expect(x1.sqrt()).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt().toString()).toBe('2')
  })
  it(' cube root', () => {
    const x1 = new Numbra(8)
    expect(x1.sqrt(3)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(3).toString()).toBe('2')
  })
  it('fourth root', () => {
    const x1 = new Numbra(16)
    expect(x1.sqrt(4)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(4).toString()).toBe('2')
  })
  it('fifth root', () => {
    const x1 = new Numbra(32)
    expect(x1.sqrt(5)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(5).toString()).toBe('2')
  })
  it('11 root', () => {
    const x1 = new Numbra(2048)
    expect(x1.sqrt(11)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(11).toString()).toBe('2')
  })
  it('100 root', () => {
    const x1 = new Numbra('1267650600228229401496703205376')
    expect(x1.sqrt(100)).toMatchObject({
      d: [2],
      e: 0,
      s: 1,
    })
    expect(x1.sqrt(100).toString()).toBe('2')
  })
})
