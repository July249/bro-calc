interface Decimal {
  d: number[]
  e: number
  s: number
}

export class BroCalc implements Decimal {
  d: number[]
  e: number
  s: number

  private base: number
  private logBase: number
  private karatsubaThreshold: number
  private maxDigits: number

  constructor(value: number | string = 0) {
    this.base = 1e7
    this.logBase = 7
    this.maxDigits = 1e9
    this.karatsubaThreshold = 30

    const parsed = this.parseInput(value)
    this.d = parsed.d
    this.e = parsed.e
    this.s = parsed.s
  }

  // ================================ Public Methods ================================

  add(value: string | number | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateAdd(this, o)
    console.log('calculateAdd return', result)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  sub(value: string | number | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateSub(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  mul(value: number | string | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateMul(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  div(value: number | string | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateDiv(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  toString(): string {
    return this.decimalToString(this)
  }

  // ================================ Calculation Logic ================================

  private calculateAdd(x: Decimal, y: Decimal): Decimal {
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    // 덧셈 항등원(0) 체크
    if (this.isZero(y)) {
      return x
    }
    if (this.isZero(x)) {
      return y
    }

    // 덧셈 역원 체크
    if (this.isAdditiveInverse(x, y)) {
      return { d: [0], e: 0, s: 1 }
    }

    const newE = Math.min(x.e, y.e)
    const xd = [...x.d]
    const yd = [...y.d]

    if (x.e < y.e) {
      // y의 자릿수 조정
      const offsetY = y.e - newE

      for (let i = 0; i < offsetY; i++) {
        const lastNum = yd[yd.length - 1]
        const lastNumLength = lastNum.toString().length

        if (lastNumLength < this.logBase) {
          // 현재 요소가 7자리 미만이면 현재 요소에 0 추가
          yd[yd.length - 1] = lastNum * 10
        } else {
          // 이미 7자리면 새로운 요소로 0 추가
          yd.push(0)
        }
      }
    } else if (y.e < x.e) {
      // x의 자릿수 조정
      const offsetX = x.e - newE

      for (let i = 0; i < offsetX; i++) {
        const lastNum = xd[xd.length - 1]
        const lastNumLength = lastNum.toString().length

        if (lastNumLength < this.logBase) {
          // 현재 요소가 7자리 미만이면 현재 요소에 0 추가
          xd[xd.length - 1] = lastNum * 10
        } else {
          // 이미 7자리면 새로운 요소로 0 추가
          xd.push(0)
        }
      }
    }

    const result = []
    let carry = 0
    const maxLength = Math.max(xd.length, yd.length)

    // 부호 처리 로직 수정
    let resultSign = 1 // 기본값을 1로 설정

    if (x.s === y.s) {
      // 두 수의 부호가 같으면 결과의 부호도 같음
      resultSign = x.s
    } else {
      // 절대값 비교
      const // 부호가 다르면 절대값이 큰 수의 부호를 따름
        // 이 부분은 실제로는 뺄셈 로직으로 처리되어야 할 수 있음
        resultSign = Math.abs(x.d[0]) >= Math.abs(y.d[0]) ? x.s : y.s
    }

    for (let i = maxLength - 1; i >= 0; i--) {
      const xs = x.s < 0 ? -1 : 1
      const ys = y.s < 0 ? -1 : 1
      const sum = xs * (xd[i] || 0) + ys * (yd[i] || 0) + carry
      result.unshift(Math.abs(sum) % this.base)
      carry = Math.floor(Math.abs(sum) / this.base)
    }

    if (carry > 0) {
      result.unshift(carry)
    }

    return {
      d: result,
      e: newE,
      s: resultSign,
    }
  }

  private calculateSub(x: Decimal, y: Decimal): Decimal {
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    const newE = Math.min(x.e, y.e)
    const xd = [...x.d]
    const yd = [...y.d]

    // Adjust digits based on exponent difference
    if (x.e < y.e) {
      const offsetY = y.e - newE
      for (let i = 0; i < offsetY; i++) {
        yd.push(0)
      }
    } else {
      const offsetX = x.e - newE
      for (let i = 0; i < offsetX; i++) {
        xd.push(0)
      }
    }

    let result = []
    let borrow = 0
    const maxLength = Math.max(xd.length, yd.length)

    for (let i = maxLength - 1; i >= 0; i--) {
      let diff = (xd[i] || 0) - (yd[i] || 0) - borrow
      if (diff < 0) {
        diff += this.base
        borrow = 1
      } else {
        borrow = 0
      }
      result.push(diff)
    }

    // Remove trailing zeros
    while (result[result.length - 1] === 0 && result.length > 1) {
      result.pop()
    }

    return {
      d: result,
      e: newE,
      s: 1,
    }
  }

  private calculateMul(x: Decimal, y: Decimal): Decimal {
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    // 곱셈 항등원(1) 체크
    if (this.isOne(y)) {
      return x
    }
    if (this.isOne(x)) {
      return y
    }

    // 0과의 곱셈 최적화
    if (this.isZero(x) || this.isZero(y)) {
      return { d: [0], e: 0, s: 1 }
    }

    const sign = x.s * y.s
    const resultE = x.e + y.e

    let digits: number[] = []
    if (x.d.length + y.d.length < this.karatsubaThreshold) {
      digits = this.standardMultiply(x.d, y.d)
    } else {
      digits = this.karatsubaMultiply(x.d, y.d)
    }

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

  private calculateDiv(x: Decimal, y: Decimal): Decimal {
    if (!y.d || this.isZero(y)) throw new Error('Division by zero')
    if (!x.d) throw new Error('Invalid dividend')

    const reciprocal = this.newtonRaphsonReciprocal(y)
    return this.calculateMul(x, reciprocal)
  }

  // ================================ Utility ================================

  private parseInput(value: number | string): Decimal {
    let str = ''

    if (typeof value === 'number') {
      str = value.toString()
    } else {
      str = value
    }
    // 부호 처리
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
    const parts = numStr.split('.')
    numStr = parts[0] + (parts[1] || '')
    if (parts.length > 1) {
      e = -parts[1].length
    }

    // 앞의 0 제거
    numStr = numStr.replace(/^0+/, '')
    if (numStr === '') numStr = '0'

    // 7자리씩 끊어서 배열로 변환 (끝에서부터)
    const digits: number[] = []

    for (let i = numStr.length; i > 0; i -= this.logBase) {
      const start = Math.max(0, i - this.logBase)
      const chunk = numStr.slice(start, i)
      digits.unshift(parseInt(chunk, 10))
    }

    return {
      d: digits,
      e,
      s: sign,
    }
  }

  private standardMultiply(xd: number[], yd: number[]): number[] {
    const result = new Array(xd.length + yd.length).fill(0)

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

    const paddedXd = [...xd]
    const paddedYd = [...yd]
    while (paddedXd.length < n) paddedXd.push(0)
    while (paddedYd.length < n) paddedYd.push(0)

    const m = Math.floor(n / 2)

    const [a, b] = this.split(paddedXd, m)
    const [c, d] = this.split(paddedYd, m)

    const ac = this.karatsubaMultiply(a, c)
    const bd = this.karatsubaMultiply(b, d)

    const abSum = this.calculateAdd({ d: a, e: 0, s: 1 }, { d: b, e: 0, s: 1 })
    const cdSum = this.calculateAdd({ d: c, e: 0, s: 1 }, { d: d, e: 0, s: 1 })

    const abcd = this.karatsubaMultiply(abSum.d, cdSum.d)

    const result = new Array(ac.length + 2 * m).fill(0)

    for (let i = 0; i < ac.length; i++) {
      result[i] += ac[i]
    }

    const middle = this.calculateSub(
      this.calculateSub({ d: abcd, e: 0, s: 1 }, { d: ac, e: 0, s: 1 }),
      { d: bd, e: 0, s: 1 },
    ).d

    for (let i = 0; i < middle.length; i++) {
      result[i + m] += middle[i]
    }

    for (let i = 0; i < bd.length; i++) {
      result[i + 2 * m] += bd[i]
    }

    return result
  }

  private newtonRaphsonReciprocal(y: Decimal): Decimal {
    const initialExp = -Math.floor(Math.log10(Math.abs(y.d[0]))) - y.e
    let r = {
      d: [1],
      e: initialExp,
      s: y.s,
    }

    for (let i = 0; i < 3; i++) {
      const yr = this.calculateMul(y, r)
      const two_minus_yr = this.calculateSub({ d: [2], e: 0, s: 1 }, yr)
      r = this.calculateMul(r, two_minus_yr)
    }

    return r
  }

  private split(arr: number[], m: number): number[][] {
    return [arr.slice(0, m), arr.slice(m)]
  }

  // private isZero(x: Decimal): boolean {
  //   return !x.d || (x.d.length === 1 && x.d[0] === 0)
  // }

  private isZero(x: BroCalc | Decimal): boolean {
    const d = x instanceof BroCalc ? x.getDecimal() : x
    return d.d.every((digit) => digit === 0)
  }

  private isOne(x: BroCalc | Decimal): boolean {
    const d = x instanceof BroCalc ? x.getDecimal() : x
    return d.d.length === 1 && d.d[0] === 1 && d.e === 0 && d.s === 1
  }

  private isNegativeOne(x: Decimal): boolean {
    return x.d.length === 1 && x.d[0] === 1 && x.e === 0 && x.s === -1
  }

  private getPrecision(): number {
    return Math.min(
      this.maxDigits,
      this.d.length * this.logBase + this.d.length * this.logBase,
    )
  }

  private isAdditiveInverse(
    x: BroCalc | Decimal,
    y: BroCalc | Decimal,
  ): boolean {
    const dx = x instanceof BroCalc ? x.getDecimal() : x
    const dy = y instanceof BroCalc ? y.getDecimal() : y
    return (
      dx.e === dy.e &&
      dx.d.length === dy.d.length &&
      dx.s === -dy.s &&
      dx.d.every((digit, index) => digit === dy.d[index])
    )
  }

  // 현재 BroCalc 인스턴스의 Decimal 값을 반환하는 헬퍼 메서드
  private getDecimal(): Decimal {
    return {
      d: this.d,
      e: this.e,
      s: this.s,
    }
  }

  private roundToPrecision(decimal: Decimal): Decimal {
    const digits = Math.floor(this.getPrecision() / this.logBase)
    const newD = decimal.d.slice(0, digits)

    return {
      d: newD,
      e: decimal.e,
      s: decimal.s,
    }
  }

  private createNewInstance(d: number[], e: number, s: number): BroCalc {
    const newBroCalc = Object.create(BroCalc.prototype)
    newBroCalc.d = d
    newBroCalc.e = e
    newBroCalc.s = s
    return newBroCalc
  }

  private decimalToString(decimal: Decimal): string {
    console.log('decimalToString input:', decimal)
    if (!decimal.d) return 'NaN'

    let str = decimal.s < 0 ? '-' : ''
    let result = ''

    // 각 배열 요소를 문자열로 변환
    for (let i = 0; i < decimal.d.length; i++) {
      let chunk = decimal.d[i].toString()

      // 첫 번째 요소가 아니면 7자리로 패딩
      if (i > 0) {
        chunk = chunk.padStart(this.logBase, '0')
      }
      result += chunk
    }

    // 지수에 따른 소수점 처리
    if (decimal.e !== 0) {
      const len = result.length
      const absE = Math.abs(decimal.e)

      if (decimal.e > 0) {
        // 양수 지수: 뒤에 0 추가
        result = result.padEnd(len + decimal.e, '0')
      } else {
        // 음수 지수: 소수점 추가
        const insertPos = result.length + decimal.e
        if (insertPos <= 0) {
          // 0.0xxx 형태
          result = '0.' + '0'.repeat(-insertPos) + result
        } else {
          // xx.xxx 형태
          result = result.slice(0, insertPos) + '.' + result.slice(insertPos)
        }
      }
    }

    return str + result
  }
}
