import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

export async function acceptInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).patch(
    '/events/invite/:inviteId/accept',
    {
      schema: {
        tags: ['Events'],
        summary: 'Accept invite',
        security: [{ bearerAuth: [] }],
        params: z.object({
          inviteId: z.string().uuid()
        })
      },
    },
    async (request, reply) => {
      const {inviteId} = request.params

      const invite = await prisma.invite.findFirst({
        where: {
          id: inviteId
        }
      })

      if(!invite){
        throw new Error('Convite inexistente')
      }

      await prisma.invite.update({
        where: {
          id: inviteId
        },
        data: {
          status: 'ACCEPTED'
        }
      })

      return reply.status(200).send({ message: 'Convite aprovado'})
    },
  )
}