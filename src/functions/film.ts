import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function film(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const requestBody: string = request.body ? request.body.toString() : '';

        const parsedBody = requestBody ? JSON.parse(requestBody) : {};

        const { title, year, genre, description, director, actors } = parsedBody;

        if (title && year && genre && description && director && actors) {
            try {
                const newMovie = await prisma.movie.create({
                    data: {
                        title: title,
                        year: year,
                        genre: genre,
                        description: description,
                        director: director,
                        actors: actors
                    }
                });

                return {
                    status: 200,
                    body: JSON.stringify(newMovie) 
                };
            } catch (error) {
                return {
                    status: 500,
                    body: error.message
                };
            }
        } else {
            return {
                status: 400,
                body: "You must provide all required fields: title, year, genre, description, director, actors"
            };
        }
    } catch (error) {
        return {
            status: 400,
            body: "Invalid JSON payload"
        };
    }
};

app.http('film', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: film
});
