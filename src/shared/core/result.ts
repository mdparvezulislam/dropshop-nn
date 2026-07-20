export type Result<T, E = Error> = SuccessResult<T> | FailureResult<E>;

export class SuccessResult<T> {
  readonly success = true as const;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  map<U>(fn: (value: T) => U): SuccessResult<U> {
    return new SuccessResult(fn(this.value));
  }

  getOrThrow(): T {
    return this.value;
  }

  getOrElse(defaultValue: T): T {
    return this.value;
  }
}

export class FailureResult<E = Error> {
  readonly success = false as const;
  readonly error: E;
  readonly message: string;

  constructor(error: E, message?: string) {
    this.error = error;
    this.message = message ?? (error instanceof Error ? error.message : String(error));
  }

  map<U>(_fn: (value: never) => U): FailureResult<E> {
    return this;
  }

  getOrThrow(): never {
    throw this.error;
  }

  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }
}

export function success<T>(value: T): SuccessResult<T> {
  return new SuccessResult(value);
}

export function failure<E = Error>(error: E, message?: string): FailureResult<E> {
  return new FailureResult(error, message);
}

export function isSuccess<T, E>(result: Result<T, E>): result is SuccessResult<T> {
  return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is FailureResult<E> {
  return !result.success;
}
