# BroCalc

BroCalc는 JavaScript/TypeScript에서 고정밀도 십진 연산을 위한 라이브러리입니다.

## 특징

- 💪 Number.MAX_SAFE_INTEGER (2^53 - 1) 이상의 큰 수도 정확하게 계산
- 🎯 부동소수점 오차 없는 정확한 십진 연산
- 🔒 불변성(Immutable) 보장으로 안전한 연산
- 🚀 최적화된 내부 알고리즘으로 빠른 연산 속도
- 📝 TypeScript로 작성되어 타입 안정성 보장
- 💡 직관적이고 간단한 API

## 설치

```bash
npm install brocalc
```

## 사용법

```typescript
import { BroCalc } from 'brocalc'

// 기본 사용법
const num1 = new BroCalc('12345.6789')
const num2 = new BroCalc(9876.5432)

// 덧셈
const sum = num1.add(num2)
console.log(sum.toString()) // '22222.2221'

// 뺄셈
const diff = num1.sub(num2)
console.log(diff.toString()) // '2469.1357'

// 곱셈
const prod = num1.mul(num2)
console.log(prod.toString()) // '121938.678480848'
```

## 큰 수 연산 예시

```typescript
// JavaScript Number 타입의 한계를 넘어서는 연산도 정확하게 처리
const bigNum1 = new BroCalc('1234567890123456789012345678')
const bigNum2 = new BroCalc('0.0000000000000000000000000001')

const result = bigNum1.mul(bigNum2)
console.log(result.toString()) // '0.1234567890123456789012345678'
```

## 특수한 경우 처리

```typescript
// 잘못된 입력값
try {
  new BroCalc('invalid')
} catch (e) {
  console.log(e.message) // 'Invalid number format: invalid'
}

// 빈 문자열
try {
  new BroCalc('')
} catch (e) {
  console.log(e.message) // 'Empty string is not allowed'
}
```

## API 문서

### 생성자

```typescript
new BroCalc(value: number | string | BroCalc)
```

### 메서드

- `add(value: number | string | BroCalc)`: 덧셈
- `sub(value: number | string | BroCalc)`: 뺄셈
- `mul(value: number | string | BroCalc)`: 곱셈
- `toString()`: 문자열로 변환
- `toJSON()`: JSON 문자열로 변환

## 왜 BroCalc인가?

1. **정확성**: JavaScript의 Number 타입이 가지는 부동소수점 오차 문제를 완벽하게 해결합니다.
2. **큰 수 처리**: Number.MAX_SAFE_INTEGER (2^53 - 1)를 넘어서는 큰 수도 정확하게 처리합니다.
3. **불변성**: 모든 연산이 새로운 인스턴스를 반환하여 예측 가능한 동작을 보장합니다.
4. **타입 안정성**: TypeScript로 작성되어 컴파일 시점에 타입 오류를 잡을 수 있습니다.
5. **최적화**: 내부적으로 최적화된 알고리즘을 사용하여 빠른 연산 속도를 제공합니다.

## 라이선스

MIT License (Made by [Broccoli](https://github.com/July249))

## 기여하기

이슈와 풀 리퀘스트는 언제나 환영합니다!
