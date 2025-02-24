import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createUser } from "./http/routes/auth/create-user"
import { loginUser } from "./http/routes/auth/login"
import { createEvent } from './http/routes/events/create-event'
import { getEvents } from './http/routes/events/get-events'
import { editEvent } from './http/routes/events/edit-event'
import { deleteEvent } from './http/routes/events/delete-event'
import { getEvent } from './http/routes/events/get-event'
import { createInvite } from './http/routes/events/create-invite'
import { getUsers } from './http/routes/users/get-users'
import { reproveInvite } from './http/routes/events/reprove-invite'
import { acceptInvite } from './http/routes/events/accept-invite'
import { getInvites } from './http/routes/events/get-invites'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)


app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'TOKEN LAB BACKEND',
            description: 'Projeto para o teste da vaga da token lab',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
            },
          },

    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
})

app.register(fastifyJwt, {
    secret: 'your-secret-key', 
})

app.register(fastifyCors)

//endpoints de login
app.register(createUser)
app.register(loginUser)

//endpoints de eventos
app.register(createEvent)
app.register(getEvents)
app.register(editEvent)
app.register(deleteEvent)
app.register(getEvent)


//endpoints de convite
app.register(createInvite)
app.register(reproveInvite)
app.register(acceptInvite)
app.register(getInvites)

// endpoints dos usuarios
app.register(getUsers)


app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log('HTTP server running! 🚀')
})