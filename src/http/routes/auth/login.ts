import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import * as bcrypt from 'bcryptjs'

/**
 * Função para realizar o login de um usuário e gerar um token jwt
 * @route POST /login
 * @param {string} body.email - E-mail do usuário
 * @param {string} body.password - Senha do usuário
 */
export async function loginUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/login',
        {
            schema: {
                tags: ['Autenticação'],
                summary: 'Login do usuário',
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

            // tenta encontrar um usuario com o email fornecido
            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user) {
               throw new Error("Email incorreto!")
            }

            // compara a senha fornecida com a senha do banco
            const isPasswordValid = await bcrypt.compare(password, user.password)

            if (!isPasswordValid) {
                throw new Error("Senha inválida!")
            }

            // gera um token para o usuario
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