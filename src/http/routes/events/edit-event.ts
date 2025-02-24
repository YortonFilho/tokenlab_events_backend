// src/http/routes/events/edit-event.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'

export async function editEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).put(
    '/events/:id',
    {
      schema: {
        tags: ['Events'],
        summary: 'Edit an event',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          description: z.string().optional(),
          startTime: z.coerce.date().optional(),
          endTime: z.coerce.date().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            event: z.object({
              id: z.string(),
              description: z.string(),
              startTime: z.coerce.date(),
              endTime: z.coerce.date(),
              createdBy: z.string(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { description, startTime, endTime } = request.body

      const event = await prisma.event.findUnique({
        where: { id },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      const { sub: userId } = await request.jwtVerify<{ sub: string }>()
      if (event.createdBy !== userId) {
        throw new Error('You are not authorized to edit this event')
      }

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          description: description ?? event.description, 
          startTime: startTime ?? event.startTime,
          endTime: endTime ?? event.endTime,
        },
      })

      return reply.status(200).send({ message: 'Event updated successfully', event: updatedEvent })
    },
  )
}