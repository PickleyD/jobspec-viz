import { Pool } from "pg"
import { NextApiRequest, NextApiResponse } from 'next'
import { getUser } from "../auth/user";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const { specId, content } = request.body;

    console.log(content)

    const user = await getUser(request)

    // Check if the user is authenticated
    if (!user) {
        return response.status(401).json({
            message: "Not authorized.",
        });
    }

    console.log(JSON.stringify(user))

    const { address } = user

    const query = `SELECT * FROM "job_specs";`;

    try {
        const client = await pool.connect();
        const result = await client.query(query);
        response.json(result.rows);
    } catch (err) {
        if (typeof err === "string") {
            response.status(500).json({
                message: err
            });
        } else if (err instanceof Error) {
            response.status(500).json({
                message: err.message
            });
        }
    }
}
