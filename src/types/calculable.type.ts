type Brand<K, T> = K & { __brand: T }

export type Calculable = Brand<string, 'Calculable'>
