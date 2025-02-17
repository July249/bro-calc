/**
 * 십진수 계산을 위한 기본 인터페이스
 */
interface Decimal {
  readonly d: number[] // 숫자를 담는 배열(끝에서부터 7자리씩 끊어서 저장)
  readonly e: number // 지수
  readonly s: number // 부호 (1 또는 -1)
  readonly p?: number // 소수점 정밀도 (기본값 10), 소수점 몇 째자리까지 표시할지 결정
}

/**
 * 고정밀도 십진 연산을 위한 클래스
 */
export class BroCalc implements Decimal {
  // ================================ Properties ================================
  readonly d: number[]
  readonly e: number
  readonly s: number

  private readonly base: number
  private readonly logBase: number
  private readonly karatsubaThreshold: number
  private readonly precision: number

  // ================================ Constructor ================================
  constructor(value: number | string | BroCalc = 0, precision?: number) {
    if (!(this instanceof BroCalc)) {
      throw new Error('BroCalc must be called with the new operator')
    }

    this.base = 1e7
    this.logBase = 7
    this.karatsubaThreshold = 2
    this.precision = precision || 10

    if (value instanceof BroCalc) {
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
   * @returns 덧셈 결과 (BroCalc 인스턴스)
   */
  add(value: BroCalcValue): BroCalc {
    const o = this.isBroCalc(value) ? value : this.parseInput(value)
    let result: Decimal = {
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
   * @returns 뺄셈 결과 (BroCalc 인스턴스)
   */
  sub(value: BroCalcValue): BroCalc {
    const o = this.isBroCalc(value) ? value : this.parseInput(value)
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

    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 곱셈 연산
   * @param value 곱할 값
   * @returns 곱셈 결과 (BroCalc 인스턴스)
   */
  mul(value: number | string | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateMul(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 나눗셈 연산
   * @param value 나눌 값
   * @returns 나눗셈 결과 (BroCalc 인스턴스)
   */
  div(value: number | string | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculateDiv(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * 거듭제곱 연산
   * @param value 거듭제곱할 값
   * @returns 거듭제곱 결과 (BroCalc 인스턴스)
   */
  pow(value: number | string | BroCalc): BroCalc {
    const o = value instanceof BroCalc ? value : this.parseInput(value)
    const result = this.calculatePow(this, o)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  /**
   * n 제곱근 연산
   * @param degree 제곱근 함수의 지수 (기본값 2)
   * @returns 제곱근 결과 (BroCalc 인스턴스)
   */
  sqrt(degree: number = 2): BroCalc {
    const result = this.calculateNthRoot(this, degree)
    return this.createNewInstance(result.d, result.e, result.s)
  }

  // ================================ Return Methods ================================

  static from(value: BroCalcValue): BroCalc {
    return new BroCalc(value)
  }

  /**
   * 십진수를 문자열로 변환
   * @returns 문자열
   */
  toString(): string {
    return this.decimalToString(this)
  }

  /**
   * Decimal 인스턴스를 JSON 문자열로 변환
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
        'BroCalc cannot be converted to a number to prevent floating point issues',
      )
    }
    return this.toString()
  }

  // ================================ Calculation Logic ================================

  /**
   * 덧셈 연산
   * @param x 더할 값
   * @param y 더할 값
   * @returns 덧셈 결과 (Decimal 인터페이스)
   */
  private calculateAdd(x: Decimal, y: Decimal): Decimal {
    // 유효하지 않은 입력 체크
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    // 덧셈 항등원(0) 체크
    if (this.isZero(y)) return x
    if (this.isZero(x)) return y

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

      const sum = xs * (xd[i] || 0) + ys * (yd[i] || 0) + carry

      result.unshift(Math.abs(sum) % this.base)

      const absSum = Math.abs(sum)

      // carry의 부호를 유지하면서 계산
      if (sum < 0) {
        carry = -Math.floor(absSum / this.base)
      } else {
        carry = Math.floor(absSum / this.base)
      }
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

  /**
   * 뺄셈 연산
   * @param x 뺄 값
   * @param y 뺄 값
   * @returns 뺄셈 결과 (Decimal 인터페이스)
   */
  private calculateSub(x: Decimal, y: Decimal): Decimal {
    // 유효하지 않은 입력 체크
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
    let borrow = 0 // 빌림

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
      // 빌림 처리
      let diff = xd[i] - yd[i] - borrow

      if (diff < 0) {
        diff += 10000000
        borrow = 1
      } else {
        borrow = 0
      }

      result.unshift(diff)
    }

    // 선행 0 제거
    while (result[0] === 0 && result.length > 1) {
      result.shift()
    }

    return {
      d: result,
      e: newE,
      s: resultSign,
    }
  }

  /**
   * 곱셈 연산
   * @param x 곱할 값
   * @param y 곱할 값
   * @returns 곱셈 결과 (Decimal 인터페이스)
   */
  private calculateMul(x: Decimal, y: Decimal): Decimal {
    // 유효하지 않은 입력 체크
    if (!x.d || !y.d) {
      throw new Error('Invalid input')
    }

    // 곱셈 항등원(1) 체크
    if (this.isOne(y)) return x
    if (this.isOne(x)) return y

    // 0과의 곱셈 최적화
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
   * @param x 피제수 (Decimal)
   * @param y 제수 (Decimal)
   * @returns 나눗셈 결과 (Decimal)
   */
  private calculateDiv(x: Decimal, y: Decimal): Decimal {
    // 0 체크
    if (!y.d || this.isZero(y))
      throw new Error('Division by zero is not allowed')
    if (!x.d || this.isZero(x)) return { d: [0], e: 0, s: 1 }

    // 분모가 1인 경우
    if (this.isOne(y)) return x

    // 결과 부호: 피제수와 제수의 부호 곱
    const resultSign = x.s * y.s

    // 원하는 유효 자릿수 (precision)
    // (예를 들어, 기본값이 10이면 10자리 정밀도, 테스트 예제에서 유효숫자 40이 필요하면 precision을 40으로 설정)
    const precision = this.precision

    // 인스턴스에 설정된 base와 logBase (base = 10^7, logBase = 7)
    const logBase = this.logBase
    const base = this.base

    // ---------------------------
    // 헬퍼 함수: d 배열을 BigInt 정수로 변환
    const convertDigitsToBigInt = (digits: number[]): bigint => {
      let result = 0n
      const baseBigInt = 10n ** BigInt(logBase)
      for (let i = 0; i < digits.length; i++) {
        result = result * baseBigInt + BigInt(digits[i])
      }
      return result
    }

    // 헬퍼 함수: BigInt를 base(10^7) 단위의 숫자 배열로 변환
    const bigIntToDigitArray = (num: bigint): number[] => {
      const resultArray: number[] = []
      const baseBigInt = BigInt(base)
      if (num === 0n) return [0]
      while (num > 0n) {
        const remainder = num % baseBigInt
        // 앞쪽(상위 자리)부터 넣기 위해 unshift
        resultArray.unshift(Number(remainder))
        num = num / baseBigInt
      }
      return resultArray
    }
    // ---------------------------

    // 1. d 배열을 BigInt 정수로 복원
    const I_x = convertDigitsToBigInt(x.d)
    const I_y = convertDigitsToBigInt(y.d)

    // 2. 지수 차이: 실제 값은 I_x×10^(x.e)와 I_y×10^(y.e)를 곱한 값이므로,
    //    나눗셈은 (I_x / I_y) × 10^(x.e - y.e)
    const expDiff = x.e - y.e

    // 3. 스케일링: 원하는 소수점 이하 자릿수(precision)를 확보하기 위해 분자에 10^(precision)을 곱함.
    //    (즉, 내부적으로 정수 나눗셈을 수행할 때 소수점 이하 정밀도를 확보)
    const scaledNumerator = I_x * 10n ** BigInt(precision)

    // 4. BigInt 정수 나눗셈: BigInt의 '/' 연산자는 정수 몫만 반환합니다.
    let Q = scaledNumerator / I_y

    // 5. 예비 결과 지수: 스케일링했으므로, 최종 결과는 Q × 10^(expDiff - precision)
    let resultExponent = expDiff - precision

    // 6. 정규화: Q에 10의 인수가 남아 있다면 (즉, trailing zero가 있다면) 제거하고, 그만큼 결과 지수를 보정합니다.
    while (Q % 10n === 0n && Q !== 0n) {
      Q = Q / 10n
      resultExponent += 1
    }

    // 7. BigInt Q를 d 배열 (base 10^7 단위)로 분할
    let resultDigits = bigIntToDigitArray(Q)

    // (옵션) 선행 0 제거: 여러 자릿수를 갖는 경우 앞의 불필요한 0을 제거합니다.
    while (resultDigits.length > 1 && resultDigits[0] === 0) {
      resultDigits.shift()
    }

    // 8. 최종 결과 반환
    return {
      d: resultDigits,
      e: resultExponent,
      s: resultSign,
    }
  }

  /**
   * 정수 지수의 거듭제곱을 BigInt 기반 반복 제곱법으로 계산하는 메서드
   * 음의 지수인 경우, 1/(x^|n|)로 계산합니다.
   * @param x 밑 (BroCalc 또는 Decimal)
   * @param exp 거듭제곱할 지수 (number | string | BroCalc)
   * @returns 거듭제곱 결과 (Decimal 인스턴스)
   */
  private calculatePow(x: Decimal, exp: number | string | Decimal): Decimal {
    // exp를 정수로 변환
    let exponent: number

    if (typeof exp === 'number') {
      exponent = exp
    } else if (typeof exp === 'string') {
      exponent = parseInt(exp, 10)
    } else {
      // exp가 BroCalc 또는 Decimal인 경우,
      if (exp.e !== 0 || exp.d.length !== 1) {
        throw new Error(
          'Non-integer exponent is not supported in this implementation.',
        )
      }
      exponent = exp.d[0] * exp.s
    }

    // 음의 지수 처리: x^(-n) = 1 / (x^n)
    if (exponent < 0) {
      // 먼저 양의 지수에 대해 거듭제곱을 계산
      const positivePow = this.calculatePow(x, -exponent)
      // 1을 고정소수점 표현으로 나타낸 값 (즉, 1 = { d: [1], e: 0, s: 1 })
      const one: Decimal = { d: [1], e: 0, s: 1 }
      // calculateDiv를 사용해 1 / (x^n)를 계산합니다.
      return this.calculateDiv(one, positivePow)
    }

    // 여기부터는 exponent가 0 이상인 경우 (양의 정수 지수)
    // 헬퍼: d 배열을 BigInt로 변환하는 함수
    const convertDigitsToBigInt = (digits: number[]): bigint => {
      let result = 0n
      const baseBigInt = 10n ** BigInt(this.logBase)
      for (let i = 0; i < digits.length; i++) {
        result = result * baseBigInt + BigInt(digits[i])
      }
      return result
    }

    // 헬퍼: BigInt를 d 배열 (base 10^7 단위)로 변환하는 함수
    const bigIntToDigitArray = (num: bigint): number[] => {
      const resultArray: number[] = []
      const baseBigInt = BigInt(this.base)
      if (num === 0n) return [0]
      while (num > 0n) {
        const remainder = num % baseBigInt
        resultArray.unshift(Number(remainder))
        num = num / baseBigInt
      }
      return resultArray
    }

    // 1. 밑 x의 d 배열을 BigInt 정수 I_x로 복원
    const I_x = convertDigitsToBigInt(x.d)

    // 2. 반복 제곱법을 이용하여 I_x^exponent 계산
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

    // 3. 최종 지수 계산: x의 값은 I_x * 10^(x.e)이므로,
    //    x^n = I_x^n * 10^(n * x.e)
    const resultExponent = exponent * x.e

    // 4. 결과 부호: x.s^n (n이 짝수면 양수, 홀수이면 원래 부호)
    const resultSign = exponent % 2 === 0 ? 1 : x.s

    // 5. BigInt 결과를 d 배열로 변환
    const resultDigits = bigIntToDigitArray(resultBigInt)

    // 6. 최종 결과 반환
    return { d: resultDigits, e: resultExponent, s: resultSign }
  }

  /**
   * 일반 n제곱근 (nth root)을 계산하는 메서드
   * (예: n=2이면 제곱근, n=3이면 세제곱근 등)
   * 음수 또는 0인 degree는 지원하지 않습니다.
   * @param x n제곱근을 구할 값 (Decimal)
   * @param degree 제곱근의 차수 (n), 양의 정수만 지원
   * @returns n제곱근 결과 (Decimal)
   */
  private calculateNthRoot(x: Decimal, degree: number): Decimal {
    // degree가 양의 정수가 아니면 에러 처리
    if (degree <= 0) {
      throw new Error('Only positive root degrees are supported.')
    }

    // 음수에 대해서: 만약 degree가 짝수이면 허용하지 않고, 홀수이면 절대값으로 계산한 후 결과 부호를 -1로 설정
    if (x.s < 0) {
      if (degree % 2 === 0) {
        throw new Error('Even root of negative number is not supported.')
      }
      // 음수이면 절대값으로 계산하고, 최종 부호는 -1로 설정
      x = { d: x.d, e: x.e, s: -1 }
    }
    // x가 0이면 결과도 0
    if (this.isZero(x)) {
      return { d: [0], e: 0, s: 1 }
    }

    // 원하는 소수점 이하 정밀도 (this.precision, 예: 10자리)
    const p = this.precision

    // 스케일링:
    // n제곱근을 구하기 위해 최소한 10^(n*p)의 정밀도가 필요하므로,
    // totalScale = x.e + n*p + extra, 여기서 extra는 x.e + n*p가 음수일 경우 이를 보정하고,
    // 또한 extra는 degree의 배수가 되도록 조정합니다.
    let extra = 0
    if (x.e + degree * p < 0) {
      extra = -(x.e + degree * p)
    }
    if (extra % degree !== 0) {
      extra += degree - (extra % degree)
    }
    const totalScale = x.e + degree * p + extra // 이제 totalScale ≥ 0, degree의 배수

    // 헬퍼: d 배열을 BigInt 정수로 복원
    const convertDigitsToBigInt = (digits: number[]): bigint => {
      let result = 0n
      const baseBigInt = 10n ** BigInt(this.logBase)
      for (let i = 0; i < digits.length; i++) {
        result = result * baseBigInt + BigInt(digits[i])
      }
      return result
    }

    // 헬퍼: BigInt를 d 배열 (base 10^7 단위)로 변환
    const bigIntToDigitArray = (num: bigint): number[] => {
      const resultArray: number[] = []
      const baseBigInt = BigInt(this.base)
      if (num === 0n) return [0]
      while (num > 0n) {
        const remainder = num % baseBigInt
        resultArray.unshift(Number(remainder))
        num = num / baseBigInt
      }
      return resultArray
    }

    // 1. x의 d 배열을 BigInt 정수 I로 복원
    const I = convertDigitsToBigInt(x.d)
    // 2. 스케일링: N = I * 10^(totalScale)
    const N = I * 10n ** BigInt(totalScale)

    // 3. n제곱근을 구하는 함수 (Newton–Raphson 반복)
    const integerNthRoot = (num: bigint, n: number): bigint => {
      if (num < 0n) {
        throw new Error('Cannot compute root of negative number')
      }
      if (num < 2n) return num
      // 초기 추정: 10^(자릿수/n)
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
        // 반복 종료 조건: 변화가 매우 작으면 종료 (여기서는 차이가 1 이하이면 종료)
        if (r > r_next ? r - r_next <= 1n : r_next - r <= 1n) {
          r = r_next
          break
        }
        r = r_next
      }
      return r
    }

    // 4. N의 n제곱근 정수 근사 R를 구함
    const R = integerNthRoot(N, degree)

    // 5. 스케일 보정:
    //    최종 값은 R / 10^(p + extra/degree)로 보정되어야 하며,
    //    따라서 최종 고정소수점 지수는 totalScale/degree - (p + extra/degree)
    const divisor = 10n ** BigInt(p + extra / degree)
    const finalBigInt = R / divisor
    const resultExponent = totalScale / degree - (p + extra / degree)

    // 6. 결과 부호: x가 음수이고 degree가 홀수이면 -1, 아니면 1.
    const resultSign = x.s // 여기서 x.s가 이미 절대값으로 처리되어 있고, 부호는 그대로 적용

    // 7. BigInt 결과를 d 배열로 변환하여 최종 Decimal 반환
    const resultDigits = bigIntToDigitArray(finalBigInt)

    return { d: resultDigits, e: resultExponent, s: resultSign }
  }

  // ================================ Utility ================================

  private normalizeDigits(digits: number[], offset: number): number[] {
    return offset === 0 ? [...digits] : this.adjustDigits([...digits], offset)
  }

  /**
   * 부호 반전
   * @param value 부호 반전할 값
   * @returns 부호 반전된 값 (Decimal 인터페이스)
   */
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

  /**
   * 입력값을 Decimal 인터페이스로 변환
   * @param value 변환할 값
   * @returns Decimal 인터페이스
   */
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

  /**
   * 카라추바 곱셈 연산
   * @param xd 곱할 값
   * @param yd 곱할 값
   * @returns 곱셈 결과 (number[])
   */
  private karatsubaMultiply(xd: number[], yd: number[]): number[] {
    const n = Math.max(xd.length, yd.length)

    if (n < this.karatsubaThreshold) return this.standardMultiply(xd, yd)

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
      this.calculateAdd({ d: ac, e: 0, s: 1 }, { d: bd, e: 0, s: 1 }),
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
  private isZero(x: BroCalc | Decimal): boolean {
    const d = this.toDecimal(x)
    return d.d.every((digit) => digit === 0)
  }

  /**
   * 1인지 확인하는 함수
   * @param x 확인할 값
   * @returns 1인지 여부 (boolean)
   */
  private isOne(x: BroCalc | Decimal): boolean {
    const d = this.toDecimal(x)
    return d.d.length === 1 && d.d[0] === 1 && d.e === 0 && d.s === 1
  }

  /**
   * 에러 체크
   * @param x 체크할 값
   */
  private isError(x: BroCalcValue): void {
    if (typeof x === 'number') {
      if (x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY) {
        // Infinity 체크
        throw new Error('Multiple of Infinity is not allowed')
      } else if (isNaN(x)) {
        // NaN 체크
        throw new Error(`Invalid input: ${x}`)
      }
    } else if (x instanceof BroCalc) {
      // 배열 요소 체크
      for (let i = 0; i < x.d.length; i++) {
        if (
          x.d[i] === Number.POSITIVE_INFINITY ||
          x.d[i] === Number.NEGATIVE_INFINITY
        ) {
          // Infinity 체크
          throw new Error('Multiple of Infinity is not allowed')
        } else if (isNaN(x.d[i])) {
          // NaN 체크
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

  /**
   * 덧셈 역원 체크
   * @param x 체크할 값
   * @param y 체크할 값
   * @returns 덧셈 역원 여부 (boolean)
   */
  private isAdditiveInverse(
    x: BroCalc | Decimal,
    y: BroCalc | Decimal,
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
   * BroCalc 인스턴스의 Decimal 값을 반환하는 헬퍼 메서드
   * @returns Decimal 값
   */
  private getDecimal(): Decimal {
    return {
      d: this.d,
      e: this.e,
      s: this.s,
    }
  }

  /**
   * 첫 번째 배열이 두 번째 배열보다 큰지 확인
   * @param first 첫 번째 배열
   * @param second 두 번째 배열
   * @returns 첫 번째 배열이 두 번째 배열보다 큰지 여부 (boolean)
   */
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

  /**
   * 새로운 BroCalc 인스턴스 생성
   * @param d 배열
   * @param e 지수
   * @param s 부호
   * @returns 생성된 BroCalc 인스턴스
   */
  private createNewInstance(d: number[], e: number, s: number): BroCalc {
    const newBroCalc = Object.create(BroCalc.prototype)
    newBroCalc.d = d
    newBroCalc.e = e
    newBroCalc.s = s
    return newBroCalc
  }

  /**
   * Decimal 값을 문자열로 변환
   * @param decimal 변환할 값
   * @returns 문자열
   */
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
    return str + result
  }

  private toDecimal(value: BroCalc | Decimal): Decimal {
    return this.isBroCalc(value) ? value.getDecimal() : value
  }

  private isBroCalc(value: any): value is BroCalc {
    return value instanceof BroCalc
  }
}

type BroCalcValue = number | string | BroCalc
