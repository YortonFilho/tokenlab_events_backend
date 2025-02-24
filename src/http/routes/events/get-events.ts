

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'

export async function getEvents(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get(
    '/events',
    {
      schema: {
        tags: ['Events'],
        summary: 'Get all events',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              description: z.string(),
              startTime: z.coerce.date(),
              endTime: z.coerce.date(),
              createdBy: z.string(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = await request.jwtVerify<{ sub: string }>()

      const events = await prisma.event.findMany({
        where: {
          createdBy: userId
        },
        include: {
          user: true, 
        },
      })

      return reply.status(200).send(events)
    },
  )
}
