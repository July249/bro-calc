export interface NumbraDecimal {
  readonly d: number[] // base-10^7 chunks
  readonly e: number // exponent
  readonly s: number // sign (1 or -1)
  readonly p?: number // 소수점 정밀도 (기본값 10), 소수점 몇 째자리까지 표시할지 결정
}
