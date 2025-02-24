// src/http/routes/events/get-events.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get(
    '/events/:id',
    {
      schema: {
        tags: ['Events'],
        summary: 'Get event',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        response: {
          200: 
            z.object({
              id: z.string(),
              description: z.string().nullable(),
              startTime: z.coerce.date(),
              endTime: z.coerce.date(),
              createdBy: z.string(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
            }),
        },
      },
    },
    async (request, reply) => {
      const {id} = request.params
      

      const event = await prisma.event.findFirst({
        where: {
          id
        },
      })

      if(!event){
        throw new Error('Evento nao existe.')
      }

      return reply.status(200).send(event)
    },
  )
}
