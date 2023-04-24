import { NextApiRequest, NextApiResponse } from 'next'
import { getUser } from "../auth/user"
import prisma from '../../../lib/prisma';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

    const user = await getUser(request)

    // Check if the user is authenticated
    if (!user) {
        return response.status(401).json({
            message: "Not authorized.",
        })
    }

    const { address } = user

    try {
        const jobSpecs = await prisma.job_specs.findMany({
            where: {
                created_by: address.toLowerCase()
            }
        })

        return response.status(200).json(jobSpecs)
    }
    catch (err) {
        console.error(err)
        return response.status(500).json({
            message: "Failed to get user's job specs."
        })
    }
}
