import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new user',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })


      if (userWithSameEmail) {
        return reply.status(409).send({ error: 'User with this email already exists' })
      }

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
