// const BASE = 1e7;    // 10^7
// const LOG_BASE = 7;  // log10(BASE)
// const KARATSUBA_THRESHOLD = 30;  // 카라추바 알고리즘 사용 임계값
// const MAX_DIGITS = 1e9;          // 최대 정밀도
// const EXP_LIMIT = 9e15;          // 최대 지수

// function add(x, y) {
//     if (!x.d || !y.d) {
//         throw new Error('Invalid input');
//     }

//     // 더 작은 지수를 기준으로 통일
//     const newE = Math.min(x.e, y.e);

//     let result = [];
//     let carry = 0;

//     // 배열 길이 맞추기 (앞쪽에 0 패딩)
//     const xd = [...x.d];
//     const yd = [...y.d];

//     if (x.e < y.e) {
//         // y의 자릿수 조정
//         const offsetY = y.e - newE;
//         for (let i = 0; i < offsetY; i++) {
//             yd.push(0);  // 뒤쪽에 0 추가
//         }
//     } else {
//         // x의 자릿수 조정
//         const offsetX = x.e - newE;
//         for (let i = 0; i < offsetX; i++) {
//             xd.push(0);  // 뒤쪽에 0 추가
//         }
//     }

//     // 더 긴 배열 기준으로 덧셈
//     const maxLength = Math.max(xd.length, yd.length);

//     // 뒷자리부터 계산
//     for (let i = maxLength - 1; i >= 0; i--) {
//         const sum = (xd[i] || 0) + (yd[i] || 0) + carry;
//         result.unshift(sum % BASE);  // 현재 자리 값
//         carry = Math.floor(sum / BASE);  // 올림수
//     }

//     // 마지막 올림수 처리
//     if (carry > 0) {
//         result.unshift(carry);
//     }

//     // 후처리: 뒤쪽 불필요한 0 제거
//     while (result[result.length - 1] === 0 && result.length > 1) {
//         result.pop();
//     }

//     return {
//         d: result,
//         e: newE,
//         s: 1
//     };
// }

// function subtract(x, y) {
//     // 뺄셈은 부호를 바꾼 덧셈으로 처리
//     const negY = {
//         d: y.d,
//         e: y.e,
//         s: -y.s
//     };

//     return add(x, negY);
// }

// function multiply(x, y) {
//     if (!x.d || !y.d) throw new Error('Invalid input');

//     // 결과 부호 결정
//     const sign = x.s * y.s;

//     // 결과 지수 계산
//     const resultE = x.e + y.e;

//     // 배열 길이에 따라 알고리즘 선택
//     let digits;
//     if (x.d.length + y.d.length < KARATSUBA_THRESHOLD) {
//         digits = standardMultiply(x.d, y.d);
//     } else {
//         digits = karatsubaMultiply(x.d, y.d);
//     }

//     // 정규화 및 올림수 처리
//     let carry = 0;
//     for (let i = digits.length - 1; i >= 0; i--) {
//         const temp = digits[i] + carry;
//         digits[i] = temp % BASE;
//         carry = Math.floor(temp / BASE);
//     }
//     if (carry > 0) digits.unshift(carry);

//     return {
//         d: digits,
//         e: resultE,
//         s: sign
//     };
// }

// function standardMultiply(xd, yd) {
//     const result = new Array(xd.length + yd.length).fill(0);

//     // 기본 곱셈
//     for (let i = xd.length - 1; i >= 0; i--) {
//         for (let j = yd.length - 1; j >= 0; j--) {
//             const product = xd[i] * yd[j];
//             const pos = i + j;
//             result[pos] += product;
//         }
//     }

//     return result;
// }

// function karatsubaMultiply(xd, yd) {
//     const n = Math.max(xd.length, yd.length);
//     if (n <= KARATSUBA_THRESHOLD) return standardMultiply(xd, yd);

//     // 배열 길이 맞추기
//     while (xd.length < n) xd.push(0);
//     while (yd.length < n) yd.push(0);

//     const m = Math.floor(n / 2);

//     // 분할
//     const [a, b] = split(xd, m);
//     const [c, d] = split(yd, m);

//     // 재귀적 계산
//     const ac = karatsubaMultiply(a, c);
//     const bd = karatsubaMultiply(b, d);
//     const abcd = karatsubaMultiply(
//         add({d: a, e: 0, s: 1}, {d: b, e: 0, s: 1}).d,
//         add({d: c, e: 0, s: 1}, {d: d, e: 0, s: 1}).d
//     );

//     // 결과 조합
//     return combine(ac, bd, abcd, m);
// }

// function divide(x, y) {
//     if (!y.d || isZero(y)) throw new Error('Division by zero');
//     if (!x.d) throw new Error('Invalid dividend');

//     // Newton-Raphson 방법으로 1/y 근사값 계산
//     const reciprocal = newtonRaphsonReciprocal(y);

//     // x * (1/y) 계산
//     const result = multiply(x, reciprocal);

//     // 정밀도 조정
//     return roundToPrecision(result, getPrecision(x, y));
// }

// function newtonRaphsonReciprocal(y) {
//     // 초기 추정값
//     let r = {
//         d: [1],
//         e: -estimateExponent(y),
//         s: y.s
//     };

//     // Newton-Raphson 반복
//     // r = r * (2 - y * r)
//     for (let i = 0; i < getPrecision(y, y); i++) {
//         const yr = multiply(y, r);
//         const two_minus_yr = subtract(
//             {d: [2], e: 0, s: 1},
//             yr
//         );
//         r = multiply(r, two_minus_yr);
//     }

//     return r;
// }

// // 헬퍼 함수들
// function split(arr, m) {
//     return [
//         arr.slice(0, m),
//         arr.slice(m)
//     ];
// }

// function combine(ac, bd, abcd, m) {
//     // abcd - ac - bd
//     const middle = subtract(
//         subtract(
//             {d: abcd, e: 0, s: 1},
//             {d: ac, e: 0, s: 1}
//         ),
//         {d: bd, e: 0, s: 1}
//     ).d;

//     // ac * BASE^(2m) + middle * BASE^m + bd
//     const result = new Array(ac.length + 2 * m).fill(0);

//     // ac 부분
//     for (let i = 0; i < ac.length; i++) {
//         result[i] = ac[i];
//     }

//     // middle 부분
//     for (let i = 0; i < middle.length; i++) {
//         result[i + m] += middle[i];
//     }

//     // bd 부분
//     for (let i = 0; i < bd.length; i++) {
//         result[i + 2 * m] += bd[i];
//     }

//     return result;
// }

// function isZero(x) {
//     return !x.d || (x.d.length === 1 && x.d[0] === 0);
// }

// function getPrecision(x, y) {
//     return Math.min(
//         MAX_DIGITS,
//         x.d.length * LOG_BASE + y.d.length * LOG_BASE
//     );
// }

// function estimateExponent(x) {
//     return x.d.length * LOG_BASE + x.e;
// }

// function roundToPrecision(x, precision) {
//     // 정밀도에 따른 반올림 처리
//     const digits = Math.floor(precision / LOG_BASE);
//     if (x.d.length > digits) {
//         x.d.length = digits;
//         x.d = x.d.slice(0, digits);
//     }
//     return x;
// }

// // 결과를 문자열로 변환하는 헬퍼 함수
// function toString(x) {
//     if (!x.d) return 'NaN';

//     let str = x.s < 0 ? '-' : '';
//     let result = '';

//     // 각 BASE 단위 숫자를 문자열로 변환
//     for (let i = 0; i < x.d.length; i++) {
//         let chunk = x.d[i].toString();

//         // 첫 번째 청크가 아니면 7자리로 패딩
//         if (i > 0) {
//             chunk = chunk.padStart(LOG_BASE, '0');
//         }

//         result += chunk;
//     }

//     // 지수 적용
//     if (x.e !== 0) {
//         const len = result.length;
//         const absE = Math.abs(x.e);

//         if (x.e > 0) {
//             result = result.padEnd(len + x.e, '0');
//         } else {
//             result = '0'.repeat(absE - len + 1) + result;
//             result = result.slice(0, -x.e) + '.' + result.slice(-x.e);
//         }
//     }

//     return str + result;
// }
