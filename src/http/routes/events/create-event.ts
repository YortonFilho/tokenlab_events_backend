import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'
import { auth } from '../../middleware/auth'

/**
 * Função para criar um novo evento
 * @route POST /events
 * @param {string} body.description - descrição do evento
 * @param {Date} body.startTime - data e hora de início do evento
 * @param {Date} body.endTime - data e hora de término do evento
 */
export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).post(
    '/events',
    {
      schema: {
        tags: ['Eventos'],
        summary: 'Criar um evento novo',
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

      // coleta id do usuario
      const { sub: userId } = await request.jwtVerify<{ sub: string }>()

      if(startTime === endTime){
        throw new Error('O dia inicial nao pode ser o mesmo que o dia final!')
      }

      // cria evento no banco de dados
      const event = await prisma.event.create({
        data: {
          description,
          startTime,
          endTime,
          createdBy: userId, 
        },
      })

      return reply.status(201).send({ message: 'Evento criado com sucesso!', event })
    },
  )
}