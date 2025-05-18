import { NumbraConstant } from '../constants/numbra'

import type { NumbraDecimal } from '../interface'

export interface SplitNumber {
  integerPart: bigint
  decimalPart: bigint
  decimalPlaces: number
}

export const eNotationToDecimal = (
  numStr: string,
): { mantissa: string; exponent: number } => {
  const [mantissa, exponent] = numStr.split('e')
  const exp = parseInt(exponent, 10)
  return { mantissa, exponent: exp }
}

export const splitSignAndMantissa = (
  str: string,
): { sign: number; mantissa: string } => {
  let sign = 1
  let mantissa = str
  if (str[0] === '-') {
    sign = -1
    mantissa = str.slice(1)
  } else if (str[0] === '+') {
    mantissa = str.slice(1)
  }
  return { sign, mantissa }
}

export const toDigitChunks = (numStr: string): number[] => {
  const digits: number[] = []
  for (let i = numStr.length; i > 0; i -= NumbraConstant.LOG_BASE) {
    const start = Math.max(0, i - NumbraConstant.LOG_BASE)
    const chunk = numStr.slice(start, i)
    digits.unshift(parseInt(chunk, 10))
  }
  return digits
}

export const normalizeOperands = (
  x: NumbraDecimal,
  y: NumbraDecimal,
): [number[], number[], number] => {
  const newE = Math.min(x.e, y.e)
  let xd = [...x.d]
  let yd = [...y.d]

  if (x.e < y.e) {
    const offsetY = y.e - newE
    yd = adjustDigits(yd, offsetY)
  } else if (y.e < x.e) {
    const offsetX = x.e - newE
    xd = adjustDigits(xd, offsetX)
  }

  return [xd, yd, newE]
}

export const adjustDigits = (d: number[], offset: number): number[] => {
  const result = [...d]
  const quotient = Math.floor(offset / NumbraConstant.LOG_BASE)
  const remainder = offset % NumbraConstant.LOG_BASE

  for (let i = 0; i < result.length; i++) {
    result[i] *= Math.pow(10, remainder)
  }

  for (let i = 0; i < result.length; i++) {
    if (result[i].toString().length > NumbraConstant.LOG_BASE) {
      const overflow_length =
        result[i].toString().length - NumbraConstant.LOG_BASE
      const overflow_str = result[i].toString().slice(0, overflow_length)

      if (i === 0 || isNaN(result[i - 1])) {
        result.unshift(parseInt(overflow_str, 10))
        i++
      } else {
        result[i - 1] += parseInt(overflow_str, 10)
      }

      result[i] = parseInt(result[i].toString().slice(overflow_length), 10)
    }
  }

  for (let i = 0; i < quotient; i++) {
    result.push(0)
  }

  return result
}

export const createNumbraInstance = (
  d: number[],
  e: number,
  s: number,
  p: number,
): NumbraDecimal => {
  return {
    d,
    e,
    s,
    p,
  }
}

export function splitToIntegerAndDecimal(
  value: NumbraDecimal,
  logBase: number,
): SplitNumber {
  const totalDigits = value.d.length * logBase
  const decimalPosition = totalDigits + value.e

  let integerStr = ''
  let decimalStr = ''
  let currentPosition = 0

  for (let i = 0; i < value.d.length; i++) {
    const num = value.d[i].toString().padStart(logBase, '0')
    for (let j = 0; j < num.length; j++) {
      if (currentPosition < decimalPosition) {
        integerStr += num[j]
      } else {
        decimalStr += num[j]
      }
      currentPosition++
    }
  }

  return {
    integerPart: BigInt(integerStr || '0'),
    decimalPart: BigInt(decimalStr || '0'),
    decimalPlaces: Math.max(0, -value.e),
  }
}

// 헬퍼 함수: d 배열을 BigInt 정수로 변환
export const convertDigitsToBigInt = (digits: number[]): bigint => {
  if (digits.length === 0) return 0n
  if (digits.length === 1) return BigInt(digits[0])

  // 문자열로 직접 변환 (거듭제곱 연산 회피)
  let numStr = digits[0].toString()
  for (let i = 1; i < digits.length; i++) {
    numStr += digits[i].toString().padStart(NumbraConstant.LOG_BASE, '0')
  }

  return BigInt(numStr)

  //   let result = 0n
  //   const baseBigInt = 10n ** BigInt(NumbraConstant.BASE)
  //   for (let i = 0; i < digits.length; i++) {
  //     result = result * baseBigInt + BigInt(digits[i])
  //   }
  //   return result
}

// 헬퍼 함수: BigInt를 base(10^7) 단위의 숫자 배열로 변환
export const bigIntToDigitArray = (num: bigint): number[] => {
  const resultArray: number[] = []
  const baseBigInt = BigInt(NumbraConstant.BASE)
  if (num === 0n) return [0]
  while (num > 0n) {
    const remainder = num % baseBigInt
    // 앞쪽(상위 자리)부터 넣기 위해 unshift
    resultArray.unshift(Number(remainder))
    num = num / baseBigInt
  }
  return resultArray
}

// 정밀도 스케일 캐시: 키는 정밀도, 값은 10^precision
const PRECISION_SCALES = new Map<number, bigint>()

// 캐시된 스케일 값 가져오기 함수
export const getPrecisionScale = (precision: number): bigint => {
  // 캐시에 있으면 사용
  if (PRECISION_SCALES.has(precision)) {
    return PRECISION_SCALES.get(precision)!
  }

  // 캐시에 없으면 계산하여 저장
  const scale = 10n ** BigInt(precision)
  PRECISION_SCALES.set(precision, scale)
  return scale
}

// 자주 사용되는 기본값 미리 계산 (초기화 시)
function initPrecisionScales(): void {
  // 일반적인 정밀도 값들 미리 계산
  for (let p = 1; p <= 50; p++) {
    if (p % 5 === 0 || p <= 15) {
      // 5의 배수와 15 이하의 모든 값
      PRECISION_SCALES.set(p, 10n ** BigInt(p))
    }
  }
}

// 초기화 함수 호출
initPrecisionScales()

export const equal = (x: NumbraDecimal, y: NumbraDecimal): boolean => {
  if (x.d.length !== y.d.length || x.e !== y.e || x.s !== y.s) {
    return false
  }
  for (let i = 0; i < x.d.length; i++) {
    if (x.d[i] !== y.d[i]) {
      return false
    }
  }
  return true
}
