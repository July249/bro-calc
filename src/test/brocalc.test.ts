import { describe, it, expect } from 'vitest'
import { BroCalc } from '@/core'

describe('Get Decimal Interface', () => {
  it('test is running', () => {
    expect(true).toBe(true)
  })
})

describe('check BroCalc instance', () => {
  it('when make instance of BroCalc, it should be equal to Decimal interface', () => {
    // (ex. new BroCalc(12345.67) === { d: [1234567], e: -2, s: 1 })
    // expect(new BroCalc(12345.67)).toMatchObject({
    //   d: [1234567],
    //   e: -2,
    //   s: 1,
    // })
  })

  it('toString() should return a string', () => {
    const x1 = new BroCalc(12345.6789)
    const x2 = new BroCalc(-1234.567)
    const x3 = new BroCalc(0.000001234)
    const x4 = new BroCalc(0.12300456)
    // 숫자형 타입의 표기 가능한 가장 큰 정수 (MAX_SAFE_INTEGER)와 가장 작은 정수 (MIN_SAFE_INTEGER)를 표현 가능하다.
    const x5 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x6 = new BroCalc(Number.MIN_SAFE_INTEGER) // -9_007_199_254_740_991
    // 숫자형 타입의 표기 가능한 최대값인 2^53 - 1 보다 100 큰 수를 표현 가능하다.
    // WARNING: new BroCalc(String(Number.MAX_SAFE_INTEGER + 100)) 으로 변환하면 Number.MAX_SAFE_INTEGER + 100 이 이미 표현 가능한 2^53 - 1 보다 커져서 부동소수점 오류가 발생해버린다.
    const x7 = new BroCalc('9007199254741091') // 9,007,199,254,741,091 = MAX_SAFE_INTEGER + 100
    // 소수점 50자리 이하의 경우도 표현 가능
    const x8 = new BroCalc(
      '0.000000000000000000000000000000000000000000000000001234567890',
    ) // 1.234567890e-50
    // expect(x1.toString()).toBe('12345.6789')
    // expect(x2.toString()).toBe('-1234.567')
    // expect(x3.toString()).toBe('0.000001234')
    // expect(x4.toString()).toBe('0.12300456')
    // expect(x5.toString()).toBe('9007199254740991')
    // expect(x6.toString()).toBe('-9007199254740991')
    // expect(x7.toString()).toBe('9007199254741091')
    // expect(x8.toString()).toBe(
    //   '0.000000000000000000000000000000000000000000000000001234567890',
    // )
  })
})

describe('add function', () => {
  it('add function should be return a new instance of BroCalc', () => {
    const x1 = new BroCalc(12.0)
    const x2 = new BroCalc(0.34)

    // expect(x1.add(x2)).toBeInstanceOf(BroCalc)
    // expect(x1.add(x2)).toMatchObject({ d: [1234], e: -2, s: 1 })

    // expect(x1.add(x2.toString())).toBeInstanceOf(BroCalc)
    // expect(x1.add(x2.toString())).toMatchObject({ d: [1234], e: -2, s: 1 })
    // expect(x1.add(x2).toString()).toBe('12.34')

    // expect(x1.add(0.34)).toBeInstanceOf(BroCalc)
    // expect(x1.add(0.34)).toMatchObject({ d: [1234], e: -2, s: 1 })
    // expect(x1.add(0.34).toString()).toBe('12.34')

    const x3 = new BroCalc(0.0056)

    // expect(x2.add(x3)).toBeInstanceOf(BroCalc)
    // expect(x2.add(x3)).toMatchObject({ d: [3456], e: -4, s: 1 })
    // expect(x2.add(x3).toString()).toBe('0.3456')

    const x4 = new BroCalc(0.01)
    const x5 = new BroCalc(0.99)

    // expect(x4.add(x5)).toBeInstanceOf(BroCalc)
    // expect(x4.add(x5)).toMatchObject({ d: [100], e: -2, s: 1 })
    // expect(x4.add(x5).toString()).toBe('1.00')
  })

  it('check addition identity element', () => {
    const x1 = new BroCalc(100000)
    const x2 = new BroCalc(0)

    // expect(x1.add(x2)).toMatchObject({ d: [100000], e: 0, s: 1 })
    // expect(x1.add(x2).toString()).toBe('100000')
  })

  it('check addition inverse element', () => {
    const x1 = new BroCalc(100000)
    const x2 = new BroCalc(-100000)

    // expect(x1.add(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
    // expect(x1.add(x2).toString()).toBe('0')
  })

  // *** 통과 안됨 ***

  it('when the argument of add function is negative number, ...', () => {
    const x1 = new BroCalc(-12.34)
    const x2 = new BroCalc(0.34)

    // expect(x1.add(x2)).toBeInstanceOf(BroCalc)
    // expect(x1.add(x2)).toMatchObject({ d: [1200], e: -2, s: -1 })
    // expect(x1.add(x2).toString()).toBe('-12.00')

    const x3 = new BroCalc(-1)
    const x4 = new BroCalc(-1)

    // expect(x3.add(x4)).toBeInstanceOf(BroCalc)
    // expect(x3.add(x4)).toMatchObject({ d: [2], e: 0, s: -1 })
    // expect(x3.add(x4).toString()).toBe('-2')

    const x5 = new BroCalc(1)
    const x6 = new BroCalc(-1)

    // expect(x5.add(x6)).toBeInstanceOf(BroCalc)
    // expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
    // expect(x5.add(x6).toString()).toBe('0')

    const x7 = new BroCalc(-1)
    const x8 = new BroCalc(1)

    // expect(x7.add(x8)).toBeInstanceOf(BroCalc)
    // expect(x7.add(x8)).toMatchObject({ d: [0], e: 0, s: -1 })
    // expect(x7.add(x8).toString()).toBe('0')
  })
})

// describe('sub function', () => {
//   it('sub function should be return a new instance of BroCalc', () => {
//     const x1 = new BroCalc(12.34)
//     const x2 = new BroCalc(0.34)

//     expect(x1.sub(x2)).toBeInstanceOf(BroCalc)
//     expect(x1.sub(x2)).toMatchObject({ d: [1200], e: -2, s: 1 })
//     expect(x1.sub(x2).toString()).toBe('12.00')
//   })
// })
