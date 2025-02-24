import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).post(
    '/events/invite',
    {
      schema: {
        tags: ['Events'],
        summary: 'Create a new invite in event',
        security: [{ bearerAuth: [] }],
        body: z.object({
          userId: z.string().uuid(),
          eventId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { eventId, userId} = request.body

      const event = await prisma.event.findFirst({
        where:{
          id: eventId
        }
      })

      const user = await prisma.user.findFirst({
        where: {
          id: userId
        }
      })
      

      if(!event){
        throw new Error('Evento inexistente')
      }

      console.log(user)

      if(!user){
        throw new Error('Usuario inexistente')
      }
     
      await prisma.invite.create({
        data: {
          eventId,
          userId
        }
      })

      //convite por email
    

      return reply.status(201).send({ message: 'convite criado com sucesso', event })
    },
  )
}