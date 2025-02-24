import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

/**
 * Função para aceitar um convite de um evento
 * @route PATCH /events/invite/:inviteId/accept
 * @param {string} inviteId - ID do convite a ser aceito
 */
export async function acceptInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).patch(
    '/events/invite/:inviteId/accept',
    {
      schema: {
        tags: ['Convites'],
        summary: 'Aceitar um convite',
        security: [{ bearerAuth: [] }],
        params: z.object({
          inviteId: z.string().uuid()
        })
      },
    },

    async (request, reply) => {
      const {inviteId} = request.params
      
      // busca o convite no banco
      const invite = await prisma.invite.findFirst({
        where: {
          id: inviteId
        }
      })

      if(!invite){
        throw new Error('Convite inexistente!')
      }

      // atualiza o status do convite
      await prisma.invite.update({
        where: {
          id: inviteId
        },
        data: {
          status: 'ACCEPTED'
        }
      })

      return reply.status(200).send({ message: 'Convite aprovado!'})
    },
  )
}