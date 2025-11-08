import type { Context } from 'hono'

export function success<T extends Context>(c: T, data: unknown) {
  return c.json({
    status: 'success',
    data,
  })
}

export function fail<T extends Context>(c: T, data: unknown) {
  return c.json({
    status: 'fail',
    data,
  })
}

export function error<T extends Context>(
  c: T,
  { message, code, data }: { message: string; code?: number; data?: unknown }
) {
  return c.json({
    status: 'error',
    message,
    code,
    data,
  })
}
