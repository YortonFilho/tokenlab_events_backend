import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

/**
 * Função para criar um novo convite para um evento
 * @route POST /events/invite
 * @param {Object} body - dados do convite
 * @param {string} body.userId - ID do usuário que será convidado
 * @param {string} body.eventId - ID do evento 
 */
export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).post(
    '/events/invite',
    {
      schema: {
        tags: ['Convites'],
        summary: 'Criar um convite novo',
        security: [{ bearerAuth: [] }],
        body: z.object({
          userId: z.string().uuid(),
          eventId: z.string().uuid(),
        }),
      },
    },

    async (request, reply) => {
      const { eventId, userId} = request.body

      // busca o evento no banco de dados
      const event = await prisma.event.findFirst({
        where:{
          id: eventId
        }
      })

      // busca o usuario que será convidado
      const user = await prisma.user.findFirst({
        where: {
          id: userId
        }
      })
      
      if(!event){
        throw new Error('Evento inexistente')
      }

      if(!user){
        throw new Error('Usuario inexistente')
      }
     
      // cria o convite no banco de dados
      await prisma.invite.create({
        data: {
          eventId,
          userId
        }
      })

      return reply.status(201).send({ message: 'convite criado com sucesso!', event })
    },
  )
}