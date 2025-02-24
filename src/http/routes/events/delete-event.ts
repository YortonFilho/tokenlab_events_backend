import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'

/**
 * Função para deletar um evento
 * @route DELETE /events/:id
 * @param {string} id - ID do evento
 */
export async function deleteEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete(
    '/events/:id',
    {
      schema: {
        tags: ['Eventos'],
        summary: 'Deletar um evento',
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

      // busca o evento pelo id
      const event = await prisma.event.findUnique({
        where: { id },
      })

      if (!event) {
        throw new Error('Evento não encontrado!')
      }

      // verifica se o usuario que esta tentando deletar é o dono do evento
      const { sub: userId } = await request.jwtVerify<{ sub: string }>()
      
      if (event.createdBy !== userId) {
       throw new Error('Você não é autorizado para deletar esse evento!')
      }

      // deletando evento do banco de dados
      await prisma.event.delete({
        where: { id },
      })

      return reply.status(200).send({ message: 'Evento deletado com sucesso!' })
    },
  )
}
