import { Numbra } from '@/core/numbra'

describe('equation function', () => {
  it('equation function is for string equation formation', () => {
    expect(Numbra.equation('1+2*3')).toMatchObject({ d: [7], e: 0, s: 1 })
    expect(Numbra.equation('1+2*3').toString()).toBe('7')
  })
  it('equation function should be return a new instance of Numbra', () => {
    expect(Numbra.equation('12/4')).toMatchObject({ d: [3], e: 0, s: 1 })
    expect(Numbra.equation('12/4').toString()).toBe('3')
  })
  it('equation function should handle addition correctly', () => {
    expect(Numbra.equation('5+3')).toMatchObject({ d: [8], e: 0, s: 1 })
    expect(Numbra.equation('5+3').toString()).toBe('8')
  })

  it('equation function should handle subtraction correctly', () => {
    expect(Numbra.equation('10-4')).toMatchObject({ d: [6], e: 0, s: 1 })
    expect(Numbra.equation('10-4').toString()).toBe('6')
  })

  it('equation function should handle multiplication correctly', () => {
    expect(Numbra.equation('7*6')).toMatchObject({ d: [42], e: 0, s: 1 })
    expect(Numbra.equation('7*6').toString()).toBe('42')
  })

  it('equation function should handle division correctly', () => {
    expect(Numbra.equation('20/5')).toMatchObject({ d: [4], e: 0, s: 1 })
    expect(Numbra.equation('20/5').toString()).toBe('4')
  })

  it('equation function should handle mixed operations correctly', () => {
    expect(Numbra.equation('2+3*4')).toMatchObject({ d: [14], e: 0, s: 1 })
    expect(Numbra.equation('2+3*4').toString()).toBe('14')
  })

  it('equation function should handle parentheses correctly', () => {
    expect(Numbra.equation('(2+3)*4')).toMatchObject({ d: [20], e: 0, s: 1 })
    expect(Numbra.equation('(2+3)*4').toString()).toBe('20')
    expect(Numbra.equation('((4*6)+1)/5')).toMatchObject({ d: [5], e: 0, s: 1 })
    expect(Numbra.equation('((4*6)+1)/5').toString()).toBe('5')
  })

  it('equation function should handle negative numbers correctly', () => {
    expect(Numbra.equation('-5+3')).toMatchObject({ d: [2], e: 0, s: -1 })
    expect(Numbra.equation('-5+3').toString()).toBe('-2')
    expect(Numbra.equation('3-5')).toMatchObject({ d: [2], e: 0, s: -1 })
    expect(Numbra.equation('3-5').toString()).toBe('-2')
  })

  it('equation function should handle decimal numbers correctly', () => {
    expect(Numbra.equation('1.5+2.5')).toMatchObject({ d: [40], e: -1, s: 1 })
    expect(Numbra.equation('1.5+2.5').toString()).toBe('4.0')
  })

  it('equation function should handle exponentiation correctly', () => {
    expect(Numbra.equation('2^3')).toMatchObject({ d: [8], e: 0, s: 1 })
    expect(Numbra.equation('2^3').toString()).toBe('8')
  })

  it('equation function should handle complex expressions correctly', () => {
    expect(Numbra.equation('3+5*2-8/4')).toMatchObject({ d: [11], e: 0, s: 1 })
    expect(Numbra.equation('3+5*2-8/4').toString()).toBe('11')
  })

  it('equation function should handle square root correctly', () => {
    expect(Numbra.equation('24*sqrt(16)')).toMatchObject({
      d: [96],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('24*sqrt(16)').toString()).toBe('96')
  })

  it('equation function should work well, even over big number case', () => {
    expect(Numbra.equation('123456789*987654321/123456789')).toMatchObject({
      d: [98, 7654321],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('123456789*987654321/123456789').toString()).toBe('987654321')
  })

  it('equation function should be able to chaining operations', () => {
    expect(Numbra.equation('24*sqrt(16)/2').add(1)).toMatchObject({
      d: [49],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('24*sqrt(16)/2').add(1).toString()).toBe('49')
  })

  it('argument of equation function can be expression by using backtick', () => {
    expect(
      Numbra.equation(
        `
      (
        6
        *
        4
      )
      *
      sqrt(16)
      /
      2
    `,
      ).add(1),
    ).toMatchObject({
      d: [49],
      e: 0,
      s: 1,
    })
  })

  it('parentheses should be paired correctly', () => {
    expect(() => Numbra.equation('(2+3*4')).toThrow('Invalid equation: Unmatched opening parenthesis')
  })
})
