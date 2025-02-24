import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

export const auth = fastifyPlugin((async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    try {
        const { sub } = await request.jwtVerify<{ sub: string}>()
        return sub

      } catch {
        throw new Error('Token inválido!')
      }
  })
}))