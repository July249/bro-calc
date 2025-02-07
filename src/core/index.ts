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
    this.karatsubaThreshold = 4

    const parsed = this.parseInput(value)
    this.d = parsed.d
    this.e = parsed.e
    this.s = parsed.s
  }

  // ================================ Public Methods ================================

  add(value: string | number | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    let result: Decimal = {
      d: [0],
      e: 0,
      s: 1,
    }
    if (this.s === -1)
      throw new Error(
        'Negative number is not allowed. Use sub function instead.',
      )

    if (o.s === -1) {
      result = this.calculateSub(this, o)
    } else {
      result = this.calculateAdd(this, o)
    }
    return this.createNewInstance(result.d, result.e, result.s)
  }

  sub(value: string | number | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    let result: Decimal = {
      d: [0],
      e: 0,
      s: 1,
    }

    if (this.s !== o.s) {
      const n = this.negate(o)
      result = this.calculateAdd(this, n)
    } else {
      result = this.calculateSub(this, o)
    }

    console.log('sub - result', result)

    return this.createNewInstance(result.d, result.e, result.s)
  }

  mul(value: number | string | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateMul(this, o)
    console.log('mul - result', result)
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
    let xd = [...x.d]
    let yd = [...y.d]

    if (x.e < y.e) {
      // y의 자릿수 조정
      const offsetY = y.e - newE
      yd = this.adjustDigits(yd, offsetY)
    } else if (y.e < x.e) {
      // x의 자릿수 조정
      const offsetX = x.e - newE
      xd = this.adjustDigits(xd, offsetX)
    }

    const result: number[] = []
    let carry = 0
    const maxLength = Math.max(xd.length, yd.length)

    // 부호 처리 로직 수정
    let resultSign = 1 // 기본값을 1로 설정

    if (x.s === y.s) {
      resultSign = x.s
    } else {
      resultSign = this.isFirstBigger(xd, yd) ? x.s : y.s
    }

    let lengthDiff = xd.length - yd.length

    // 배열 보정
    while (lengthDiff !== 0) {
      if (lengthDiff < 0) {
        // xd의 자릿수 조정
        xd.unshift(0)
      } else if (lengthDiff > 0) {
        // yd의 자릿수 조정
        yd.unshift(0)
      }
      lengthDiff = xd.length - yd.length
    }

    for (let i = maxLength - 1; i >= 0; i--) {
      const xs = x.s < 0 ? -1 : 1
      const ys = y.s < 0 ? -1 : 1

      console.log(`calculateAdd - xd[${i}]`, xs * (xd[i] || 0))
      console.log(`calculateAdd - yd[${i}]`, ys * (yd[i] || 0))
      console.log(`calculateAdd - carry`, carry)

      const sum = xs * (xd[i] || 0) + ys * (yd[i] || 0) + carry
      console.log('calculateAdd - sum', sum)

      result.unshift(Math.abs(sum) % this.base)

      const absSum = Math.abs(sum)

      // carry의 부호를 유지하면서 계산
      if (sum < 0) {
        carry = -Math.floor(absSum / this.base)
      } else {
        carry = Math.floor(absSum / this.base)
      }

      console.log('calculateAdd - result', result)
    }

    if (carry > 0) {
      result.unshift(carry)
    }

    console.log('calculateAdd - return', result)

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

    // 덧셈 항등원(0) 체크
    if (this.isZero(y)) return x
    if (this.isZero(x)) return this.negate(y)

    // 덧셈 역원 체크
    if (this.isAdditiveInverse(x, y)) return { d: [0], e: 0, s: 1 }

    const newE = Math.min(x.e, y.e)
    let xd = [...x.d]
    let yd = [...y.d]

    if (x.e < y.e) {
      // y의 자릿수 조정
      const offsetY = y.e - newE
      yd = this.adjustDigits(yd, offsetY)
    } else if (y.e < x.e) {
      // x의 자릿수 조정
      const offsetX = x.e - newE
      xd = this.adjustDigits(xd, offsetX)
    }

    const result: number[] = []
    let borrow = 0

    const maxLength = Math.max(xd.length, yd.length)

    // 부호 처리 로직 수정
    let resultSign = 1 // 기본값을 1로 설정

    if (x.s === y.s) {
      resultSign = x.s
    } else {
      resultSign = this.isFirstBigger(xd, yd) ? x.s : y.s
    }

    let lengthDiff = xd.length - yd.length

    // 배열 보정
    while (lengthDiff !== 0) {
      if (lengthDiff < 0) {
        // xd의 자릿수 조정
        xd.unshift(0)
      } else if (lengthDiff > 0) {
        // yd의 자릿수 조정
        yd.unshift(0)
      }
      lengthDiff = xd.length - yd.length
    }

    for (let i = maxLength - 1; i >= 0; i--) {
      let diff = xd[i] - yd[i] - borrow

      if (diff < 0) {
        diff += 10000000
        borrow = 1
      } else {
        borrow = 0
      }

      result.unshift(diff)
    }

    while (result[0] === 0 && result.length > 1) {
      result.shift()
    }

    return {
      d: result,
      e: newE,
      s: resultSign,
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
    if (this.isZero(x)) return { d: [0], e: 0, s: 1 }

    // 부호 처리
    const resultSign = x.s * y.s
    // 초기 지수 차이 계산
    let quotientExp = x.e - y.e

    // 피제수와 제수의 배열 복사
    const dividend = x.d.slice()
    const divisor = y.d.slice()

    // 선행 0 제거
    while (dividend[0] === 0 && dividend.length > 1) dividend.shift()
    while (divisor[0] === 0 && divisor.length > 1) divisor.shift()

    // dividend < divisor 체크 부분 수정
    if (this.compareArrays(dividend, divisor) < 0) {
      // 여기서 바로 0을 반환하지 말고, 소수점 이하 자릿수를 계산해야 함
      dividend.push(0) // 소수점 이하 계산을 위해 0을 추가
      quotientExp-- // 지수 조정
    }

    const quotient: number[] = []
    let remainder: number[] = []

    // 장수 나눗셈 수행
    for (let i = 0; i < dividend.length; i++) {
      // 현재 자릿수를 remainder에 추가
      remainder.push(dividend[i])

      // remainder의 선행 0 제거
      while (remainder[0] === 0 && remainder.length > 1) {
        remainder.shift()
      }

      // 현재 remainder와 divisor를 비교하여 몫 계산
      let qdigit = 0
      console.log(
        'this.compareArrays(remainder, divisor)',
        this.compareArrays(remainder, divisor),
      )
      console.log('remainder', remainder)
      console.log('divisor', divisor)
      console.log('qdigit', qdigit)
      while (this.compareArrays(remainder, divisor) >= 0) {
        remainder = this.subtractArrays(remainder, divisor)
        qdigit++

        // BASE를 넘어가지 않도록 체크
        if (qdigit >= this.base) {
          throw new Error('Division result exceeds maximum digits')
        }
      }

      quotient.push(qdigit)
    }

    // 결과의 선행 0 제거
    while (quotient[0] === 0 && quotient.length > 1) {
      quotient.shift()
    }

    // 후행 0 제거
    while (quotient[quotient.length - 1] === 0 && quotient.length > 1) {
      quotient.pop()
    }

    // 자릿수 조정
    let adjustedQuotient = quotient
    let adjustedExp = quotientExp

    console.log('adjustedQuotient', adjustedQuotient)
    console.log('adjustedExp', adjustedExp)

    // BASE(10^7) 기준으로 자릿수 조정
    while (adjustedQuotient[0] >= this.base) {
      const carry = Math.floor(adjustedQuotient[0] / this.base)
      adjustedQuotient[0] %= this.base
      adjustedQuotient.unshift(carry)
      adjustedExp += this.logBase
    }

    return {
      d: adjustedQuotient,
      e: adjustedExp,
      s: resultSign,
    }
  }

  // ================================ Utility ================================

  private negate(value: Decimal): Decimal {
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
    const result = [...d]

    const quotient = Math.floor(offset / this.logBase)
    const remainder = offset % this.logBase

    // 10^(offset / this.logBase의 나머지) 만큼 result의 모든 요소에 곱함
    for (let i = 0; i < result.length; i++) {
      result[i] *= Math.pow(10, remainder)
    }

    // result[i]의 자릿수가 7자리를 넘어가면 넘어간 부분을 자릿수 올림(result[i-1]에 더함)
    for (let i = 0; i < result.length; i++) {
      if (result[i].toString().length > this.logBase) {
        const overflow_length = result[i].toString().length - this.logBase

        const overflow_str = result[i].toString().slice(0, overflow_length)

        result[i - 1] += parseInt(overflow_str, 10)
        result[i] = parseInt(result[i].toString().slice(overflow_length), 10)
      }
    }

    // 10^(offset / this.logBase의 몫) 만큼 result에 0만 있는 요소를 추가
    for (let i = 0; i < quotient; i++) {
      result.push(0)
    }

    return result
  }

  private parseInput(value: number | string): Decimal {
    this.isError(value)

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
    let parts: string[] = []

    if (numStr.includes('e')) {
      // e 표기법 처리
      const [mantissa, exponent] = numStr.split('e')
      const exp = parseInt(exponent, 10)

      if (mantissa.includes('.')) {
        // 1.234e1 같은 형태
        const [intPart, decPart] = mantissa.split('.')
        parts = [intPart + decPart]
        // 소수점 이동: 원래 소수점 위치에서 지수만큼 이동
        e = -decPart.length + exp
      } else {
        // 1e-10 같은 형태
        parts = [mantissa]
        e = exp
      }
    } else if (numStr.includes('.')) {
      // 일반 소수점 형태 (예: 1.234)
      parts = numStr.split('.')
      e = -parts[1].length
    } else {
      // 정수 형태
      parts = [numStr]
      e = 0
    }

    numStr = parts[0] + (parts[1] || '')

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
    let x = 0
    let y = 0

    const _xd = xd
    const _yd = yd

    for (let i = 0; i < _xd.length; i++) {
      const pow = (_xd.length - 1 - i) * this.logBase
      x += _xd[i] * Math.pow(10, pow)
    }

    for (let i = 0; i < _yd.length; i++) {
      const pow = (_yd.length - 1 - i) * this.logBase
      y += _yd[i] * Math.pow(10, pow)
    }

    const result = this.parseInput(x * y)

    return result.d
  }

  private karatsubaMultiply(xd: number[], yd: number[]): number[] {
    const n = Math.max(xd.length, yd.length)

    if (n <= this.karatsubaThreshold) return this.standardMultiply(xd, yd)

    const paddedXd = [...xd]
    const paddedYd = [...yd]
    while (paddedXd.length < n) paddedXd.unshift(0)
    while (paddedYd.length < n) paddedYd.unshift(0)

    const splitPoint = Math.floor(n / 2)

    const [a, b] = this.split(paddedXd, splitPoint)
    const [c, d] = this.split(paddedYd, splitPoint)

    // m은 b의 실제 길이를 사용
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
      this.calculateAdd({ d: ac, e: 0, s: -1 }, { d: bd, e: 0, s: -1 }),
    )

    const poweredZ2 = this.adjustDigits(decimal_ac.d, e_ac)
    const poweredZ0 = this.adjustDigits(decimal_bd.d, e_bd)
    const poweredZ1 = this.adjustDigits(decimal_middle.d, e_abcd)

    const result = this.calculateAdd(
      this.calculateAdd(
        { d: poweredZ1, e: 0, s: 1 },
        { d: poweredZ0, e: 0, s: 1 },
      ),
      { d: poweredZ2, e: 0, s: 1 },
    )

    return result.d
  }

  private newtonRaphsonReciprocal(y: Decimal): Decimal {
    const r0Digit = Math.floor(10 / y.d[0]) // y.d[0]가 2라면 r0Digit은 5
    const r0Exp = -1 - y.e // y.e가 0이면 r0Exp는 -1
    let r = {
      d: [r0Digit],
      e: r0Exp,
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

  private isError(x: string | number | BroCalc): void {
    if (typeof x === 'number') {
      if (x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY) {
        throw new Error('Multiple of Infinity is not allowed')
      } else if (isNaN(x)) {
        throw new Error(`Invalid input: ${x}`)
      }
    } else if (x instanceof BroCalc) {
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
      // 빈 문자열 체크
      if (x.trim() === '') {
        throw new Error('Empty string is not allowed')
      }
      // 숫자 형식이 아닌 문자열 체크 (숫자, 소수점, 부호, e 표기법만 허용)
      if (!/^[-+]?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?$/i.test(x)) {
        throw new Error(`Invalid number format: ${x}`)
      }
      // Infinity 체크
      if (x === 'Infinity' || x === '-Infinity') {
        throw new Error('Multiple of Infinity is not allowed')
      }
      // 숫자로 변환 시 NaN 체크
      if (isNaN(Number(x))) {
        throw new Error(`Invalid input: ${x}`)
      }
    }
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

  private isGreaterOrEqual(x: Decimal, y: Decimal): boolean {
    // 부호가 다른 경우
    if (x.s !== y.s) {
      return x.s > y.s
    }

    // 지수가 다른 경우
    if (x.e !== y.e) {
      return x.s === 1 ? x.e > y.e : x.e < y.e
    }

    // 자릿수가 다른 경우
    if (x.d.length !== y.d.length) {
      return x.s === 1 ? x.d.length > y.d.length : x.d.length < y.d.length
    }

    // 각 자릿수 비교
    for (let i = 0; i < x.d.length; i++) {
      if (x.d[i] !== y.d[i]) {
        return x.s === 1 ? x.d[i] > y.d[i] : x.d[i] < y.d[i]
      }
    }

    // 모든 자릿수가 같은 경우
    return true
  }

  private setBit(number: number[], position: number): number[] {
    const result = [...number]
    const arrayIndex = Math.floor(position / this.logBase)
    const bitPosition = position % this.logBase

    // 필요한 경우 배열 확장
    while (result.length <= arrayIndex) {
      result.unshift(0)
    }

    // 해당 위치의 비트를 1로 설정
    result[result.length - 1 - arrayIndex] |= 1 << bitPosition

    return result
  }

  private isFirstBigger(first: number[], second: number[]): boolean {
    // 먼저 자릿수 비교
    if (first.length !== second.length) {
      return first.length > second.length
    }

    // 자릿수가 같으면 각 자리를 순차적으로 비교
    for (let i = 0; i < first.length; i++) {
      if (first[i] !== second[i]) {
        return first[i] > second[i]
      }
    }

    // 모든 자리가 같으면 false 반환
    return false
  }

  private createNewInstance(d: number[], e: number, s: number): BroCalc {
    const newBroCalc = Object.create(BroCalc.prototype)
    newBroCalc.d = d
    newBroCalc.e = e
    newBroCalc.s = s
    return newBroCalc
  }

  private decimalToString(decimal: Decimal): string {
    if (!decimal.d) return 'NaN'

    let str = decimal.s < 0 ? '-' : ''
    let result = ''

    // 각 배열 요소를 문자열로 변환
    for (let i = 0; i < decimal.d.length; i++) {
      let chunk = decimal.d[i].toString()

      // 첫 번째 요소가 아니면 7자리로 패딩
      if (i > 0) {
        chunk = chunk.padStart(7, '0')
      }
      result += chunk
    }

    // 지수에 따른 소수점 처리
    if (decimal.e !== 0) {
      const len = result.length

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

    console.log('str + result', str + result)

    return str + result
  }

  private subtractArrays(a: number[], b: number[]): number[] {
    const result = a.slice()
    let borrow = 0
    let aIndex = result.length - 1
    let bIndex = b.length - 1

    while (bIndex >= 0 || borrow) {
      const subtrahend = (bIndex >= 0 ? b[bIndex] : 0) + borrow

      if (result[aIndex] < subtrahend) {
        result[aIndex] += this.base
        borrow = 1
      } else {
        borrow = 0
      }

      result[aIndex] = result[aIndex] - subtrahend
      aIndex--
      bIndex--
    }

    // 선행 0 제거
    while (result[0] === 0 && result.length > 1) {
      result.shift()
    }

    return result
  }

  private compareArrays(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return a[i] > b[i] ? 1 : -1
      }
    }

    return 0
  }
}
