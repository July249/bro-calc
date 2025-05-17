import { Numbra } from '@/core/numbra'

describe('Get Decimal Interface', () => {
  it('test is running', () => {
    expect(true).toBe(true)
  })
})

describe('check Numbra instance', () => {
  it('when make instance of Numbra, it should be equal to Decimal interface', () => {
    // (ex. new Numbra(12345.67) === { d: [1234567], e: -2, s: 1 })
    expect(new Numbra(12345.67)).toMatchObject({
      d: [1234567],
      e: -2,
      s: 1,
    })
  })

  it('Not Numbra instance is possible', () => {
    const x = new Numbra(10)
    expect(x.add(10)).toMatchObject({ d: [20], e: 0, s: 1 })
    expect(x.add(10).toString()).toBe('20')
    expect(x.sub(10)).toMatchObject({ d: [0], e: 0, s: 1 })
    expect(x.sub(10).toString()).toBe('0')
    expect(x.mul(10)).toMatchObject({ d: [100], e: 0, s: 1 })
    expect(x.mul(10).toString()).toBe('100')
    expect(x.div(10)).toMatchObject({ d: [1], e: 0, s: 1 })
    expect(x.div(10).toString()).toBe('1')
  })

  it('static factory method from() should return a Numbra instance', () => {
    const x = Numbra.from(10)
    expect(x).toMatchObject({ d: [10], e: 0, s: 1 })
    expect(x.toString()).toBe('10')
  })

  it('toString() should return a string', () => {
    const x1 = new Numbra(12345.6789)
    const x2 = new Numbra(-1234.567)
    const x3 = new Numbra(0.000001234)
    const x4 = new Numbra(0.12300456)
    // 숫자형 타입의 표기 가능한 가장 큰 정수 (MAX_SAFE_INTEGER)와 가장 작은 정수 (MIN_SAFE_INTEGER)를 표현 가능하다.
    const x5 = new Numbra(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
    const x6 = new Numbra(Number.MIN_SAFE_INTEGER) // -9_007_199_254_740_991
    // 숫자형 타입의 표기 가능한 최대값인 2^53 - 1 보다 100 큰 수를 표현 가능하다.
    // WARNING: new Numbra(String(Number.MAX_SAFE_INTEGER + 100)) 으로 변환하면 Number.MAX_SAFE_INTEGER + 100 이 이미 표현 가능한 2^53 - 1 보다 커져서 부동소수점 오류가 발생해버린다.
    const x7 = new Numbra('9007199254741091') // 9,007,199,254,741,091 = MAX_SAFE_INTEGER + 100
    // 소수점 50자리 이하의 경우도 표현 가능
    const x8 = new Numbra('0.000000000000000000000000000000000000000000000000001234567890') // 1.234567890e-50
    expect(x1.toString()).toBe('12345.6789')
    expect(x2.toString()).toBe('-1234.567')
    expect(x3.toString()).toBe('0.000001234')
    expect(x4.toString()).toBe('0.12300456')
    expect(x5.toString()).toBe('9007199254740991')
    expect(x6.toString()).toBe('-9007199254740991')
    expect(x7.toString()).toBe('9007199254741091')
    expect(x8.toString()).toBe('0.000000000000000000000000000000000000000000000000001234567890')
  })
})

// ********** Equation Part **********
describe('Equation', () => {
  it('equation function is for string equation formation', () => {
    expect(Numbra.equation('7+8')).toMatchObject({
      d: [15],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('7+8').toString()).toBe('15')
    expect(Numbra.equation('7-8')).toMatchObject({
      d: [1],
      e: 0,
      s: -1,
    })
    expect(Numbra.equation('7-8').toString()).toBe('-1')
    expect(Numbra.equation('7*8')).toMatchObject({
      d: [56],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('7*8').toString()).toBe('56')
    expect(Numbra.equation('7/8')).toMatchObject({
      d: [875],
      e: -3,
      s: 1,
    })
    expect(Numbra.equation('7/8').toString()).toBe('0.875')
    expect(Numbra.equation('7^8')).toMatchObject({
      d: [5764801],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('7^8').toString()).toBe('5764801')
    expect(Numbra.equation('(7*8)+9')).toMatchObject({
      d: [65],
      e: 0,
      s: 1,
    })
    expect(Numbra.equation('(7*8)+9').toString()).toBe('65')
  })
})

// ********** JSONString Part **********
describe('JSONString', () => {
  it('JSONString should be return a string', () => {
    const x = new Numbra(12345.6789)
    expect(x.toJSONString()).toBe('{"d":[12,3456789],"e":-4,"s":1}')
  })
})

// ********** Error handling Part **********
describe('error handling', () => {
  it('should throw an error if the argument is empty string', () => {
    expect(() => new Numbra('')).toThrow('Empty string is not allowed')
  })

  it('should throw an error if the argument is infinite', () => {
    expect(() => new Numbra(Number.POSITIVE_INFINITY)).toThrow('Multiple of Infinity is not allowed')
    expect(() => new Numbra(Number.NEGATIVE_INFINITY)).toThrow('Multiple of Infinity is not allowed')
  })

  it('should throw an error if the argument is NaN', () => {
    expect(() => new Numbra(NaN)).toThrow('Invalid input: NaN')
  })

  it('should throw an error if the argument is not a number', () => {
    expect(() => new Numbra('hello')).toThrow('Invalid number format: hello')
  })
})
