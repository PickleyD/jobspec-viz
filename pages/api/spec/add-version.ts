import { NextApiRequest, NextApiResponse } from 'next'
import { getUser } from "../auth/user"
import { getUndeletedJobSpecExists, insertJobSpec, insertJobSpecVersion } from "./_db"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const { specId, content } = request.body;

    if (!content) {
        return response.status(400).json({
            message: "Missing job spec content in request body.",
        });
    }

    const user = await getUser(request)

    // Check if the user is authenticated
    if (!user) {
        return response.status(401).json({
            message: "Not authorized.",
        });
    }

    console.log(JSON.stringify(user))

    const { address } = user

    try {
        let finalSpecId = specId

        const jobSpecExists = specId && await getUndeletedJobSpecExists(specId)

        if (!jobSpecExists) {
            const insertJobSpecResult = await insertJobSpec({
                createdBy: address
            })
            const {id: createdJobSpecId} = insertJobSpecResult || {}
            
            finalSpecId = createdJobSpecId
        }

        const insertJobSpecVersionResult = await insertJobSpecVersion({
            specId: finalSpecId,
            createdBy: address,
            content
        })
        const {id: createdJobSpecVersionId } = insertJobSpecVersionResult || {}

        return response.status(200).json({
            jobSpecId: finalSpecId,
            jobSpecVersionId: createdJobSpecVersionId
        });

    } catch (err) {
        console.log("Failed to insert job spec version in database.", err)
    }
}
