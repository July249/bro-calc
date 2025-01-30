import { describe, it, expect } from 'vitest'
import { BroCalc } from '@/core/index.js'

describe('Get Decimal Interface', () => {
  it('it should be the Decimal interface', () => {
    const x = new BroCalc(12345.67)

    // 내부 속성들만 테스트
    expect(x).toMatchObject({
      d: [1234567],
      e: -2,
      s: 1,
    })

    // 또는 getter를 사용하여 값을 테스트
    expect(x.toString()).toBe('12345.67')
  })
})
