import { Pool } from "pg"
import { NextApiRequest, NextApiResponse } from 'next'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // const { specId } = request.body;

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
