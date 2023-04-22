import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const getUserExists = async (address: string) => {
    const query = `SELECT EXISTS(SELECT 1 FROM "users" WHERE address='${address.toLowerCase()}') AS "exists";`

    const client = await pool.connect();
    const result = await client.query(query);
    return result.rows;
}

export const insertUser = async (address: string) => {
    const query = `INSERT INTO "users"(address,num_logins,last_login) VALUES ('${address.toLowerCase()}',1,current_timestamp);`;

    const client = await pool.connect();
    const result = await client.query(query);
    return result.rows;
}

export const updateLoginData = async (address: string) => {
    const query = `UPDATE "users" SET num_logins = num_logins + 1, last_login = current_timestamp WHERE address = '${address.toLowerCase()}';`;

    const client = await pool.connect();
    const result = await client.query(query);
    return result.rows;
}