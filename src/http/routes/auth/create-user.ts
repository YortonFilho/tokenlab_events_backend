import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'

/**
 * Função para criar um novo usuário
 * @route POST /users
 * @param {string} body.name - Nome do usuário
 * @param {string} body.email - E-mail do usuário
 * @param {string} body.password - Senha do usuário
 */
export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Criar novo usuário',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },

    async (request, reply) => {
      const { name, email, password } = request.body

      // verifica se o email já existe no banco de dados
      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (userWithSameEmail) {
        return reply.status(409).send({ error: 'User with this email already exists' })
      }

      // criptografa a senha para inserir no banco 
      const passwordHash = await bcrypt.hash(password, 6)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,  
        },
      })

      return reply.status(201).send({ message: 'User created successfully', user })
    },
  )
}
