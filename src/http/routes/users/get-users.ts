// src/http/routes/events/get-events.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middleware/auth'

export async function getUsers(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get(
        '/users',
        {
            schema: {
                tags: ['Users'],
                summary: 'Get all users',
                security: [{ bearerAuth: [] }],
                response: {
                    200: z.array(
                        z.object({
                            id: z.string().uuid(),
                            name: z.string(),
                            email: z.string().email(),
                            password: z.string(),
                            createdAt: z.coerce.date(),
                            updatedAt: z.coerce.date(),
                        }),
                    ),
                },
            },
        },
        async (request, reply) => {
            const { sub: userId } = await request.jwtVerify<{ sub: string }>()


            const users = await prisma.user.findMany({
                where: {
                    NOT: {
                        id: userId
                    }
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            return reply.status(200).send(users)
        },
    )
}
