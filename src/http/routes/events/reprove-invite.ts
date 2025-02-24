import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

/**
 * Função para reprovar um convite de evento
 * @route PATCH /events/invite/:inviteId/reprove
 * @param {string} inviteId - ID do convite 
 */
export async function reproveInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).patch(
    '/events/invite/:inviteId/reprove',
    {
      schema: {
        tags: ['Convites'],
        summary: 'Reprovar um convite de evento',
        security: [{ bearerAuth: [] }],
        params: z.object({
          inviteId: z.string().uuid()
        }),
      },
    },

    async (request, reply) => {
      const {inviteId} = request.params

      // busca o convite selecionado
      const invite = await prisma.invite.findFirst({
        where: {
          id: inviteId
        }
      })

      if(!invite){
        throw new Error('Convite não encontrado1')
      }

      // atuliza o status do convite no banco
      await prisma.invite.update({
        where: {
          id: inviteId
        },
        data: {
          status: 'REJECTED'
        }
      })

      return reply.status(200).send({ message: 'Convite recusado!'})
    },
  )
}