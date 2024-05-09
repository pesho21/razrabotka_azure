import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from "@prisma/client";
import * as Joi from 'joi';

const prisma = new PrismaClient();

export async function movie(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    switch (request.method) {
        case "GET":
            return handleGetMovies(request);
        case "POST":
            return handleCreateMovie(request);
        default:
            return { status: 405, body: "Method Not Allowed" };
    }
}

async function handleGetMovies(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const id = parseInt(request.query.get("id") || "");
        let movies;
        if (id) {
            movies = await prisma.movie.findUnique({ where: { id } });
            return { body: JSON.stringify(movies) };
        } else {
            movies = await prisma.movie.findMany({ take: 100 });
            return { body: JSON.stringify(movies) };
        }
    } catch (error) {
        return { status: 501, body: "Internal Server Error: " + error.message };
    }
}

async function handleCreateMovie(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const requestBody = await parseRequestBody(request.body as ReadableStream<ArrayBufferView>); 
        const validationResult = await Joi.object({
            title: Joi.string().required(),
            year: Joi.number().integer().required(),
            genre: Joi.string().required(),
            description: Joi.string().required(),
            director: Joi.string().required(),
            actors: Joi.string().required(),
            thumbnailUrl: Joi.string().uri().optional(),
        }).validateAsync(requestBody);

        const movie = await prisma.movie.create({ data: validationResult });
        return { body: JSON.stringify(movie) };
    } catch (error) {
        return { status: 500, body: "Internal Server Error: " + error.message };
    }
}

async function parseRequestBody(readable: ReadableStream<ArrayBufferView>): Promise<any> { 
    const reader = await readable.getReader();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder("utf-8").decode(value);
    }
    return JSON.parse(result);
}

app.http('movie', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: movie
});
