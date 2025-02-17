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
    expect(new BroCalc(12345.67)).toMatchObject({
      d: [1234567],
      e: -2,
      s: 1,
    })
  })

  it('Not BroCalc instance is possible', () => {
    const x = new BroCalc(10)
    expect(x.add(10)).toMatchObject({ d: [20], e: 0, s: 1 })
    expect(x.add(10).toString()).toBe('20')
    expect(x.sub(10)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x.sub(10).toString()).toBe('0')
    expect(x.mul(10)).toMatchObject({ d: [100], e: 0, s: 1 })
    expect(x.mul(10).toString()).toBe('100')
    expect(x.div(10)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x.div(10).toString()).toBe('1')
  })

  it('static factory method from() should return a BroCalc instance', () => {
    const x = BroCalc.from(10)
    expect(x).toMatchObject({ d: [10], e: 0, s: 1 })
    expect(x.toString()).toBe('10')
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
    expect(x1.toString()).toBe('12345.6789')
    expect(x2.toString()).toBe('-1234.567')
    expect(x3.toString()).toBe('0.000001234')
    expect(x4.toString()).toBe('0.12300456')
    expect(x5.toString()).toBe('9007199254740991')
    expect(x6.toString()).toBe('-9007199254740991')
    expect(x7.toString()).toBe('9007199254741091')
    expect(x8.toString()).toBe(
      '0.000000000000000000000000000000000000000000000000001234567890',
    )
  })
})

// ********** JSON Part **********
describe('JSON', () => {
  it('JSON should be return a string', () => {
    const x = new BroCalc(12345.6789)
    expect(x.toJSONString()).toBe('{"d":[12,3456789],"e":-4,"s":1}')
  })
})

// ********** Addition Part **********
describe('add function', () => {
  it('add function should be return a new instance of BroCalc', () => {
    const x1 = new BroCalc(12.0)
    const x2 = new BroCalc(0.34)
    expect(x1.add(x2)).toMatchObject({ d: [1234], e: -2, s: 1 })
    expect(x1.add(x2).toString()).toBe('12.34')
    expect(x1.add(0.34)).toMatchObject({ d: [1234], e: -2, s: 1 })
    expect(x1.add(0.34).toString()).toBe('12.34')
    const x3 = new BroCalc(0.0056)
    expect(x2.add(x3)).toMatchObject({ d: [3456], e: -4, s: 1 })
    expect(x2.add(x3).toString()).toBe('0.3456')
    const x4 = new BroCalc(0.01)
    const x5 = new BroCalc(0.99)
    expect(x4.add(x5)).toMatchObject({ d: [100], e: -2, s: 1 })
    expect(x4.add(x5).toString()).toBe('1.00')
  })
  it('add number to negative number is possible', () => {
    const x1 = new BroCalc(-1)
    const x2 = new BroCalc(1)
    expect(x1.add(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x1.add(x2).toString()).toBe('0')
    const x3 = new BroCalc(-1)
    const x4 = new BroCalc(-1)
    expect(x3.add(x4)).toMatchObject({ d: [2], e: 0, s: -1 })
    expect(x3.add(x4).toString()).toBe('-2')
  })
  it('check addition identity element', () => {
    const t1 = new BroCalc(1)
    const t2 = 2
    expect(t1.add(t2).toString()).toBe('3')
    const x1 = new BroCalc(100000)
    const x2 = new BroCalc(0)
    expect(x1.add(x2)).toMatchObject({ d: [100000], e: 0, s: 1 })
    expect(x1.add(x2).toString()).toBe('100000')
    const x3 = new BroCalc(0)
    const x4 = new BroCalc(100000)
    expect(x3.add(x4)).toMatchObject({ d: [100000], e: 0, s: 1 })
    expect(x3.add(x4).toString()).toBe('100000')
    const x5 = new BroCalc(0)
    const x6 = new BroCalc(0)
    expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x5.add(x6).toString()).toBe('0')
  })
  it('check addition inverse element', () => {
    const x1 = new BroCalc(100000)
    const x2 = new BroCalc(-100000)
    expect(x1.add(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x1.add(x2).toString()).toBe('0')
    const x5 = new BroCalc(1)
    const x6 = new BroCalc(-1)
    expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x5.add(x6).toString()).toBe('0')
  })
  it('even argument of add function is over the Number.MAX_SAFE_INTEGER, it should be calculated correctly', () => {
    const x1 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x2 = new BroCalc(1000000000000000)
    expect(x1.add(x2)).toMatchObject({ d: [100, 719925, 4740991], e: 0, s: 1 })
    expect(x1.add(x2).toString()).toBe('10007199254740991')
    const x3 = new BroCalc('14400000000000000')
    const x4 = new BroCalc('100000010000000')
    expect(x3.add(x4)).toMatchObject({ d: [145, 1, 0], e: 0, s: 1 })
    expect(x3.add(x4).toString()).toBe('14500000010000000')
  })
  it('add two different sign numbers', () => {
    const x1 = new BroCalc(10000000)
    const x2 = new BroCalc(-1000)
    expect(x1.add(x2)).toMatchObject({
      d: [9999000],
      e: 0,
      s: 1,
    })
    expect(x1.add(x2).toString()).toBe('9999000')
  })
  it('enough big numbers add', () => {
    const x1 = new BroCalc(102734461911601)
    const x2 = new BroCalc(-80756122400245)
    expect(x1.add(x2)).toMatchObject({
      d: [2197833, 9511356],
      e: 0,
      s: 1,
    })
    expect(x1.add(x2).toString()).toBe('21978339511356')
  })
})

// ********** Subtraction Part **********
describe('sub function', () => {
  it('sub function should be return a new instance of BroCalc', () => {
    const x1 = new BroCalc(12.34)
    const x2 = new BroCalc(0.34)
    expect(x1.sub(x2)).toBeInstanceOf(BroCalc)
    expect(x1.sub(x2)).toMatchObject({ d: [1200], e: -2, s: 1 })
    expect(x1.sub(x2).toString()).toBe('12.00')
  })
  it('different sign of arguments', () => {
    const x1 = new BroCalc(12.34)
    const x2 = new BroCalc(-0.34)
    expect(x1.sub(x2)).toMatchObject({ d: [1268], e: -2, s: 1 })
    expect(x1.sub(x2).toString()).toBe('12.68')
    const x3 = new BroCalc(-12.34)
    const x4 = new BroCalc(0.34)
    expect(x3.sub(x4)).toMatchObject({ d: [1268], e: -2, s: -1 })
    expect(x3.sub(x4).toString()).toBe('-12.68')
  })
  it('even argument of sub function is over the Number.MIN_SAFE_INTEGER, it should be calculated correctly', () => {
    const x1 = new BroCalc(Number.MIN_SAFE_INTEGER) // -9_007_199_254_740_991
    const x2 = new BroCalc(100)
    expect(x1.sub(x2)).toMatchObject({ d: [90, 719925, 4741091], e: 0, s: -1 })
    expect(x1.sub(x2).toString()).toBe('-9007199254741091')
  })
  it('two different sign numbers', () => {
    const x1 = new BroCalc(10000000)
    const x2 = new BroCalc(1000)
    expect(x1.sub(x2)).toMatchObject({
      d: [9999000],
      e: 0,
      s: 1,
    })
    expect(x1.sub(x2).toString()).toBe('9999000')
  })
  it('enough big numbers sub', () => {
    const x1 = new BroCalc(102734461911601)
    const x2 = new BroCalc(80756122400245)
    expect(x1.sub(x2)).toMatchObject({
      d: [2197833, 9511356],
      e: 0,
      s: 1,
    })
    expect(x1.sub(x2).toString()).toBe('21978339511356')
  })
})

// ********** Multiplication Part **********
describe('mul function', () => {
  it('multiply two positive numbers', () => {
    const x1 = new BroCalc(1000000)
    const x2 = new BroCalc(1000000)
    expect(x1.mul(x2)).toMatchObject({ d: [100000, 0], e: 0, s: 1 })
    expect(x1.mul(x2).toString()).toBe('1000000000000')
    const x3 = new BroCalc(10000000)
    const x4 = new BroCalc(10000000)
    expect(x3.mul(x4)).toMatchObject({ d: [1, 0, 0], e: 0, s: 1 })
    expect(x3.mul(x4).toString()).toBe('100000000000000')
    const x5 = new BroCalc(2)
    const x6 = new BroCalc(3)
    expect(x5.mul(x6)).toMatchObject({ d: [6], e: 0, s: 1 })
    expect(x5.mul(x6).toString()).toBe('6')
    const x7 = new BroCalc(20000)
    const x8 = new BroCalc(30000)
    expect(x7.mul(x8)).toMatchObject({ d: [60, 0], e: 0, s: 1 })
    expect(x7.mul(x8).toString()).toBe('600000000')
  })
  it('multiply two negative numbers', () => {
    const x1 = new BroCalc(-2)
    const x2 = new BroCalc(-3)
    expect(x1.mul(x2)).toMatchObject({ d: [6], e: 0, s: 1 })
    expect(x1.mul(x2).toString()).toBe('6')
  })
  it('multiply one positive and one negative number', () => {
    const x1 = new BroCalc(2)
    const x2 = new BroCalc(-3)
    expect(x1.mul(x2)).toMatchObject({ d: [6], e: 0, s: -1 })
    expect(x1.mul(x2).toString()).toBe('-6')
    const x3 = new BroCalc(-2)
    const x4 = new BroCalc(3)
    expect(x3.mul(x4)).toMatchObject({ d: [6], e: 0, s: -1 })
    expect(x3.mul(x4).toString()).toBe('-6')
  })
  it('multiply identity element', () => {
    const x1 = new BroCalc(123456789)
    const x2 = new BroCalc(1)
    expect(x1.mul(x2)).toMatchObject({ d: [12, 3456789], e: 0, s: 1 })
    expect(x1.mul(x2).toString()).toBe('123456789')
    const x3 = new BroCalc(-123456789)
    const x4 = new BroCalc(1)
    expect(x3.mul(x4)).toMatchObject({ d: [12, 3456789], e: 0, s: -1 })
    expect(x3.mul(x4).toString()).toBe('-123456789')
    const x5 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x6 = new BroCalc(1)
    expect(x5.mul(x6)).toMatchObject({ d: [90, 719925, 4740991], e: 0, s: 1 })
    expect(x5.mul(x6).toString()).toBe('9007199254740991')
    const x7 = new BroCalc(-Number.MAX_SAFE_INTEGER) // -9_007_199_254_740_991
    const x8 = new BroCalc(1)
    expect(x7.mul(x8)).toMatchObject({ d: [90, 719925, 4740991], e: 0, s: -1 })
    expect(x7.mul(x8).toString()).toBe('-9007199254740991')
  })
  it('multiply inverse element', () => {
    const x1 = new BroCalc(10)
    const x2 = new BroCalc(0.1)
    expect(x1.mul(x2)).toMatchObject({ d: [10], e: -1, s: 1 })
    expect(x1.mul(x2).toString()).toBe('1.0')
    const x3 = new BroCalc(-10)
    const x4 = new BroCalc(-0.1)
    expect(x3.mul(x4)).toMatchObject({ d: [10], e: -1, s: 1 })
    expect(x3.mul(x4).toString()).toBe('1.0')
    const x5 = new BroCalc(0.125)
    const x6 = new BroCalc(8)
    expect(x5.mul(x6)).toMatchObject({ d: [1000], e: -3, s: 1 })
    expect(x5.mul(x6).toString()).toBe('1.000')
    const x7 = new BroCalc(-0.125)
    const x8 = new BroCalc(-8)
    expect(x7.mul(x8)).toMatchObject({ d: [1000], e: -3, s: 1 })
    expect(x7.mul(x8).toString()).toBe('1.000')
  })
  it('even the argument of mul function is over the 2^53 - 1, it should be calculated correctly', () => {
    const test1 = new BroCalc(123456789)
    const test2 = new BroCalc(123456789)
    expect(test1.mul(test2)).toMatchObject({
      d: [152, 4157875, 190521],
      e: 0,
      s: 1,
    })
    expect(test1.mul(test2).toString()).toBe('15241578750190521')
    const test3 = new BroCalc('1234567890123456789012345678')
    const test4 = new BroCalc('1234567890123456789012345678')
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
    const x1 = new BroCalc(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x2 = new BroCalc(2)
    expect(x1.mul(x2)).toMatchObject({
      d: [180, 1439850, 9481982],
      e: 0,
      s: 1,
    })
    expect(x1.mul(x2).toString()).toBe('18014398509481982')
    const x3 = new BroCalc(Number.MAX_SAFE_INTEGER)
    const x4 = new BroCalc(Number.MAX_SAFE_INTEGER)
    expect(x3.mul(x4)).toMatchObject({
      d: [8112, 9638414, 6066636, 8139049, 5662081],
      e: 0,
      s: 1,
    })
    expect(x3.mul(x4).toString()).toBe('81129638414606663681390495662081')
  })
  it('multiply more test cases', () => {
    const x1 = new BroCalc('1234567890123456789012345678')
    const x2 = new BroCalc('0.0000000000000000000000000001')
    expect(x1.mul(x2)).toMatchObject({
      d: [1234567, 8901234, 5678901, 2345678],
      e: -28,
      s: 1,
    })
    expect(x1.mul(x2).toString()).toBe('0.1234567890123456789012345678')
  })
  it('multiply many digits', () => {
    const x1 = new BroCalc(
      '99999999999999999999999999999999999999999999999999999',
    )
    const x2 = new BroCalc(
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

// ********** Division Part **********
describe('div function', () => {
  it('divide two positive numbers', () => {
    const x1 = new BroCalc(1)
    const x2 = new BroCalc(2)
    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.5')
  })
  it('divide two negative numbers', () => {
    const x1 = new BroCalc(-1)
    const x2 = new BroCalc(-2)
    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.5')
  })
  it('divide one positive and one negative number', () => {
    const x1 = new BroCalc(1)
    const x2 = new BroCalc(-2)
    expect(x1.div(x2)).toMatchObject({ d: [5], e: -1, s: -1 })
    expect(x1.div(x2).toString()).toBe('-0.5')
    const x3 = new BroCalc(-1)
    const x4 = new BroCalc(2)
    expect(x3.div(x4)).toMatchObject({ d: [5], e: -1, s: -1 })
    expect(x3.div(x4).toString()).toBe('-0.5')
  })
  it('divide identity element', () => {
    const x1 = new BroCalc(100)
    const x2 = new BroCalc(1)
    expect(x1.div(x2)).toMatchObject({ d: [100], e: 0, s: 1 })
    expect(x1.div(x2).toString()).toBe('100')
    const x3 = new BroCalc(1)
    const x4 = new BroCalc(100)
    expect(x3.div(x4)).toMatchObject({ d: [1], e: -2, s: 1 })
    expect(x3.div(x4).toString()).toBe('0.01')
  })
  it('divide inverse element', () => {
    const x1 = new BroCalc(0.1)
    const x2 = new BroCalc(1)
    expect(x1.div(x2)).toMatchObject({ d: [1], e: -1, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.1')
    const x3 = new BroCalc(-0.1)
    const x4 = new BroCalc(-1)
    expect(x3.div(x4)).toMatchObject({ d: [1], e: -1, s: 1 })
    expect(x3.div(x4).toString()).toBe('0.1')
    const x5 = new BroCalc(0.125)
    const x6 = new BroCalc(0.125)
    expect(x5.div(x6)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x5.div(x6).toString()).toBe('1')
    const x7 = new BroCalc(Number.MAX_SAFE_INTEGER)
    const x8 = new BroCalc(Number.MAX_SAFE_INTEGER)
    expect(x7.div(x8)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x7.div(x8).toString()).toBe('1')
    const x9 = new BroCalc(Number.MIN_SAFE_INTEGER)
    const x10 = new BroCalc(Number.MIN_SAFE_INTEGER)
    expect(x9.div(x10)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x9.div(x10).toString()).toBe('1')
  })
  it('if denominator is 0, it should be throw an error', () => {
    const x1 = new BroCalc(1)
    const x2 = new BroCalc(0)
    expect(() => x1.div(x2)).toThrow('Division by zero is not allowed')
  })
  it('the case of infinite decimal, it should be return with precision', () => {
    // default precision is 10
    const x1 = new BroCalc(1)
    const x2 = new BroCalc(3)
    expect(x1.div(x2)).toMatchObject({ d: [333, 3333333], e: -10, s: 1 })
    expect(x1.div(x2).toString()).toBe('0.3333333333')

    // custom precision is 20
    const x3 = new BroCalc(1, 20)
    const x4 = new BroCalc(3, 20)
    expect(x3.div(x4)).toMatchObject({
      d: [333333, 3333333, 3333333],
      e: -20,
      s: 1,
    })
    expect(x3.div(x4).toString()).toBe('0.33333333333333333333')

    // custom precision is 15
    const x5 = new BroCalc(1, 15)
    const x6 = new BroCalc(6, 15)
    expect(x5.div(x6)).toMatchObject({
      d: [1, 6666666, 6666666],
      e: -15,
      s: 1,
    })
    expect(x5.div(x6).toString()).toBe('0.166666666666666')

    // custom precision is 15
    const x7 = new BroCalc(1, 14)
    const x8 = new BroCalc(7, 14)
    expect(x7.div(x8)).toMatchObject({ d: [1428571, 4285714], e: -14, s: 1 })
    expect(x7.div(x8).toString()).toBe('0.14285714285714')

    // custom precision is 10
    const x9 = new BroCalc(1, 10)
    const x10 = new BroCalc(9, 10)
    expect(x9.div(x10)).toMatchObject({ d: [111, 1111111], e: -10, s: 1 })
    expect(x9.div(x10).toString()).toBe('0.1111111111')
  })

  it('the case of very big number', () => {
    const x1 = new BroCalc('1234567890123456789012345678901234567890')
    const x2 = new BroCalc('9876543210987654321')
    expect(x1.div(x2)).toMatchObject({
      d: [124, 9999988, 6093750, 15488, 2812384],
      e: -10,
      s: 1,
    })

    expect(x1.div(x2).toString()).toBe('124999998860937500015.4882812384')

    const x3 = new BroCalc('1234567890123456789012345678901234567890', 30)
    const x4 = new BroCalc('9876543210987654321', 30)
    expect(x3.div(x4)).toMatchObject({
      d: [12, 4999998, 8609375, 1548, 8281238, 4313964, 8451960, 7543943],
      e: -30,
      s: 1,
    })
    expect(x3.div(x4).toString()).toBe(
      '124999998860937500015.488281238431396484519607543943',
    )
  })
})

// ********** Power handling Part **********
describe('pow function', () => {
  it('integer power', () => {
    const x1 = new BroCalc(2)
    const x2 = new BroCalc(3)
    expect(x1.pow(x2)).toMatchObject({ d: [8], e: 0, s: 1 })
    expect(x1.pow(x2).toString()).toBe('8')
    const x3 = new BroCalc(2)
    const x4 = new BroCalc(-3)
    expect(x3.pow(x4)).toMatchObject({ d: [125], e: -3, s: 1 })
    expect(x3.pow(x4).toString()).toBe('0.125')
    const x5 = new BroCalc(-1)
    const x6 = new BroCalc(2)
    expect(x5.pow(x6)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x5.pow(x6).toString()).toBe('1')
  })
  it('fractional power', () => {
    const x1 = new BroCalc(2, 10)
    const x2 = new BroCalc(0.5, 10)
    expect(() => x1.pow(x2)).toThrow(
      'Non-integer exponent is not supported in this implementation.',
    )
  })
  it('negative power', () => {
    const x1 = new BroCalc(2)
    const x2 = new BroCalc(-3)
    expect(x1.pow(x2)).toMatchObject({ d: [125], e: -3, s: 1 })
    expect(x1.pow(x2).toString()).toBe('0.125')
  })
  it('zero power', () => {
    const x1 = new BroCalc(2)
    const x2 = new BroCalc(0)
    expect(x1.pow(x2)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x1.pow(x2).toString()).toBe('1')
  })
  it('big number power', () => {
    const x1 = new BroCalc(2)
    const x2 = new BroCalc(100)

    expect(x1.pow(x2)).toMatchObject({
      d: [126, 7650600, 2282294, 149670, 3205376],
      e: 0,
      s: 1,
    })
    expect(x1.pow(x2).toString()).toBe('1267650600228229401496703205376')
  })
})

// ********** Square root handling Part **********
describe('sqrt function', () => {
  it('square root', () => {
    const x1 = new BroCalc(4)
    expect(x1.sqrt()).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt().toString()).toBe('2')
  })
  it(' cube root', () => {
    const x1 = new BroCalc(8)
    expect(x1.sqrt(3)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(3).toString()).toBe('2')
  })
  it('fourth root', () => {
    const x1 = new BroCalc(16)
    expect(x1.sqrt(4)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(4).toString()).toBe('2')
  })
  it('fifth root', () => {
    const x1 = new BroCalc(32)
    expect(x1.sqrt(5)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(5).toString()).toBe('2')
  })
  it('11 root', () => {
    const x1 = new BroCalc(2048)
    expect(x1.sqrt(11)).toMatchObject({ d: [2], e: 0, s: 1 })
    expect(x1.sqrt(11).toString()).toBe('2')
  })
  it('100 root', () => {
    const x1 = new BroCalc('1267650600228229401496703205376')
    expect(x1.sqrt(100)).toMatchObject({
      d: [2],
      e: 0,
      s: 1,
    })
    expect(x1.sqrt(100).toString()).toBe('2')
  })
})

// ********** Error handling Part **********
describe('error handling', () => {
  it('should throw an error if the argument is empty string', () => {
    expect(() => new BroCalc('')).toThrow('Empty string is not allowed')
  })

  it('should throw an error if the argument is infinite', () => {
    expect(() => new BroCalc(Number.POSITIVE_INFINITY)).toThrow(
      'Multiple of Infinity is not allowed',
    )
    expect(() => new BroCalc(Number.NEGATIVE_INFINITY)).toThrow(
      'Multiple of Infinity is not allowed',
    )
  })

  it('should throw an error if the argument is NaN', () => {
    expect(() => new BroCalc(NaN)).toThrow('Invalid input: NaN')
  })

  it('should throw an error if the argument is not a number', () => {
    expect(() => new BroCalc('hello')).toThrow('Invalid number format: hello')
  })
})
