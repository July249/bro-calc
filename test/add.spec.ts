import { Numbra } from '@/core/numbra'

describe('Numbra.add()', () => {
  describe('기본 연산', () => {
    it('소수점이 있는 숫자의 덧셈', () => {
      const x1 = new Numbra(12.0)
      const x2 = new Numbra(0.34)
      expect(x1.add(x2)).toMatchObject({ d: [1234], e: -2, s: 1 })
      expect(x1.add(x2).toString()).toBe('12.34')
      const x3 = new Numbra(0.0056)
      expect(x2.add(x3)).toMatchObject({ d: [3456], e: -4, s: 1 })
      expect(x2.add(x3).toString()).toBe('0.3456')
      const x4 = new Numbra(0.01)
      const x5 = new Numbra(0.99)
      expect(x4.add(x5)).toMatchObject({ d: [100], e: -2, s: 1 })
      expect(x4.add(x5).toString()).toBe('1.00')
      const x6 = new Numbra('123456.7890')
      const x7 = new Numbra('987.6543210123456789')
      expect(x6.add(x7)).toMatchObject({
        d: [1, 2444444, 3321012, 3456789],
        e: -16,
        s: 1,
      })
      expect(x6.add(x7).toString()).toBe('124444.4433210123456789')
    })

    it('서로 다른 부호의 숫자 덧셈', () => {
      const x1 = new Numbra(10000000)
      const x2 = new Numbra(-1000)
      expect(x1.add(x2)).toMatchObject({
        d: [9999000],
        e: 0,
        s: 1,
      })
      expect(x1.add(x2).toString()).toBe('9999000')
    })
  })

  describe('수학적 성질', () => {
    it('덧셈의 항등원 (0)', () => {
      const x1 = new Numbra(100000)
      const x2 = new Numbra(0)
      expect(x1.add(x2)).toMatchObject({ d: [100000], e: 0, s: 1 })
      expect(x1.add(x2).toString()).toBe('100000')
      const x3 = new Numbra(0)
      const x4 = new Numbra(100000)
      expect(x3.add(x4)).toMatchObject({ d: [100000], e: 0, s: 1 })
      expect(x3.add(x4).toString()).toBe('100000')
      const x5 = new Numbra(0)
      const x6 = new Numbra(0)
      expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
      expect(x5.add(x6).toString()).toBe('0')
    })

    it('덧셈의 역원', () => {
      const x1 = new Numbra(100000)
      const x2 = new Numbra(-100000)
      expect(x1.add(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
      expect(x1.add(x2).toString()).toBe('0')
      const x5 = new Numbra(1)
      const x6 = new Numbra(-1)
      expect(x5.add(x6)).toMatchObject({ d: [0], e: 0, s: 1 })
      expect(x5.add(x6).toString()).toBe('0')
    })
  })

  describe('특수 케이스', () => {
    it('음수와 양수의 덧셈', () => {
      const x1 = new Numbra(-1)
      const x2 = new Numbra(1)
      expect(x1.add(x2)).toMatchObject({ d: [0], e: 0, s: 1 })
      expect(x1.add(x2).toString()).toBe('0')
      const x3 = new Numbra(-1)
      const x4 = new Numbra(-1)
      expect(x3.add(x4)).toMatchObject({ d: [2], e: 0, s: -1 })
      expect(x3.add(x4).toString()).toBe('-2')
    })
  })

  describe('경계값 테스트', () => {
    it('Number.MAX_SAFE_INTEGER를 초과하는 큰 수의 덧셈', () => {
      const x1 = new Numbra(Number.MAX_SAFE_INTEGER) // 9_007_199_254_740_991
      const x2 = new Numbra(1000000000000000)
      expect(x1.add(x2)).toMatchObject({
        d: [100, 719925, 4740991],
        e: 0,
        s: 1,
      })
      expect(x1.add(x2).toString()).toBe('10007199254740991')
      const x3 = new Numbra('14400000000000000')
      const x4 = new Numbra('100000010000000')
      expect(x3.add(x4)).toMatchObject({ d: [145, 1, 0], e: 0, s: 1 })
      expect(x3.add(x4).toString()).toBe('14500000010000000')
    })

    it('매우 큰 수의 덧셈', () => {
      const x1 = new Numbra(102734461911601)
      const x2 = new Numbra(-80756122400245)
      expect(x1.add(x2)).toMatchObject({
        d: [2197833, 9511356],
        e: 0,
        s: 1,
      })
      expect(x1.add(x2).toString()).toBe('21978339511356')
    })
  })
})
