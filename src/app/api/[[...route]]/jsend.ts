export function success<T>(data: T): {
  status: 'success'
  data: T
} {
  return {
    status: 'success',
    data,
  }
}

export function fail<T>(data: T): {
  status: 'fail'
  data: T
} {
  return {
    status: 'fail',
    data,
  }
}

export function error<T>(
  message: string,
  code?: number,
  data?: T
): {
  status: 'error'
  message: string
  code?: number
  data?: T
} {
  return {
    status: 'error',
    message,
    code,
    data,
  }
}
