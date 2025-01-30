interface Decimal {
  d: number[]
  e: number
  s: number
}

export class BroCalc {
  private scale: bigint
  private precision: number
  private base: number
  private logBase: number
  private karatsubaThreshold: number
  private maxDigits: number
  private expLimit: number
  private num: Decimal

  constructor(precision: number = 2) {
    this.precision = precision
    this.scale = BigInt(10 ** precision)
    this.base = 1e7
    this.logBase = 7
    this.karatsubaThreshold = 30
    this.maxDigits = 1e9
    this.expLimit = 9e15
    this.num = {
      d: [],
      e: 0,
      s: 1,
    }
  }

  add(x: Decimal, y: Decimal): Decimal {
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

  subtract(x: Decimal, y: Decimal): Decimal {
    // 뺄셈은 부호를 바꾼 덧셈으로 처리
    const negY = {
      d: y.d,
      e: y.e,
      s: -y.s,
    }

    return this.add(x, negY)
  }

  multiply(x: Decimal, y: Decimal): Decimal {
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

  divide(x: Decimal, y: Decimal): Decimal {
    if (!y.d || this.isZero(y)) throw new Error('Division by zero')
    if (!x.d) throw new Error('Invalid dividend')

    // Newton-Raphson 방법으로 1/y 근사값 계산
    const reciprocal = this.newtonRaphsonReciprocal(y)

    // x * (1/y) 계산
    const result = this.multiply(x, reciprocal)

    // 정밀도 조정
    return this.roundToPrecision(result, this.getPrecision(x, y))
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
    while (xd.length < n) xd.push(0)
    while (yd.length < n) yd.push(0)

    const m = Math.floor(n / 2)

    // 분할
    const [a, b] = this.split(xd, m)
    const [c, d] = this.split(yd, m)

    // 재귀적 계산
    const ac = this.karatsubaMultiply(a, c)
    const bd = this.karatsubaMultiply(b, d)
    const abcd = this.karatsubaMultiply(
      this.add({ d: a, e: 0, s: 1 }, { d: b, e: 0, s: 1 }).d,
      this.add({ d: c, e: 0, s: 1 }, { d: d, e: 0, s: 1 }).d,
    )

    // 결과 조합
    return this.combine(ac, bd, abcd, m)
  }

  private newtonRaphsonReciprocal(y: Decimal): Decimal {
    // 초기 추정값
    let r = {
      d: [1],
      e: -this.estimateExponent(y),
      s: y.s,
    }

    // Newton-Raphson 반복
    // r = r * (2 - y * r)
    for (let i = 0; i < this.getPrecision(y, y); i++) {
      const yr = this.multiply(y, r)
      const two_minus_yr = this.subtract({ d: [2], e: 0, s: 1 }, yr)
      r = this.multiply(r, two_minus_yr)
    }

    return r
  }

  // ================================

  // 헬퍼 함수들
  private split(arr: number[], m: number): number[][] {
    return [arr.slice(0, m), arr.slice(m)]
  }

  private combine(
    ac: number[],
    bd: number[],
    abcd: number[],
    m: number,
  ): number[] {
    // abcd - ac - bd
    const middle = this.subtract(
      this.subtract({ d: abcd, e: 0, s: 1 }, { d: ac, e: 0, s: 1 }),
      { d: bd, e: 0, s: 1 },
    ).d

    // ac * BASE^(2m) + middle * BASE^m + bd
    const result = new Array(ac.length + 2 * m).fill(0)

    // ac 부분
    for (let i = 0; i < ac.length; i++) {
      result[i] = ac[i]
    }

    // middle 부분
    for (let i = 0; i < middle.length; i++) {
      result[i + m] += middle[i]
    }

    // bd 부분
    for (let i = 0; i < bd.length; i++) {
      result[i + 2 * m] += bd[i]
    }

    return result
  }

  private isZero(x: Decimal): boolean {
    return !x.d || (x.d.length === 1 && x.d[0] === 0)
  }

  private getPrecision(x: Decimal, y: Decimal): number {
    return Math.min(
      this.maxDigits,
      x.d.length * this.logBase + y.d.length * this.logBase,
    )
  }

  private estimateExponent(x: Decimal): number {
    return x.d.length * this.logBase + x.e
  }

  private roundToPrecision(x: Decimal, precision: number): Decimal {
    // 정밀도에 따른 반올림 처리
    const digits = Math.floor(precision / this.logBase)
    if (x.d.length > digits) {
      x.d.length = digits
      x.d = x.d.slice(0, digits)
    }
    return x
  }

  // 결과를 문자열로 변환하는 헬퍼 함수
  private toString(x: Decimal): string {
    if (!x.d) return 'NaN'

    let str = x.s < 0 ? '-' : ''
    let result = ''

    // 각 BASE 단위 숫자를 문자열로 변환
    for (let i = 0; i < x.d.length; i++) {
      let chunk = x.d[i].toString()

      // 첫 번째 청크가 아니면 7자리로 패딩
      if (i > 0) {
        chunk = chunk.padStart(this.logBase, '0')
      }

      result += chunk
    }

    // 지수 적용
    if (x.e !== 0) {
      const len = result.length
      const absE = Math.abs(x.e)

      if (x.e > 0) {
        result = result.padEnd(len + x.e, '0')
      } else {
        result = '0'.repeat(absE - len + 1) + result
        result = result.slice(0, -x.e) + '.' + result.slice(-x.e)
      }
    }

    return str + result
  }
}
