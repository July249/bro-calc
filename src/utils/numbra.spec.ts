import { adjustDigits } from './numbra'

describe('adjustDigits', () => {
  it('should handle zero offset', () => {
    const input = [123, 456]
    const result = adjustDigits(input, 0)
    expect(result).toEqual([123, 456])
  })

  it('should handle positive offset less than logBase', () => {
    const input = [123, 456]
    const result = adjustDigits(input, 3)
    expect(result).toEqual([123, 456000])
  })

  it('should handle positive offset greater than logBase', () => {
    const input = [123, 456]
    const result = adjustDigits(input, 10)
    expect(result).toEqual([123, 456, 0])
  })

  it('should handle overflow in digits', () => {
    const input = [123, 9999999]
    const result = adjustDigits(input, 1)
    expect(result).toEqual([124, 9999990])
  })

  it('should handle multiple overflows', () => {
    const input = [9999999, 9999999]
    const result = adjustDigits(input, 1)
    expect(result).toEqual([10000000, 9999990])
  })

  it('should handle large offsets', () => {
    const input = [1]
    const result = adjustDigits(input, 23)
    expect(result).toEqual([100, 0, 0, 0])
  })
})
