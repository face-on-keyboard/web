import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { success } from './jsend'

const app = new Hono().basePath('/api')

const routes = app.get('/status', (c) => {
  return success(c, {
    timestamp: new Date().getTime(),
  })
})

export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes
