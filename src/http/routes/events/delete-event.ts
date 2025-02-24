// src/http/routes/events/delete-event.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'

export async function deleteEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete(
    '/events/:id',
    {
      schema: {
        tags: ['Events'],
        summary: 'Delete an event',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const event = await prisma.event.findUnique({
        where: { id },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      const { sub: userId } = await request.jwtVerify<{ sub: string }>()
      
      if (event.createdBy !== userId) {
       throw new Error('You are not authorized to delete this event')
      }

      await prisma.event.delete({
        where: { id },
      })

      return reply.status(200).send({ message: 'Event deleted successfully' })
    },
  )
}
