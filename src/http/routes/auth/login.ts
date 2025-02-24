import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'

export async function loginUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/login',
        {
            schema: {
                tags: ['Auth'],
                summary: 'User login',
                body: z.object({
                    email: z.string().email(),
                    password: z.string().min(6),
                }),
                response: {
                    200: z.object({
                        token: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { email, password } = request.body

            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user) {
               throw new Error("User not found")
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)

            if (!isPasswordValid) {
                throw new Error("Invalid password")
            }

            const token = await reply.jwtSign(
                {
                    sub: user.id,
                    name: user.name
                },
                {
                    sign: {
                        expiresIn: '7d',
                    },
                },
            )

            return reply.status(200).send({ token })
        },
    )
}