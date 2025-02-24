// src/http/routes/events/get-events.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'
import { InviteStatus } from '@prisma/client'

/**
 * Função para obter todos os convites pendentes do usuário
 * @route GET /events/invites
 * @returns {Array<Object>} Lista de convites pendentes para o usuário logado
 */
export async function getInvites(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get(
    '/events/invites',
    {
      schema: {
        tags: ['Eventos'],
        summary: 'Listar todos convites pendentes',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              status: z.nativeEnum(InviteStatus),
              createdAt: z.coerce.date(),
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string().email(),
              }),
              event: z.object({
                id: z.string(),
                description: z.string(),
                startTime: z.coerce.date(),
                endTime: z.coerce.date(),
                createdBy: z.string(),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
          ),
        },

      },
    },

    async (request, reply) => {
      const { sub: userId } = await request.jwtVerify<{ sub: string }>()

      // buscar todos convites pendetes
      const invites = await prisma.invite.findMany({
        where: {
          userId,
          status: "PENDING"
        },
        include: {
          user: true,
          event: true,
        }
      })

      return reply.status(200).send(invites)
    },
  )
}
