import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).post(
    '/events',
    {
      schema: {
        tags: ['Events'],
        summary: 'Create a new event',
        security: [{ bearerAuth: [] }],
        body: z.object({
          description: z.string(),
          endTime: z.coerce.date(),
          startTime: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { description, endTime, startTime } = request.body

      const { sub: userId } = await request.jwtVerify<{ sub: string }>()

      if(startTime === endTime){
        throw new Error('O dia inicial nao pode ser o mesmo que o dia final.')
      }


      const event = await prisma.event.create({
        data: {
          description,
          startTime,
          endTime,
          createdBy: userId, 
        },
      })

      return reply.status(201).send({ message: 'Event created successfully', event })
    },
  )
}