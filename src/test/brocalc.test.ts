import { describe, it, expect } from 'vitest'
import { BroCalc } from '@/core'

describe('Get Decimal Interface', () => {
  it('test is running', () => {
    expect(true).toBe(true)
  })
})

// describe('check BroCalc instance', () => {
//   it('when make instance of BroCalc, it should be equal to Decimal interface', () => {
//     // (ex. new BroCalc(12345.67) === { d: [1234567], e: -2, s: 1 })
//     expect(new BroCalc(12345.67)).toMatchObject({
//       d: [1234567],
//       e: -2,
//       s: 1,
//     })
//   })

//   it('toString() should return a string', () => {
//     const x1 = new BroCalc(12345.6789)
//     const x2 = new BroCalc(-1234.567)
//     const x3 = new BroCalc(0.000001234)
//     const x4 = new BroCalc(0.12300456)
//     // 숫자형 타입의 표기 가능한 가장 큰 정수 (MAX_SAFE_INTEGER)와 가장 작은 정수 (MIN_SAFE_INTEGER)를 표현 가능하다.
//     const x5 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
//     const x6 = new BroCalc(Number.MIN_SAFE_INTEGER) // -9_007_199_254_740_991
//     // 숫자형 타입의 표기 가능한 최대값인 2^53 - 1 보다 100 큰 수를 표현 가능하다.
//     // WARNING: new BroCalc(String(Number.MAX_SAFE_INTEGER + 100)) 으로 변환하면 Number.MAX_SAFE_INTEGER + 100 이 이미 표현 가능한 2^53 - 1 보다 커져서 부동소수점 오류가 발생해버린다.
//     const x7 = new BroCalc('9007199254741091') // 9,007,199,254,741,091 = MAX_SAFE_INTEGER + 100
//     // 소수점 50자리 이하의 경우도 표현 가능
//     const x8 = new BroCalc(
//       '0.000000000000000000000000000000000000000000000000001234567890',
//     ) // 1.234567890e-50
//     expect(x1.toString()).toBe('12345.6789')
//     expect(x2.toString()).toBe('-1234.567')
//     expect(x3.toString()).toBe('0.000001234')
//     expect(x4.toString()).toBe('0.12300456')
//     expect(x5.toString()).toBe('9007199254740991')
//     expect(x6.toString()).toBe('-9007199254740991')
//     expect(x7.toString()).toBe('9007199254741091')
//     expect(x8.toString()).toBe(
//       '0.000000000000000000000000000000000000000000000000001234567890',
//     )
//   })
// })

// ********** Addition Part **********
// describe('add function', () => {
//   it('add function should be return a new instance of BroCalc', () => {
//     const x1 = new BroCalc(12.0)
//     const x2 = new BroCalc(0.34)
//     expect(x1.add(x2)).toMatchObject({ d: [1234], e: -2, s: 1 })
//     expect(x1.add(x2).toString()).toBe('12.34')
//     expect(x1.add(0.34)).toMatchObject({ d: [1234], e: -2, s: 1 })
//     expect(x1.add(0.34).toString()).toBe('12.34')
//     const x3 = new BroCalc(0.0056)
//     expect(x2.add(x3)).toMatchObject({ d: [3456], e: -4, s: 1 })
//     expect(x2.add(x3).toString()).toBe('0.3456')
//     const x4 = new BroCalc(0.01)
//     const x5 = new BroCalc(0.99)
//     expect(x4.add(x5)).toMatchObject({ d: [100], e: -2, s: 1 })
//     expect(x4.add(x5).toString()).toBe('1.00')
//   })
//   it('check addition identity element', () => {
//     const t1 = new BroCalc(1)
//     const t2 = 2
//     expect(t1.add(t2).toString()).toBe('3')
//     const x1 = new BroCalc(100000)
//     const x2 = new BroCalc(0)
//     expect(x1.add(x2)).toMatchObject({ d: [100000], e: 0, s: 1 })
//     expect(x1.add(x2).toString()).toBe('100000')
//     const x3 = new BroCalc(0)
//     const x4 = new BroCalc(100000)
//     expect(x3.add(x4)).toMatchObject({ d: [100000], e: 0, s: 1 })
//     expect(x3.add(x4).toString()).toBe('100000')
//     const x5 = new BroCalc(0)
//     const x6 = new BroCalc(0)
//     expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
//     expect(x5.add(x6).toString()).toBe('0')
//   })
//   it('check addition inverse element', () => {
//     const x1 = new BroCalc(100000)
//     const x2 = new BroCalc(-100000)
//     expect(x1.add(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
//     expect(x1.add(x2).toString()).toBe('0')
//     const x5 = new BroCalc(1)
//     const x6 = new BroCalc(-1)
//     expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
//     expect(x5.add(x6).toString()).toBe('0')
//   })
//   it('even argument of add function is over the Number.MAX_SAFE_INTEGER, it should be calculated correctly', () => {
//     const x1 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
//     const x2 = new BroCalc(1000000000000000)
//     expect(x1.add(x2)).toMatchObject({ d: [100, 719925, 4740991], e: 0, s: 1 })
//     expect(x1.add(x2).toString()).toBe('10007199254740991')
//     const x3 = new BroCalc('14400000000000000')
//     const x4 = new BroCalc('100000010000000')
//     expect(x3.add(x4)).toMatchObject({ d: [145, 1, 0], e: 0, s: 1 })
//     expect(x3.add(x4).toString()).toBe('14500000010000000')
//   })
//   it('add two different sign numbers', () => {
//     const x1 = new BroCalc(10000000)
//     const x2 = new BroCalc(-1000)
//     expect(x1.add(x2)).toMatchObject({
//       d: [9999000],
//       e: 0,
//       s: 1,
//     })
//     expect(x1.add(x2).toString()).toBe('9999000')
//   })
//   it('enough big numbers add', () => {
//     const x1 = new BroCalc(102734461911601)
//     const x2 = new BroCalc(-80756122400245)
//     expect(x1.add(x2)).toMatchObject({
//       d: [2197833, 9511356],
//       e: 0,
//       s: 1,
//     })
//     expect(x1.add(x2).toString()).toBe('21978339511356')
//   })
// })

// ********** Subtraction Part **********
// describe('sub function', () => {
//   it('sub function should be return a new instance of BroCalc', () => {
//     const x1 = new BroCalc(12.34)
//     const x2 = new BroCalc(0.34)
//     expect(x1.sub(x2)).toBeInstanceOf(BroCalc)
//     expect(x1.sub(x2)).toMatchObject({ d: [1200], e: -2, s: 1 })
//     expect(x1.sub(x2).toString()).toBe('12.00')
//   })
//   it('different sign of arguments', () => {
//     const x1 = new BroCalc(12.34)
//     const x2 = new BroCalc(-0.34)
//     expect(x1.sub(x2)).toMatchObject({ d: [1268], e: -2, s: 1 })
//     expect(x1.sub(x2).toString()).toBe('12.68')
//     const x3 = new BroCalc(-12.34)
//     const x4 = new BroCalc(0.34)
//     expect(x3.sub(x4)).toMatchObject({ d: [1268], e: -2, s: -1 })
//     expect(x3.sub(x4).toString()).toBe('-12.68')
//   })
//   it('even argument of sub function is over the Number.MIN_SAFE_INTEGER, it should be calculated correctly', () => {
//     const x1 = new BroCalc(Number.MIN_SAFE_INTEGER) // -9_007_199_254_740_991
//     const x2 = new BroCalc(100)
//     expect(x1.sub(x2)).toMatchObject({ d: [90, 719925, 4741091], e: 0, s: -1 })
//     expect(x1.sub(x2).toString()).toBe('-9007199254741091')
//   })
//   it('two different sign numbers', () => {
//     const x1 = new BroCalc(10000000)
//     const x2 = new BroCalc(1000)
//     expect(x1.sub(x2)).toMatchObject({
//       d: [9999000],
//       e: 0,
//       s: 1,
//     })
//     expect(x1.sub(x2).toString()).toBe('9999000')
//   })
//   it('enough big numbers sub', () => {
//     const x1 = new BroCalc(102734461911601)
//     const x2 = new BroCalc(80756122400245)
//     expect(x1.sub(x2)).toMatchObject({
//       d: [2197833, 9511356],
//       e: 0,
//       s: 1,
//     })
//     expect(x1.sub(x2).toString()).toBe('21978339511356')
//   })
// })

// ********** Multiplication Part **********
// describe('mul function', () => {
//   it('multiply two positive numbers', () => {
//     const x1 = new BroCalc(1000000)
//     const x2 = new BroCalc(1000000)
//     expect(x1.mul(x2)).toMatchObject({ d: [100000, 0], e: 0, s: 1 })
//     expect(x1.mul(x2).toString()).toBe('1000000000000')
//     const x3 = new BroCalc(10000000)
//     const x4 = new BroCalc(10000000)
//     expect(x3.mul(x4)).toMatchObject({ d: [1, 0, 0], e: 0, s: 1 })
//     expect(x3.mul(x4).toString()).toBe('100000000000000')
//     const x5 = new BroCalc(2)
//     const x6 = new BroCalc(3)
//     expect(x5.mul(x6)).toMatchObject({ d: [6], e: 0, s: 1 })
//     expect(x5.mul(x6).toString()).toBe('6')
//     const x7 = new BroCalc(20000)
//     const x8 = new BroCalc(30000)
//     expect(x7.mul(x8)).toMatchObject({ d: [60, 0], e: 0, s: 1 })
//     expect(x7.mul(x8).toString()).toBe('600000000')
//   })
//   it('multiply two negative numbers', () => {
//     const x1 = new BroCalc(-2)
//     const x2 = new BroCalc(-3)
//     expect(x1.mul(x2)).toMatchObject({ d: [6], e: 0, s: 1 })
//     expect(x1.mul(x2).toString()).toBe('6')
//   })
//   it('multiply one positive and one negative number', () => {
//     const x1 = new BroCalc(2)
//     const x2 = new BroCalc(-3)
//     expect(x1.mul(x2)).toMatchObject({ d: [6], e: 0, s: -1 })
//     expect(x1.mul(x2).toString()).toBe('-6')
//     const x3 = new BroCalc(-2)
//     const x4 = new BroCalc(3)
//     expect(x3.mul(x4)).toMatchObject({ d: [6], e: 0, s: -1 })
//     expect(x3.mul(x4).toString()).toBe('-6')
//   })
//   it('multiply identity element', () => {
//     const x1 = new BroCalc(123456789)
//     const x2 = new BroCalc(1)
//     expect(x1.mul(x2)).toMatchObject({ d: [12, 3456789], e: 0, s: 1 })
//     expect(x1.mul(x2).toString()).toBe('123456789')
//     const x3 = new BroCalc(-123456789)
//     const x4 = new BroCalc(1)
//     expect(x3.mul(x4)).toMatchObject({ d: [12, 3456789], e: 0, s: -1 })
//     expect(x3.mul(x4).toString()).toBe('-123456789')
//     const x5 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
//     const x6 = new BroCalc(1)
//     expect(x5.mul(x6)).toMatchObject({ d: [90, 719925, 4740991], e: 0, s: 1 })
//     expect(x5.mul(x6).toString()).toBe('9007199254740991')
//     const x7 = new BroCalc(-Number.MAX_SAFE_INTEGER) // -9_007_199_254_740_991
//     const x8 = new BroCalc(1)
//     expect(x7.mul(x8)).toMatchObject({ d: [90, 719925, 4740991], e: 0, s: -1 })
//     expect(x7.mul(x8).toString()).toBe('-9007199254740991')
//   })
//   it('multiply inverse element', () => {
//     const x1 = new BroCalc(10)
//     const x2 = new BroCalc(0.1)
//     expect(x1.mul(x2)).toMatchObject({ d: [10], e: -1, s: 1 })
//     expect(x1.mul(x2).toString()).toBe('1.0')
//     const x3 = new BroCalc(-10)
//     const x4 = new BroCalc(-0.1)
//     expect(x3.mul(x4)).toMatchObject({ d: [10], e: -1, s: 1 })
//     expect(x3.mul(x4).toString()).toBe('1.0')
//     const x5 = new BroCalc(0.125)
//     const x6 = new BroCalc(8)
//     expect(x5.mul(x6)).toMatchObject({ d: [1000], e: -3, s: 1 })
//     expect(x5.mul(x6).toString()).toBe('1.000')
//     const x7 = new BroCalc(-0.125)
//     const x8 = new BroCalc(-8)
//     expect(x7.mul(x8)).toMatchObject({ d: [1000], e: -3, s: 1 })
//     expect(x7.mul(x8).toString()).toBe('1.000')
//   })
//   it('even the argument of mul function is over the 2^53 - 1, it should be calculated correctly', () => {
//     console.log('final test')
//     const test1 = new BroCalc(123456789)
//     const test2 = new BroCalc(123456789)
//     expect(test1.mul(test2)).toMatchObject({
//       d: [152, 4157875, 190521],
//       e: 0,
//       s: 1,
//     })
//     expect(test1.mul(test2).toString()).toBe('15241578750190521')

//     const test3 = new BroCalc('1234567890123456789012345678')
//     const test4 = new BroCalc('1234567890123456789012345678')
//     expect(test3.mul(test4)).toMatchObject({
//       d: [
//         152415, 7875323, 8836750, 4953515, 4031397, 6765279, 6829976, 5279684,
//       ],
//       e: 0,
//       s: 1,
//     })
//     expect(test3.mul(test4).toString()).toBe(
//       '1524157875323883675049535154031397676527968299765279684',
//     )

//     const x1 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
//     const x2 = new BroCalc(2)
//     expect(x1.mul(x2)).toMatchObject({ d: [180, 1439850, 9481982], e: 0, s: 1 })
//     expect(x1.mul(x2).toString()).toBe('18014398509481982')

//     const x3 = new BroCalc(Number.MAX_SAFE_INTEGER)
//     const x4 = new BroCalc(Number.MAX_SAFE_INTEGER)
//     expect(x3.mul(x4)).toMatchObject({
//       d: [8112, 9638414, 6066636, 8139049, 5662081],
//       e: 0,
//       s: 1,
//     })
//     expect(x3.mul(x4).toString()).toBe('81129638414606663681390495662081')
//   })
// })

// ********** Division Part **********
describe('div function', () => {
  it('divide two positive numbers', () => {
    const x1 = new BroCalc(1)
    const x2 = new BroCalc(2)

    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.5')
  })

  // it('divide two negative numbers', () => {
  //   const x1 = new BroCalc(-1)
  //   const x2 = new BroCalc(-2)

  //   expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: 1 })
  //   expect(x1.div(x2).toString()).toBe('0.5')
  // })

  // it('divide one positive and one negative number', () => {
  //   const x1 = new BroCalc(1)
  //   const x2 = new BroCalc(-2)

  //   expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: -1 })
  //   expect(x1.div(x2).toString()).toBe('-0.5')

  //   const x3 = new BroCalc(-1)
  //   const x4 = new BroCalc(2)

  //   expect(x3.div(x4)).toMatchObject({ d: [5], e: -1, s: -1 })
  //   expect(x3.div(x4).toString()).toBe('-0.5')
  // })

  // it('divide identity element', () => {
  //   const x1 = new BroCalc(100)
  //   const x2 = new BroCalc(1)

  //   expect(x1.div(x2)).toMatchObject({ d: [100], e: 0, s: 1 })
  //   expect(x1.div(x2).toString()).toBe('100')

  //   const x3 = new BroCalc(1)
  //   const x4 = new BroCalc(100)

  //   expect(x3.div(x4)).toMatchObject({ d: [1], e: -2, s: -1 })
  //   expect(x3.div(x4).toString()).toBe('0.01')
  // })

  // it('divide inverse element', () => {
  //   const x1 = new BroCalc(0.1)
  //   const x2 = new BroCalc(1)

  //   expect(x1.div(x2)).toMatchObject({ d: [1], e: -1, s: 1 })
  //   expect(x1.div(x2).toString()).toBe('0.1')

  //   const x3 = new BroCalc(-0.1)
  //   const x4 = new BroCalc(-1)

  //   expect(x3.div(x4)).toMatchObject({ d: [1], e: -1, s: -1 })
  //   expect(x3.div(x4).toString()).toBe('-0.1')

  //   const x5 = new BroCalc(0.125)
  //   const x6 = new BroCalc(0.125)

  //   expect(x5.div(x6)).toMatchObject({ d: [1], e: 0, s: 1 })
  //   expect(x5.div(x6).toString()).toBe('1')

  //   const x7 = new BroCalc(Number.MAX_SAFE_INTEGER)
  //   const x8 = new BroCalc(Number.MAX_SAFE_INTEGER)

  //   expect(x7.div(x8)).toMatchObject({ d: [1], e: 0, s: 1 })
  //   expect(x7.div(x8).toString()).toBe('1')

  //   const x9 = new BroCalc(Number.MIN_SAFE_INTEGER)
  //   const x10 = new BroCalc(Number.MIN_SAFE_INTEGER)

  //   expect(x9.div(x10)).toMatchObject({ d: [1], e: 0, s: 1 })
  //   expect(x9.div(x10).toString()).toBe('1')
  // })

  // it('if denominator is 0, it should be throw an error', () => {
  //   const x1 = new BroCalc(1)
  //   const x2 = new BroCalc(0)

  //   expect(() => x1.div(x2)).toThrow('Division by zero is not allowed')
  // })

  // it('the case of infinite decimal, it should be return at the boundary of 10^-15 with rounding', () => {
  //   const x1 = new BroCalc(1)
  //   const x2 = new BroCalc(3)

  //   expect(x1.div(x2)).toMatchObject({ d: [3333333, 3333333], e: -15, s: 1 })
  //   expect(x1.div(x2).toString()).toBe('0.33333333333333')

  //   const x3 = new BroCalc(1)
  //   const x4 = new BroCalc(6)

  //   expect(x3.div(x4)).toMatchObject({ d: [1666666, 6666667], e: -15, s: 1 })
  //   expect(x3.div(x4).toString()).toBe('0.16666666666667')

  //   const x5 = new BroCalc(1)
  //   const x6 = new BroCalc(7)

  //   expect(x5.div(x6)).toMatchObject({ d: [1428571, 4285714], e: -15, s: 1 })
  //   expect(x5.div(x6).toString()).toBe('0.14285714285714')

  //   const x7 = new BroCalc(1)
  //   const x8 = new BroCalc(9)

  //   expect(x7.div(x8)).toMatchObject({ d: [1111111, 1111111], e: -15, s: 1 })
  //   expect(x7.div(x8).toString()).toBe('0.11111111111111')
  // })
})

// ********** Error handling Part **********
// describe('error handling', () => {
//   it('should throw an error if the argument is empty string', () => {
//     expect(() => new BroCalc('')).toThrow('Empty string is not allowed')
//   })

//   it('should throw an error if the argument is infinite', () => {
//     expect(() => new BroCalc(Number.POSITIVE_INFINITY)).toThrow(
//       'Multiple of Infinity is not allowed',
//     )
//     expect(() => new BroCalc(Number.NEGATIVE_INFINITY)).toThrow(
//       'Multiple of Infinity is not allowed',
//     )
//   })

//   it('should throw an error if the argument is NaN', () => {
//     expect(() => new BroCalc(NaN)).toThrow('Invalid input: NaN')
//   })

//   it('should throw an error if the argument is not a number', () => {
//     expect(() => new BroCalc('hello')).toThrow('Invalid number format: hello')
//   })
// })

// ********** Precision Part **********
// describe('precision', () => {
//   it('if precision is given, it should be calculated correctly at the boundary of the precision', () => {
//     // const x1 = new BroCalc(Math.E, 10)
//     // expect(x1).toMatchObject({ d: [271, 8281828], e: -9, s: 1 })
//     // expect(x1.toString()).toBe('2.718281828')
//     // const x2 = new BroCalc(Math.PI, 3)
//     // expect(x2).toMatchObject({ d: [314], e: -2, s: 1 })
//     // expect(x2.toString()).toBe('3.14')
//     // const x3 = new BroCalc(Math.PI, 31)
//     // expect(x3).toMatchObject({ d: [314, 1592653, 5897932, 3846264, 3383279], e: -30, s: 1 })
//     // expect(x3.toString()).toBe('3.141592653589793238462643383279')
//   })

//   it('if precision is not given, it should be regarded as the maximum precision of the one of argument', () => {
//     const x1 = new BroCalc(1.0)
//     const x2 = new BroCalc(2)

//     expect(x1.add(x2)).toMatchObject({ d: [3], e: 0, s: 1 })
//     expect(x1.add(x2).toString()).toBe('3.000')

//     const x3 = new BroCalc(1.0)
//     const x4 = new BroCalc(2)

//     expect(x3.sub(x4)).toMatchObject({ d: [1], e: 0, s: -1 })
//     expect(x3.sub(x4).toString()).toBe('-1.000')

//     const x5 = new BroCalc(1.0)
//     const x6 = new BroCalc(2)

//     expect(x5.mul(x6)).toMatchObject({ d: [2], e: 0, s: 1 })
//     expect(x5.mul(x6).toString()).toBe('2.000')

//     const x7 = new BroCalc(1.0)
//     const x8 = new BroCalc(2)

//     expect(x7.div(x8)).toMatchObject({ d: [5], e: -1, s: 1 })
//     expect(x7.div(x8).toString()).toBe('0.500')
//   })

//   it('if precision is not given, but the result is infinite decimal or non-recurring decimal number, then it should be rounded to the boundary of 10^-15', () => {
//     const x1 = new BroCalc(1)
//     const x2 = new BroCalc(3)

//     expect(x1.div(x2)).toMatchObject({ d: [3, 3333333, 3333333], e: -15, s: 1 })
//     expect(x1.div(x2).toString()).toBe('0.333333333333333')

//     const x3 = new BroCalc(1)
//     const x4 = new BroCalc(7)

//     expect(x3.div(x4)).toMatchObject({ d: [1, 4285714, 2857143], e: -15, s: 1 })
//     expect(x3.div(x4).toString()).toBe('0.142857142857143')

//     const x5 = new BroCalc(1)
//     const x6 = new BroCalc(9)

//     expect(x5.div(x6)).toMatchObject({ d: [1, 1111111, 1111111], e: -15, s: 1 })
//     expect(x5.div(x6).toString()).toBe('0.111111111111111')
//   })
// })
