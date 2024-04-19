import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function film(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Read the request body as a string
        const requestBody: string = request.body ? request.body.toString() : '';

        // Parse request body as JSON
        const parsedBody = requestBody ? JSON.parse(requestBody) : {};

        // Destructure the properties from the parsed body
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
                    body: JSON.stringify(newMovie) // Serialize newMovie to JSON string
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
                body: "Please provide all required fields: title, year, genre, description, director, actors"
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
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: film
});
