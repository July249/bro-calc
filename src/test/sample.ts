// 테스트 헬퍼 함수
function assertDecimal(actual, expected, message) {
    const actualStr = toString(actual);
    if (actualStr !== expected) {
        throw new Error(`${message}: expected ${expected}, but got ${actualStr}`);
    }
    console.log(`✓ ${message}: ${actualStr}`);
}

// 1. 덧셈 테스트
console.log("\n=== 덧셈 테스트 ===");

// 1.1 일반적인 덧셈
assertDecimal(
    add({d: [1234567], e: -2, s: 1}, {d: [890123], e: -1, s: 1}),
    "12345.67 + 8901.23 = 21246.90",
    "일반 덧셈"
);

// 1.2 서로 다른 지수
assertDecimal(
    add({d: [1234567, 8901234], e: -7, s: 1}, {d: [9876543], e: 0, s: 1}),
    "1.23456789012340 + 9876543 = 9876544.23456789",
    "다른 지수 덧셈"
);

// 1.3 매우 큰 수와 작은 수
assertDecimal(
    add({d: [9999999, 9999999], e: 10, s: 1}, {d: [1], e: -10, s: 1}),
    "999999999999900000000 + 0.0000000001 = 999999999999900000000.0000000001",
    "큰 수와 작은 수 덧셈"
);

// 2. 뺄셈 테스트
console.log("\n=== 뺄셈 테스트 ===");

// 2.1 일반적인 뺄셈
assertDecimal(
    subtract({d: [1234567], e: -2, s: 1}, {d: [890123], e: -1, s: 1}),
    "12345.67 - 8901.23 = 3444.44",
    "일반 뺄셈"
);

// 2.2 음수 결과
assertDecimal(
    subtract({d: [1], e: 0, s: 1}, {d: [2], e: 0, s: 1}),
    "1 - 2 = -1",
    "음수 결과 뺄셈"
);

// 3. 곱셈 테스트
console.log("\n=== 곱셈 테스트 ===");

// 3.1 일반적인 곱셈
assertDecimal(
    multiply({d: [1234567], e: -2, s: 1}, {d: [890123], e: -1, s: 1}),
    "12345.67 × 8901.23 = 109893633.8441",
    "일반 곱셈"
);

// 3.2 Karatsuba 임계값 이상
const bigNum1 = {d: Array(20).fill(9999999), e: 0, s: 1};
const bigNum2 = {d: Array(20).fill(9999999), e: 0, s: 1};
assertDecimal(
    multiply(bigNum1, bigNum2),
    "큰 수 곱셈 결과",
    "Karatsuba 곱셈"
);

// 3.3 부호 테스트
assertDecimal(
    multiply({d: [1234567], e: -2, s: -1}, {d: [890123], e: -1, s: -1}),
    "-12345.67 × -8901.23 = 109893633.8441",
    "음수 곱셈"
);

// 4. 나눗셈 테스트
console.log("\n=== 나눗셈 테스트 ===");

// 4.1 일반적인 나눗셈
assertDecimal(
    divide({d: [1234567], e: -2, s: 1}, {d: [890123], e: -1, s: 1}),
    "12345.67 ÷ 8901.23 = 1.38695",
    "일반 나눗셈"
);

// 4.2 정밀도 테스트
assertDecimal(
    divide({d: [1], e: 0, s: 1}, {d: [3], e: 0, s: 1}),
    "1 ÷ 3 = 0.3333333333333333",
    "순환소수 나눗셈"
);

// 4.3 예외 케이스
try {
    divide({d: [1], e: 0, s: 1}, {d: [0], e: 0, s: 1});
    console.log("❌ 0으로 나누기 예외 처리 실패");
} catch (e) {
    console.log("✓ 0으로 나누기 예외 처리 성공");
}

// 5. 복합 연산 테스트
console.log("\n=== 복합 연산 테스트 ===");

// 5.1 덧셈 + 곱셈
const complex1 = multiply(
    add({d: [1234567], e: -2, s: 1}, {d: [890123], e: -1, s: 1}),
    {d: [2], e: 0, s: 1}
);
assertDecimal(
    complex1,
    "(12345.67 + 8901.23) × 2 = 42493.80",
    "덧셈 후 곱셈"
);

// 5.2 나눗셈 + 뺄셈
const complex2 = subtract(
    divide({d: [1000000], e: 0, s: 1}, {d: [2], e: 0, s: 1}),
    {d: [1], e: 0, s: 1}
);
assertDecimal(
    complex2,
    "1000000 ÷ 2 - 1 = 499999",
    "나눗셈 후 뺄셈"
);

// 6. 특수 케이스 테스트
console.log("\n=== 특수 케이스 테스트 ===");

// 6.1 0과의 연산
assertDecimal(
    add({d: [0], e: 0, s: 1}, {d: [1234567], e: -2, s: 1}),
    "0 + 12345.67 = 12345.67",
    "0과의 덧셈"
);

// 6.2 매우 작은 수의 정밀도
assertDecimal(
    multiply({d: [1], e: -20, s: 1}, {d: [1], e: -20, s: 1}),
    "1e-20 × 1e-20 = 1e-40",
    "매우 작은 수 곱셈"
);

// 6.3 지수 범위 한계 테스트
try {
    multiply({d: [1], e: EXP_LIMIT - 1, s: 1}, {d: [10], e: 0, s: 1});
    console.log("❌ 지수 범위 초과 예외 처리 실패");
} catch (e) {
    console.log("✓ 지수 범위 초과 예외 처리 성공");
}