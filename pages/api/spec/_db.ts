import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const getUndeletedJobSpecExists = async (id: string) => {
    const query = `SELECT EXISTS(SELECT 1 FROM "job_specs" WHERE id='${id}' AND deleted_at IS NULL) AS "exists";`

    const client = await pool.connect();
    const result = await client.query(query);
    return result.rows[0].exists;
}

export interface InsertJobSpecInput {
    createdBy: string
}

export interface InsertJobSpecOutput {
    id: string
}

export const insertJobSpec = async (input: InsertJobSpecInput): Promise<InsertJobSpecOutput | undefined> => {

    const { createdBy } = input

    if (!createdBy) {
        console.log("Missing createdBy param")
        return
    }

    const query = `INSERT INTO "job_specs"(created_by) VALUES ('${createdBy.toLowerCase()}') RETURNING id;`

    const client = await pool.connect();
    const result = await client.query(query);
    return { id: result.rows[0].id };
}

export interface InsertJobSpecVersionInput {
    createdBy: string,
    specId: string,
    content: any
}

export interface InsertJobSpecVersionOutput {
    id: string
}

export const insertJobSpecVersion = async (input: InsertJobSpecVersionInput): Promise<InsertJobSpecVersionOutput | undefined> => {

    const { specId, content, createdBy } = input

    if (!specId) {
        console.log("Missing specId param")
        return
    }

    if (!content) {
        console.log("Missing content param")
        return
    }

    if (!createdBy) {
        console.log("Missing createdBy param")
        return
    }

    const query = `INSERT INTO "job_spec_versions"(job_spec,content,created_by) VALUES ('${specId}','${content}','${createdBy.toLowerCase()}') RETURNING id;`

    console.log(query)

    const client = await pool.connect();
    const result = await client.query(query);
    console.log(result.rows)
    return { id: result.rows[0].id };
}
