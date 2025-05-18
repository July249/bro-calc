import { NumbraConstant } from '../constants/numbra'
import { NumbraDecimal } from '../interface'
import {
  eNotationToDecimal,
  splitSignAndMantissa,
  toDigitChunks,
  adjustDigits,
  splitToIntegerAndDecimal,
  convertDigitsToBigInt,
  bigIntToDigitArray,
  getPrecisionScale,
  equal,
} from '../utils/numbra'

import type { NumbraValue } from '../types'

import { Calculable } from '@/types/calculable.type'
/**
 * 고정밀도 십진 연산을 위한 클래스
 */
export class Numbra implements NumbraDecimal {
  // ================================ Properties ================================
  readonly d: number[]
  readonly e: number
  readonly s: number
  readonly precision: number

  private readonly base: number
  private readonly logBase: number
  private readonly karatsubaThreshold: number

  // ================================ Constructor ================================
  constructor(value: NumbraValue = 0, precision?: number) {
    this.base = NumbraConstant.BASE
    this.logBase = NumbraConstant.LOG_BASE
    this.karatsubaThreshold = NumbraConstant.KARATSUBA_THRESHOLD
    this.precision = precision ?? NumbraConstant.PRECISION

    if (value instanceof Numbra) {
      this.d = [...value.d]
      this.e = value.e
      this.s = value.s
    } else {
      const parsed = this.parseInput(value)
      this.d = parsed.d
      this.e = parsed.e
      this.s = parsed.s
    }

    Object.freeze(this.d)
    Object.freeze(this)
  }

  // ================================ Public Methods ================================

  /**
   * 덧셈 연산
   * @param value 더할 값
   * @returns 덧셈 결과 (Numbra 인스턴스)
   */
  add(value: NumbraValue): Numbra {
    const o = this.isNumbra(value) ? value : this.parseInput(value)

    const specialCase = this.handleSpecialCases(this, o, false)
    if (specialCase)
      return this.createNewInstance(specialCase.d, specialCase.e, specialCase.s)

    let result: NumbraDecimal = {
      d: [0],
      e: 0,
      s: 1,
    }
    if (this.s === -1 && o.s === 1) {
      result = this.calculateSub(o, this)
    } else if (this.s === 1 && o.s === -1) {
      result = this.calculateSub(this, o)
    } else {
      result = this.calculateAdd(this, o)
    }
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 뺄셈 연산
   * @param value 뺄 값
   * @returns 뺄셈 결과 (Numbra 인스턴스)
   */
  sub(value: NumbraValue): Numbra {
    const o = this.isNumbra(value) ? value : this.parseInput(value)

    const specialCase = this.handleSpecialCases(this, o, true)
    if (specialCase)
      return this.createNewInstance(specialCase.d, specialCase.e, specialCase.s)

    let result: NumbraDecimal = {
      d: [0],
      e: 0,
      s: 1,
    }

    if (this.s === -1 && o.s === 1) {
      // Case 1: this가 음수, o가 양수
      const n = this.negate(this)
      result = this.calculateSub(n, o)
      result = this.negate(result)
    } else if ((this.s === 1 && o.s === -1) || this.s === o.s) {
      // Case 2: this가 양수, o가 음수 또는 부호가 같은 경우
      const n = this.negate(o)
      result = this.calculateSub(this, n)
    }

    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 곱셈 연산
   * @param value 곱할 값
   * @returns 곱셈 결과 (Numbra 인스턴스)
   */
  mul(value: number | string | Numbra): Numbra {
    const o = value instanceof Numbra ? value : this.parseInput(value)
    const result = this.calculateMul(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 나눗셈 연산
   * @param value 나눌 값
   * @returns 나눗셈 결과 (Numbra 인스턴스)
   */
  div(value: number | string | Numbra): Numbra {
    const o = value instanceof Numbra ? value : this.parseInput(value)
    const result = this.calculateDiv(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 거듭제곱 연산
   * @param value 거듭제곱할 값
   * @returns 거듭제곱 결과 (Numbra 인스턴스)
   */
  pow(value: number | string | Numbra): Numbra {
    const o = value instanceof Numbra ? value : this.parseInput(value)
    const result = this.calculatePow(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * n 제곱근 연산
   * @param degree 제곱근 함수의 지수 (기본값 2)
   * @returns 제곱근 결과 (Numbra 인스턴스)
   */
  sqrt(degree = 2): Numbra {
    const result = this.calculateNthRoot(this, degree)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  // ================================ Static Methods ================================

  static from(value: NumbraValue): Numbra {
    return new Numbra(value)
  }

  /**
   * 수식 문자열을 계산하여 Numbra 인스턴스를 반환
   * (Note: 제곱근, sqrt 함수는 거듭제곱근만 지원, ex. sqrt(16) = 4)
   * @param equation 계산할 수식 문자열
   * @returns Numbra 인스턴스
   */
  static equation(equation: string): Numbra {
    // 1. 공백 제거
    const sanitized = equation.replace(/\s+/g, '')

    // 2. 토큰화
    const tokens = this.tokenize(sanitized)

    // 3. 후위 표기식으로 변환 (Shunting yard algorithm)
    const postfix = this.toPostfix(tokens)

    // 4. 후위 표기식 계산
    return this.evaluatePostfix(postfix)
  }

  // ================================ Return Methods ================================

  /**
   * 십진수를 문자열로 변환
   * @returns 문자열
   */
  toString(): Calculable {
    return this.decimalToCalculable(this)
  }

  /**
   * NumbraDecimal 인스턴스를 JSON 문자열로 변환
   * @returns JSON 문자열
   */
  toJSONString(): string {
    const json = {
      d: this.d,
      e: this.e,
      s: this.s,
    }

    return JSON.stringify(json)
  }

  /**
   * 십진수를 문자열로 변환
   * @param hint 힌트
   * @returns 문자열
   */
  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string {
    if (hint === 'number') {
      throw new Error(
        'Numbra cannot be converted to a number to prevent floating point issues',
      )
    }
    return this.toString()
  }

  // ================================ Calculation Logic ================================

  /**
   * 덧셈 연산
   * @param x 더할 값
   * @param y 더할 값
   * @returns 덧셈 결과 (NumbraDecimal 인터페이스)
   */
  private calculateAdd(x: NumbraDecimal, y: NumbraDecimal): NumbraDecimal {
    // 정수부와 소수부 분리
    const xSplit = splitToIntegerAndDecimal(x, this.logBase)
    const ySplit = splitToIntegerAndDecimal(y, this.logBase)

    // 소수점 자릿수 맞추기
    const maxDecimalPlaces = Math.max(
      xSplit.decimalPlaces,
      ySplit.decimalPlaces,
    )
    const xDecimal =
      xSplit.decimalPart *
      10n ** BigInt(maxDecimalPlaces - xSplit.decimalPlaces)
    const yDecimal =
      ySplit.decimalPart *
      10n ** BigInt(maxDecimalPlaces - ySplit.decimalPlaces)

    // 부호 처리
    const xSign = BigInt(x.s)
    const ySign = BigInt(y.s)

    // 정수부와 소수부 각각 계산
    const integerSum = xSign * xSplit.integerPart + ySign * ySplit.integerPart
    const decimalSum = xSign * xDecimal + ySign * yDecimal

    // 결과 정규화
    return this.normalizeResult(integerSum, decimalSum, maxDecimalPlaces, 1)
  }

  /**
   * 뺄셈 연산
   * @param x 뺄 값
   * @param y 뺄 값
   * @returns 뺄셈 결과 (NumbraDecimal 인터페이스)
   */
  private calculateSub(x: NumbraDecimal, y: NumbraDecimal): NumbraDecimal {
    return this.calculateAdd(x, y)
  }

  /**
   * 곱셈 연산
   * @param x 곱할 값
   * @param y 곱할 값
   * @returns 곱셈 결과 (NumbraDecimal 인터페이스)
   */
  private calculateMul(x: NumbraDecimal, y: NumbraDecimal): NumbraDecimal {
    if (!x.d || !y.d) throw new Error('Invalid input')
    if (this.isOne(y)) return x
    if (this.isOne(x)) return y
    if (this.isZero(x) || this.isZero(y)) return { d: [0], e: 0, s: 1 }

    const sign = x.s * y.s
    const resultE = x.e + y.e

    let digits: number[] = []

    // 어떠한 알고리즘을 사용하여 곱셈 연산을 수행할지 결정
    if (x.d.length + y.d.length < this.karatsubaThreshold) {
      digits = this.standardMultiply(x.d, y.d)
    } else {
      digits = this.karatsubaMultiply(x.d, y.d)
    }

    let carry = 0 // 올림

    for (let i = digits.length - 1; i >= 0; i--) {
      const temp = digits[i] + carry
      digits[i] = temp % this.base
      carry = Math.floor(temp / this.base)
    }

    // 올림 처리
    if (carry > 0) digits.unshift(carry)

    return {
      d: digits,
      e: resultE,
      s: sign,
    }
  }

  /**
   * 나눗셈 연산 (BigInt 기반 스케일링 방식)
   * @param x 피제수 (NumbraDecimal)
   * @param y 제수 (NumbraDecimal)
   * @returns 나눗셈 결과 (NumbraDecimal)
   */
  private calculateDiv(x: NumbraDecimal, y: NumbraDecimal): NumbraDecimal {
    // 0 체크
    if (!y.d || this.isZero(y))
      throw new Error('Division by zero is not allowed')
    if (!x.d || this.isZero(x)) return { d: [0], e: 0, s: 1 }
    if (equal(x, y)) return { d: [1], e: 0, s: 1 }

    // 분모가 1인 경우
    if (this.isOne(y)) return x

    // 결과 부호: 피제수와 제수의 부호 곱
    const resultSign = x.s * y.s

    // 원하는 유효 자릿수 (precision)
    // (예를 들어, 기본값이 10이면 10자리 정밀도, 테스트 예제에서 유효숫자 40이 필요하면 precision을 40으로 설정)
    const precision = this.precision

    // 간단한 나눗셈 처리 (직접 number 타입으로 계산)
    if (
      x.d.length === 1 &&
      y.d.length === 1 &&
      x.e === 0 &&
      y.e === 0 &&
      precision < 16
    ) {
      const xNum = x.d[0]
      const yNum = y.d[0]
      if (xNum < 1000000 && yNum < 1000000) {
        // 간단한 나눗셈 처리 (직접 number 타입으로 계산)
        const quotient = xNum / yNum

        // 정수부와 소수부 분리
        const decimalStr = quotient.toString()

        if (decimalStr.includes('.')) {
          // 소수점이 있는 경우
          const [intPart, fracPart] = decimalStr.split('.')

          // 정밀도에 맞게 소수부 자르기
          const fracDigits = fracPart.slice(
            0,
            Math.min(fracPart.length, this.precision),
          )

          // 소수점의 위치에 따라 지수 계산
          const resultExp = -fracDigits.length

          // 결과 문자열 생성 (소수점 제거)
          let resultStr = intPart + fracDigits

          // 선행 0 제거 (중요!)
          resultStr = resultStr.replace(/^0+/, '') || '0'

          // 문자열을 숫자 배열로 변환
          const resultDigits = toDigitChunks(resultStr)

          return {
            d: resultDigits,
            e: resultExp,
            s: resultSign,
          }
        } else {
          // 정수인 경우 (소수점 없음)
          return {
            d: [Number(quotient)],
            e: 0,
            s: resultSign,
          }
        }
      }
    }

    // 1. d 배열을 BigInt 정수로 복원
    const I_x = convertDigitsToBigInt(x.d)
    const I_y = convertDigitsToBigInt(y.d)

    // 2. 지수 차이: 실제 값은 I_x×10^(x.e)와 I_y×10^(y.e)를 곱한 값이므로,
    //    나눗셈은 (I_x / I_y) × 10^(x.e - y.e)
    const expDiff = x.e - y.e

    // 3. 캐시된 스케일 가져오기 (직접 계산 대신)
    const precisionScale = getPrecisionScale(precision)

    // 4. 스케일링: 원하는 소수점 이하 자릿수(precision)를 확보하기 위해 분자에 10^(precision)을 곱함.
    //    (즉, 내부적으로 정수 나눗셈을 수행할 때 소수점 이하 정밀도를 확보)
    const scaledNumerator = I_x * precisionScale

    // 5. BigInt 정수 나눗셈: BigInt의 '/' 연산자는 정수 몫만 반환합니다.
    let Q = scaledNumerator / I_y

    // 6. 예비 결과 지수: 스케일링했으므로, 최종 결과는 Q × 10^(expDiff - precision)
    let resultExponent = expDiff - precision

    // 7. 모듈로 연산 대신 문자열 변환으로 후행 0 제거 (최적화)
    const qStr = Q.toString()
    let trailingZeros = 0
    for (let i = qStr.length - 1; i >= 0 && qStr[i] === '0'; i--) {
      trailingZeros++
    }
    if (trailingZeros > 0) {
      Q = Q / 10n ** BigInt(trailingZeros)
      resultExponent += trailingZeros
    }

    // 8. BigInt Q를 d 배열 (base 10^7 단위)로 분할
    const resultDigits = bigIntToDigitArray(Q)

    // 선행 0 제거 최적화 (shift 연산 대신 인덱스 기반)
    let startIdx = 0
    while (startIdx < resultDigits.length - 1 && resultDigits[startIdx] === 0) {
      startIdx++
    }

    // 모든 자릿수가 0인 경우 처리
    if (startIdx === resultDigits.length - 1 && resultDigits[startIdx] === 0) {
      return { d: [0], e: 0, s: 1 }
    }

    const finalDigits =
      startIdx > 0 ? resultDigits.slice(startIdx) : resultDigits

    // 9. 최종 결과 반환
    return {
      d: finalDigits,
      e: resultExponent,
      s: resultSign,
    }
  }

  /**
   * 정수 지수의 거듭제곱을 BigInt 기반 반복 제곱법으로 계산하는 메서드
   * 음의 지수인 경우, 1/(x^|n|)로 계산합니다.
   * @param x 밑 (Numbra 또는 NumbraDecimal)
   * @param exp 거듭제곱할 지수 (number | string | Numbra)
   * @returns 거듭제곱 결과 (NumbraDecimal 인스턴스)
   */
  private calculatePow(
    x: NumbraDecimal,
    exp: number | string | NumbraDecimal,
  ): NumbraDecimal {
    let exponent: number

    if (typeof exp === 'number') {
      exponent = exp
    } else if (typeof exp === 'string') {
      exponent = parseInt(exp, 10)
    } else {
      if (exp.e !== 0 || exp.d.length !== 1) {
        throw new Error(
          'Non-integer exponent is not supported in this implementation.',
        )
      }
      exponent = exp.d[0] * exp.s
    }

    if (exponent < 0) {
      const positivePow = this.calculatePow(x, -exponent)
      const one: NumbraDecimal = { d: [1], e: 0, s: 1 }
      return this.calculateDiv(one, positivePow)
    }

    const I_x = convertDigitsToBigInt(x.d)

    let resultBigInt = 1n
    let baseBigInt = I_x
    let expBigInt = BigInt(exponent)
    while (expBigInt > 0n) {
      if (expBigInt % 2n === 1n) {
        resultBigInt *= baseBigInt
      }
      baseBigInt *= baseBigInt
      expBigInt /= 2n
    }

    const resultExponent = exponent * x.e

    const resultSign = exponent % 2 === 0 ? 1 : x.s

    const resultDigits = bigIntToDigitArray(resultBigInt)

    return { d: resultDigits, e: resultExponent, s: resultSign }
  }

  /**
   * 일반 n제곱근 (nth root)을 계산하는 메서드
   * (예: n=2이면 제곱근, n=3이면 세제곱근 등)
   * 음수 또는 0인 degree는 지원하지 않습니다.
   * @param x n제곱근을 구할 값 (NumbraDecimal)
   * @param degree 제곱근의 차수 (n), 양의 정수만 지원
   * @returns n제곱근 결과 (NumbraDecimal)
   */
  private calculateNthRoot(x: NumbraDecimal, degree: number): NumbraDecimal {
    if (degree <= 0) {
      throw new Error('Only positive root degrees are supported.')
    }

    if (x.s < 0) {
      if (degree % 2 === 0) {
        throw new Error('Even root of negative number is not supported.')
      }
      x = { d: x.d, e: x.e, s: -1 }
    }
    if (this.isZero(x)) {
      return { d: [0], e: 0, s: 1 }
    }

    const p = this.precision

    let extra = 0
    if (x.e + degree * p < 0) {
      extra = -(x.e + degree * p)
    }
    if (extra % degree !== 0) {
      extra += degree - (extra % degree)
    }
    const totalScale = x.e + degree * p + extra

    const I = convertDigitsToBigInt(x.d)

    const N = I * 10n ** BigInt(totalScale)

    const integerNthRoot = (num: bigint, n: number): bigint => {
      if (num < 0n) {
        throw new Error('Cannot compute root of negative number')
      }
      if (num < 2n) return num
      const numStr = num.toString()
      const initExp = BigInt(Math.ceil(numStr.length / n))
      let r = 10n ** initExp

      while (true) {
        let rPow = 1n
        for (let i = 0; i < n - 1; i++) {
          rPow *= r
        }
        if (rPow === 0n) break
        const r_next = (BigInt(n - 1) * r + num / rPow) / BigInt(n)
        if (r > r_next ? r - r_next <= 1n : r_next - r <= 1n) {
          r = r_next
          break
        }
        r = r_next
      }
      return r
    }

    const R = integerNthRoot(N, degree)

    const divisor = 10n ** BigInt(p + extra / degree)
    const finalBigInt = R / divisor
    const resultExponent = totalScale / degree - (p + extra / degree)

    const resultSign = x.s

    const resultDigits = bigIntToDigitArray(finalBigInt)

    return { d: resultDigits, e: resultExponent, s: resultSign }
  }

  // ================================ Utility ================================

  /**
   * 부호 반전
   * @param value 부호 반전할 값
   * @returns 부호 반전된 값 (NumbraDecimal 인터페이스)
   */
  private negate(value: NumbraDecimal): NumbraDecimal {
    return {
      d: value.d,
      e: value.e,
      s: -value.s,
    }
  }

  /**
   * 자릿수 조정
   * @param d 정수 자릿수 배열
   * @param offset 조정할 자릿수 (ex. 1)
   * @returns 조정된 자릿수 배열
   * @description 자릿수 조정 로직
   *
   * 예시1
   * input: [12, 3456789], 1
   * output: [123, 4567890] = 123 * 10^7 + 4567890 * 10^0 = 12,345,678,900
   *
   * 예시2
   * input: [12, 3456789], 2
   * output: [1234, 5678900] = 1234 * 10^7 + 5678900 * 10^0 = 12,345,678,900
   *
   * 예시3
   * input: [1], 8
   * output: [10, 0] = 10 * 10^7 + 0 = 1 * 10^8
   *
   * 예시4
   * input: [1], 23
   * output: [100, 0, 0, 0] = 100 * 10^21 + 0 * 10^14 + 0 * 10^7 + 0 = 1 * 10^23
   */
  private adjustDigits(d: number[], offset: number): number[] {
    return adjustDigits(d, offset)
  }

  /**
   * 덧셈과 뺄셈의 특수 케이스를 처리하는 헬퍼 메서드
   * Input Validation
   * 항등원과 역원 체크
   */
  private handleSpecialCases(
    x: NumbraDecimal | Numbra,
    y: NumbraDecimal | Numbra,
    isSubtraction: boolean = false,
  ): NumbraDecimal | null {
    if (!x.d || !y.d) throw new Error('Invalid input')
    if (this.isZero(x)) {
      if (isSubtraction) {
        if (y.d.length === 1 && y.d[0] === 0) {
          return { d: [0], e: 0, s: 1 }
        }
        return this.negate(y)
      }
      return y
    }
    if (this.isZero(y)) return x
    if (this.isAdditiveInverse(x, y)) return { d: [0], e: 0, s: 1 }

    return null // 특수 케이스가 아님
  }

  /**
   * 입력값을 NumbraDecimal 인터페이스로 변환
   * @param value 변환할 값
   * @returns NumbraDecimal 인터페이스
   */
  private parseInput(value: number | string): NumbraDecimal {
    this.isError(value)

    const str = typeof value === 'number' ? value.toString() : value
    const { sign, mantissa } = splitSignAndMantissa(str)

    let e = 0
    let parts: string[] = []

    if (mantissa.includes('e')) {
      const { mantissa: m, exponent: exp } = eNotationToDecimal(mantissa)
      if (m.includes('.')) {
        const [intPart, decPart] = m.split('.')
        parts = [intPart + decPart]
        e = -decPart.length + exp
      } else {
        parts = [m]
        e = exp
      }
    } else if (mantissa.includes('.')) {
      parts = mantissa.split('.')
      e = -parts[1].length
    } else {
      parts = [mantissa]
      e = 0
    }

    let numStr = parts[0] + (parts[1] || '')
    numStr = numStr.replace(/^0+/, '') || '0'

    return {
      d: toDigitChunks(numStr),
      e,
      s: sign,
    }
  }

  /**
   * 표준 곱셈 연산
   * @param xd 곱할 값
   * @param yd 곱할 값
   * @returns 곱셈 결과 (number[])
   * @description 일반적인 곱셈 연산이기 때문에 작은 값에서는 카라추바 곱셈보다 효율적이나, 부동소수점 이슈가 있음
   */
  private standardMultiply(xd: number[], yd: number[]): number[] {
    let x = 0
    let y = 0

    for (let i = 0; i < xd.length; i++) {
      const pow = (xd.length - 1 - i) * this.logBase
      x += xd[i] * Math.pow(10, pow)
    }

    for (let i = 0; i < yd.length; i++) {
      const pow = (yd.length - 1 - i) * this.logBase
      y += yd[i] * Math.pow(10, pow)
    }

    const result = this.parseInput(x * y)

    return result.d
  }

  /**
   * 카라추바 곱셈 연산 (https://en.wikipedia.org/wiki/Karatsuba_algorithm)
   * @param xd 곱할 값
   * @param yd 곱할 값
   * @returns 곱셈 결과 (number[])
   */
  private karatsubaMultiply(xd: number[], yd: number[]): number[] {
    const n = Math.max(xd.length, yd.length)

    if (n < Math.max(2, this.karatsubaThreshold))
      return this.standardMultiply(xd, yd)

    const paddedXd = [...xd]
    const paddedYd = [...yd]
    while (paddedXd.length < n) paddedXd.unshift(0)
    while (paddedYd.length < n) paddedYd.unshift(0)

    const splitPoint = Math.floor(n / 2)

    const [a, b] = this.split(paddedXd, splitPoint)
    const [c, d] = this.split(paddedYd, splitPoint)

    const m = b.length

    const e_ac = 2 * m * this.logBase
    const e_bd = 0
    const e_abcd = m * this.logBase

    const ac = this.karatsubaMultiply(a, c)
    const bd = this.karatsubaMultiply(b, d)

    const abSum = this.calculateAdd({ d: a, e: 0, s: 1 }, { d: b, e: 0, s: 1 })
    const cdSum = this.calculateAdd({ d: c, e: 0, s: 1 }, { d: d, e: 0, s: 1 })

    const abcd = this.karatsubaMultiply(abSum.d, cdSum.d)

    const decimal_ac = this.calculateAdd(
      { d: [0], e: 0, s: 1 },
      { d: ac, e: e_ac, s: 1 },
    )

    const decimal_bd = this.calculateAdd(
      { d: [0], e: 0, s: 1 },
      { d: bd, e: e_bd, s: 1 },
    )

    const decimal_middle = this.calculateSub(
      { d: abcd, e: 0, s: 1 },
      this.negate(this.calculateAdd(decimal_ac, decimal_bd)),
    )

    const poweredZ2 = this.adjustDigits(decimal_ac.d, e_ac)
    const poweredZ0 = this.adjustDigits(decimal_bd.d, e_bd)
    const poweredZ1 = this.adjustDigits(decimal_middle.d, e_abcd)

    const result = this.calculateAdd(
      this.calculateAdd(
        { d: poweredZ1, e: 0, s: 1 },
        { d: poweredZ0, e: 0, s: 1 },
      ),
      {
        d: poweredZ2,
        e: 0,
        s: 1,
      },
    )

    return result.d
  }

  /**
   * 배열을 두 개의 배열로 나누는 함수
   * @param arr 나눌 배열
   * @param m 나눌 지점
   * @returns 나눈 배열 (number[][])
   */
  private split(arr: number[], m: number): number[][] {
    return [arr.slice(0, m), arr.slice(m)]
  }

  /**
   * 0인지 확인하는 함수
   * @param x 확인할 값
   * @returns 0인지 여부 (boolean)
   */
  private isZero(x: Numbra | NumbraDecimal): boolean {
    const d = this.toDecimal(x)
    return d.d.every((digit) => digit === 0)
  }

  /**
   * 1인지 확인하는 함수
   * @param x 확인할 값
   * @returns 1인지 여부 (boolean)
   */
  private isOne(x: Numbra | NumbraDecimal): boolean {
    const d = this.toDecimal(x)
    return d.d.length === 1 && d.d[0] === 1 && d.e === 0 && d.s === 1
  }

  /**
   * 에러 체크
   * @param x 체크할 값
   */
  private isError(x: NumbraValue): void {
    if (typeof x === 'number') {
      if (x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY) {
        throw new Error('Multiple of Infinity is not allowed')
      } else if (isNaN(x)) {
        throw new Error(`Invalid input: ${x}`)
      }
    } else if (x instanceof Numbra) {
      for (let i = 0; i < x.d.length; i++) {
        if (
          x.d[i] === Number.POSITIVE_INFINITY ||
          x.d[i] === Number.NEGATIVE_INFINITY
        ) {
          throw new Error('Multiple of Infinity is not allowed')
        } else if (isNaN(x.d[i])) {
          throw new Error(`Invalid input: ${x.d[i]}`)
        }
      }
    } else if (typeof x === 'string') {
      if (x.trim() === '') {
        throw new Error('Empty string is not allowed')
      }
      if (!/^[-+]?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?$/i.test(x)) {
        throw new Error(`Invalid number format: ${x}`)
      }
      if (x === 'Infinity' || x === '-Infinity') {
        throw new Error('Multiple of Infinity is not allowed')
      }
      if (isNaN(Number(x))) {
        throw new Error(`Invalid input: ${x}`)
      }
    }
  }

  /**
   * 덧셈 역원 체크
   * @param x 체크할 값
   * @param y 체크할 값
   * @returns 덧셈 역원 여부 (boolean)
   */
  private isAdditiveInverse(
    x: Numbra | NumbraDecimal,
    y: Numbra | NumbraDecimal,
  ): boolean {
    const dx = this.toDecimal(x)
    const dy = this.toDecimal(y)
    return (
      dx.e === dy.e &&
      dx.d.length === dy.d.length &&
      dx.s === -dy.s &&
      dx.d.every((digit, index) => digit === dy.d[index])
    )
  }

  /**
   * 수식 문자열을 토큰으로 분리
   * @param equation 수식 문자열
   * @returns 토큰 배열
   */
  private static tokenize(equation: string): string[] {
    if (equation.includes('{') || equation.includes('}')) {
      throw new Error(`Invalid expression: ${`"{"`} or ${`"}"`}`)
    }

    const tokens: string[] = []
    let currentNumber = ''
    let i = 0
    const parenthesesStack: string[] = []

    while (i < equation.length) {
      const char = equation[i]

      if (equation.slice(i, i + 4) === 'sqrt') {
        if (currentNumber) {
          tokens.push(currentNumber)
          currentNumber = ''
        }
        tokens.push('sqrt')
        i += 4
        continue
      }

      if (/[+\-*/()^]/.test(char)) {
        // 소괄호 갯수 체크
        if (char === '(') {
          parenthesesStack.push(char)
        } else if (char === ')') {
          if (parenthesesStack.length === 0) {
            throw new Error('Invalid equation: Unmatched closing parenthesis')
          }
          parenthesesStack.pop()
        }

        // 현재 숫자가 있으면 토큰으로 추가
        if (currentNumber) {
          tokens.push(currentNumber)
          currentNumber = ''
        }

        // '-' 문자가 음수의 시작인지 연산자인지 판별
        if (
          char === '-' &&
          (tokens.length === 0 || /[+\-*/^(]/.test(tokens[tokens.length - 1]))
        ) {
          // 음수의 시작으로 판단
          currentNumber = '-'
        } else {
          // 연산자로 판단하여 토큰 추가
          tokens.push(char)
        }
      } else if (/[\d.]/.test(char)) {
        // 숫자나 소수점은 현재 숫자에 추가
        currentNumber += char
      } else if (char === ' ') {
        // 공백 처리: 현재 숫자가 있으면 토큰으로 추가
        if (currentNumber) {
          tokens.push(currentNumber)
          currentNumber = ''
        }
      }

      i++
    }

    if (currentNumber) {
      tokens.push(currentNumber)
    }

    if (parenthesesStack.length > 0) {
      throw new Error('Invalid equation: Unmatched opening parenthesis')
    }

    return tokens
  }

  /**
   * 연산자 우선순위를 반환
   */
  private static getPrecedence(operator: string): number {
    switch (operator) {
      case '+':
      case '-':
        return 1
      case '*':
      case '/':
      case '%':
        return 2
      case '^':
      case '**':
        return 3
      case 'sqrt':
        return 4
      default:
        return 0
    }
  }

  /**
   * 중위표기식 토큰을 후위표기식으로 변환
   */
  private static toPostfix(tokens: string[]): string[] {
    const output: string[] = []
    const operatorStack: string[] = []

    for (const token of tokens) {
      if (this.isNumericToken(token)) {
        output.push(token)
        continue
      }

      if (token === 'sqrt' || token === '|') {
        operatorStack.push(token)
        continue
      }

      if (token === '(') {
        operatorStack.push(token)
        continue
      }

      if (token === ')') {
        while (operatorStack.length > 0) {
          const op = operatorStack[operatorStack.length - 1]
          if (op === '(') {
            operatorStack.pop()
            if (
              operatorStack.length > 0 &&
              (operatorStack[operatorStack.length - 1] === 'sqrt' ||
                operatorStack[operatorStack.length - 1] === '|')
            ) {
              output.push(operatorStack.pop()!)
            }
            break
          }
          output.push(operatorStack.pop()!)
        }
        continue
      }

      while (operatorStack.length > 0) {
        const topOperator = operatorStack[operatorStack.length - 1]
        if (topOperator === '(') break

        const currentPrecedence = this.getPrecedence(token)
        const topPrecedence = this.getPrecedence(topOperator)

        if (currentPrecedence <= topPrecedence) {
          output.push(operatorStack.pop()!)
        } else {
          break
        }
      }
      operatorStack.push(token)
    }

    while (operatorStack.length > 0) {
      const operator = operatorStack.pop()!
      if (operator !== '(') {
        output.push(operator)
      }
    }

    return output
  }

  /**
   * 후위표기식을 계산
   */
  private static evaluatePostfix(tokens: string[]): Numbra {
    const stack: Numbra[] = []

    for (const token of tokens) {
      if (!isNaN(Number(token))) {
        stack.push(new Numbra(token))
        continue
      }

      if (token === '|' || token === '!' || token === 'sqrt') {
        const operand = stack.pop()
        if (!operand) throw new Error('Invalid expression')

        switch (token) {
          case '|':
            stack.push(
              operand.s < 0 ? new Numbra(operand.toString().slice(1)) : operand,
            )
            break
          case '!':
            throw new Error('Factorial not implemented yet')
          case 'sqrt':
            stack.push(operand.sqrt())
            break
        }
        continue
      }

      const b = stack.pop()
      const a = stack.pop()
      if (!a || !b) throw new Error('Invalid expression')

      switch (token) {
        case '+':
          stack.push(a.add(b))
          break
        case '-':
          stack.push(a.sub(b))
          break
        case '*':
          stack.push(a.mul(b))
          break
        case '/':
          stack.push(a.div(b))
          break
        case '%':
          stack.push(a.sub(b.mul(a.div(b).toString().split('.')[0])))
          break
        case '^':
        case '**':
          stack.push(a.pow(b))
          break
        case 'sqrt':
          stack.push(a.sqrt(Number(b.toString())))
          break
        default:
          throw new Error(`Unknown operator: ${token}`)
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression')
    }

    return stack[0]
  }

  /**
   * Numbra 인스턴스의 NumbraDecimal 값을 반환하는 헬퍼 메서드
   * @returns NumbraDecimal 값
   */
  private getDecimal(): NumbraDecimal {
    return {
      d: this.d,
      e: this.e,
      s: this.s,
    }
  }

  /**
   * 새로운 Numbra 인스턴스 생성
   * @param d 배열
   * @param e 지수
   * @param s 부호
   * @returns 생성된 Numbra 인스턴스
   */
  private createNewInstance(d: number[], e: number, s: number): Numbra {
    const instance = Object.create(Numbra.prototype)
    instance.d = d
    instance.e = e
    instance.s = s
    instance.base = this.base
    instance.logBase = this.logBase
    instance.karatsubaThreshold = this.karatsubaThreshold
    instance.precision = this.precision
    return instance
  }

  /**
   * NumbraDecimal 값을 문자열로 변환
   * @param decimal 변환할 값
   * @returns 문자열
   */
  private decimalToCalculable(decimal: NumbraDecimal): Calculable {
    if (!decimal.d) return 'NaN' as Calculable

    const str = decimal.s < 0 ? '-' : ''
    let result = ''

    for (let i = 0; i < decimal.d.length; i++) {
      let chunk = decimal.d[i].toString()

      if (i > 0) {
        chunk = chunk.padStart(7, '0')
      }
      result += chunk
    }

    if (decimal.e !== 0) {
      const len = result.length

      if (decimal.e > 0) {
        result = result.padEnd(len + decimal.e, '0')
      } else {
        const insertPos = result.length + decimal.e
        if (insertPos <= 0) {
          result = '0.' + '0'.repeat(-insertPos) + result
        } else {
          result = result.slice(0, insertPos) + '.' + result.slice(insertPos)
        }
      }
    }

    // Brand 타입으로 변환하여 반환
    return (str + result) as Calculable
  }

  private toDecimal(value: Numbra | NumbraDecimal): NumbraDecimal {
    return this.isNumbra(value) ? value.getDecimal() : value
  }

  private isNumbra(value: any): value is Numbra {
    return value instanceof Numbra
  }

  private normalizeResult(
    integerPart: bigint,
    decimalPart: bigint,
    decimalPlaces: number,
    sign: number,
  ): NumbraDecimal {
    const decimalBase = 10n ** BigInt(decimalPlaces)

    // 결과 부호 결정
    let resultSign = sign
    let finalInteger = integerPart
    let finalDecimal = decimalPart

    // 소수부가 음수인 경우 처리
    if (decimalPart < 0n) {
      if (integerPart <= 0n) {
        // 정수부가 음수/0인 경우: 두 부분 모두 음수로 처리
        resultSign = -1
        finalInteger = -integerPart // 부호 반전
        finalDecimal = -decimalPart // 부호 반전
      } else {
        // 정수부가 양수인 경우: 정수부에서 1 빌려와서 소수부 양수로 만듦
        finalInteger = integerPart - 1n
        finalDecimal = decimalBase + decimalPart // 소수부 양수화

        // 결과 부호 처리
        if (finalInteger < 0n) {
          resultSign = -1
          finalInteger = -finalInteger
        }
      }
    }
    // 소수부가 양수이고 정수부가 음수인 경우
    else if (decimalPart > 0n && integerPart < 0n) {
      resultSign = -1
      finalInteger = -integerPart // 부호 반전

      // 소수부가 0이 아니면 정수부에서 1 빌려와 소수부를 조정
      if (decimalPart > 0n) {
        finalInteger = finalInteger - 1n
        finalDecimal = decimalBase - decimalPart
      }
    }
    // 그 외의 경우: 올림 처리
    else {
      const carry = decimalPart / decimalBase
      finalInteger = integerPart + carry
      finalDecimal = decimalPart % decimalBase

      // 결과 부호 처리
      if (finalInteger < 0n) {
        resultSign = -1
        finalInteger = -finalInteger
      }
    }

    // 결과를 NumbraDecimal 형태로 변환
    const absInteger = finalInteger.toString()
    const absDecimal = finalDecimal.toString().padStart(decimalPlaces, '0')
    const resultStr =
      (resultSign < 0 ? '-' : '') +
      absInteger +
      (decimalPlaces > 0 ? '.' + absDecimal : '')

    return this.parseInput(resultStr)
  }

  private static isNumericToken(token: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(token)
  }
}
