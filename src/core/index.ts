interface Decimal {
  d: number[]
  e: number
  s: number
}

export class BroCalc {
  private base: number
  private logBase: number
  private karatsubaThreshold: number
  private maxDigits: number
  private num: Decimal

  constructor(value: number | string = 0) {
    this.base = 1e7
    this.logBase = 7
    this.maxDigits = 1e9
    this.karatsubaThreshold = 30
    this.num = this.parseInput(value)
  }

  // ================================ Public Methods ================================

  add(value: string | number): Decimal {
    const o = this.parseInput(value)
    const result = this.calculateAdd(this.num, o)
    this.num = result

    return this.num
  }

  subtract(value: string | number): Decimal {
    const o = this.parseInput(value)
    const result = this.calculateSubtract(this.num, o)
    this.num = result

    return this.num
  }

  multiply(value: number | string): Decimal {
    const o = this.parseInput(value)
    const result = this.calculateMultiply(this.num, o)
    this.num = result

    return this.num
  }

  divide(value: number | string): Decimal {
    const o = this.parseInput(value)
    const result = this.calculateDivide(this.num, o)
    this.num = result

    return this.num
  }

  // ================================ Calculation Logic ================================

  private calculateAdd(x: Decimal, y: Decimal): Decimal {
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    // 더 작은 지수를 기준으로 통일
    const newE = Math.min(x.e, y.e)

    let result = []
    let carry = 0

    // 배열 길이 맞추기 (앞쪽에 0 패딩)
    const xd = [...x.d]
    const yd = [...y.d]

    if (x.e < y.e) {
      // y의 자릿수 조정
      const offsetY = y.e - newE
      for (let i = 0; i < offsetY; i++) {
        yd.push(0)
      }
    } else {
      // x의 자릿수 조정
      const offsetX = x.e - newE
      for (let i = 0; i < offsetX; i++) {
        xd.push(0)
      }
    }

    // 더 긴 배열 기준으로 덧셈
    const maxLength = Math.max(xd.length, yd.length)

    // 뒷자리부터 계산
    for (let i = maxLength - 1; i >= 0; i--) {
      const sum = xd[i] + yd[i] + carry
      result.push(sum % this.base)
      carry = Math.floor(sum / this.base)
    }

    // 마지막 올림수 처리
    if (carry > 0) {
      result.unshift(carry)
    }

    // 후처리: 뒤쪽 불필요한 0 제거
    while (result[result.length - 1] === 0 && result.length > 1) {
      result.pop()
    }

    return {
      d: result,
      e: newE,
      s: 1,
    }
  }

  private calculateSubtract(x: Decimal, y: Decimal): Decimal {
    // 뺄셈은 부호를 바꾼 덧셈으로 처리
    const negY = {
      d: y.d,
      e: y.e,
      s: -y.s,
    }

    return this.calculateAdd(x, negY)
  }

  private calculateMultiply(x: Decimal, y: Decimal): Decimal {
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    // 결과 부호 결정
    const sign = x.s * y.s

    // 결과 지수 계산
    const resultE = x.e + y.e

    // 배열 길이에 따라 알고리즘 선택
    let digits: number[] = []
    if (x.d.length + y.d.length < this.karatsubaThreshold) {
      digits = this.standardMultiply(x.d, y.d)
    } else {
      digits = this.karatsubaMultiply(x.d, y.d)
    }

    // 정규화 및 올림수 처리
    let carry = 0
    for (let i = digits.length - 1; i >= 0; i--) {
      const temp = digits[i] + carry
      digits[i] = temp % this.base
      carry = Math.floor(temp / this.base)
    }
    if (carry > 0) digits.unshift(carry)

    return {
      d: digits,
      e: resultE,
      s: sign,
    }
  }

  private calculateDivide(x: Decimal, y: Decimal): Decimal {
    if (!y.d || this.isZero(y)) throw new Error('Division by zero')
    if (!x.d) throw new Error('Invalid dividend')

    // Newton-Raphson 방법으로 1/y 근사값 계산
    const reciprocal = this.newtonRaphsonReciprocal(y)

    // x * (1/y) 계산
    const result = this.calculateMultiply(x, reciprocal)

    // 정밀도 조정
    return this.roundToPrecision(this.getPrecision())
  }

  // ================================ Utility ================================

  private parseInput(value: number | string): Decimal {
    // 입력값을 문자열로 변환
    const str = value.toString()

    // 부호 확인
    let sign = 1
    let numStr = str
    if (str[0] === '-') {
      sign = -1
      numStr = str.slice(1)
    } else if (str[0] === '+') {
      numStr = str.slice(1)
    }

    // 소수점 처리
    let e = 0
    const dotIndex = numStr.indexOf('.')
    if (dotIndex !== -1) {
      numStr = numStr.replace('.', '')
    }

    // 앞뒤 불필요한 0 제거
    numStr = numStr.replace(/^0+/, '')
    if (numStr === '') numStr = '0'

    // 7자리씩 끊어서 배열로 변환
    const digits: number[] = []
    for (let i = 0; i < numStr.length; i += this.logBase) {
      const chunk = numStr.slice(i, i + this.logBase)
      digits.push(parseInt(chunk, 10))
    }

    // 소수점이 있었다면 지수 계산
    if (dotIndex !== -1) {
      e = -(numStr.length - dotIndex)
    }

    return {
      d: digits,
      e: e,
      s: sign,
    }
  }

  private standardMultiply(xd: number[], yd: number[]): number[] {
    const result = new Array(xd.length + yd.length).fill(0)

    // 기본 곱셈
    for (let i = xd.length - 1; i >= 0; i--) {
      for (let j = yd.length - 1; j >= 0; j--) {
        const product = xd[i] * yd[j]
        const pos = i + j
        result[pos] += product
      }
    }

    return result
  }

  private karatsubaMultiply(xd: number[], yd: number[]): number[] {
    const n = Math.max(xd.length, yd.length)
    if (n <= this.karatsubaThreshold) return this.standardMultiply(xd, yd)

    // 배열 길이 맞추기
    const paddedXd = [...xd]
    const paddedYd = [...yd]
    while (paddedXd.length < n) paddedXd.push(0)
    while (paddedYd.length < n) paddedYd.push(0)

    const m = Math.floor(n / 2)

    // 분할
    const [a, b] = this.split(paddedXd, m)
    const [c, d] = this.split(paddedYd, m)

    // 재귀적 계산
    const ac = this.karatsubaMultiply(a, c)
    const bd = this.karatsubaMultiply(b, d)

    // a+b와 c+d 계산을 위한 임시 Decimal 객체 생성
    const abSum = this.calculateAdd({ d: a, e: 0, s: 1 }, { d: b, e: 0, s: 1 })
    const cdSum = this.calculateAdd({ d: c, e: 0, s: 1 }, { d: d, e: 0, s: 1 })

    const abcd = this.karatsubaMultiply(abSum.d, cdSum.d)

    // 결과 조합
    const result = new Array(ac.length + 2 * m).fill(0)

    // ac 부분 (고차항)
    for (let i = 0; i < ac.length; i++) {
      result[i] += ac[i]
    }

    // middle 부분
    const middle = this.calculateSubtract(
      this.calculateSubtract({ d: abcd, e: 0, s: 1 }, { d: ac, e: 0, s: 1 }),
      { d: bd, e: 0, s: 1 },
    ).d

    for (let i = 0; i < middle.length; i++) {
      result[i + m] += middle[i]
    }

    // bd 부분 (저차항)
    for (let i = 0; i < bd.length; i++) {
      result[i + 2 * m] += bd[i]
    }

    return result
  }

  private newtonRaphsonReciprocal(y: Decimal): Decimal {
    // 초기 추정값 계산
    const initialExp = -Math.floor(Math.log10(Math.abs(y.d[0]))) - y.e
    let r = {
      d: [1],
      e: initialExp,
      s: y.s,
    }

    // Newton-Raphson 반복
    // r = r * (2 - y * r)
    for (let i = 0; i < 3; i++) {
      // 일반적으로 3-4회 반복으로 충분한 정확도 달성
      const yr = this.calculateMultiply(y, r)
      const two_minus_yr = this.calculateSubtract({ d: [2], e: 0, s: 1 }, yr)
      r = this.calculateMultiply(r, two_minus_yr)
    }

    return r
  }

  // 헬퍼 함수들
  private split(arr: number[], m: number): number[][] {
    return [arr.slice(0, m), arr.slice(m)]
  }

  private isZero(x: Decimal): boolean {
    return !x.d || (x.d.length === 1 && x.d[0] === 0)
  }

  private getPrecision(): number {
    return Math.min(
      this.maxDigits,
      this.num.d.length * this.logBase + this.num.d.length * this.logBase,
    )
  }

  private roundToPrecision(precision: number): Decimal {
    // 정밀도에 따른 반올림 처리
    const digits = Math.floor(precision / this.logBase)
    if (this.num.d.length > digits) {
      this.num.d.length = digits
      this.num.d = this.num.d.slice(0, digits)
    }
    return this.num
  }

  // 결과를 문자열로 변환하는 헬퍼 함수
  toString(): string {
    if (!this.num.d) return 'NaN'

    let str = this.num.s < 0 ? '-' : ''
    let result = ''

    // 각 BASE 단위 숫자를 문자열로 변환
    for (let i = 0; i < this.num.d.length; i++) {
      let chunk = this.num.d[i].toString()

      // 첫 번째 청크가 아니면 7자리로 패딩
      if (i > 0) {
        chunk = chunk.padStart(this.logBase, '0')
      }

      result += chunk
    }

    // 지수 적용
    if (this.num.e !== 0) {
      const len = result.length
      const absE = Math.abs(this.num.e)

      if (this.num.e > 0) {
        result = result.padEnd(len + this.num.e, '0')
      } else {
        result = '0'.repeat(absE - len + 1) + result
        result = result.slice(0, -this.num.e) + '.' + result.slice(-this.num.e)
      }
    }

    return str + result
  }
}
