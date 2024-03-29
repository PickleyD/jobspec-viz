import { NextApiRequest, NextApiResponse } from 'next'
import { getUser } from "../auth/user"
import prisma from '../../../lib/prisma';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

    const user = await getUser(request)

    // Check if the user is authenticated
    if (!user) {
        return response.status(401).json({
            message: "Not authorized.",
        })
    }

    const { address } = user

    if (request.method === "GET") {
        try {
            const jobSpecs = await prisma.job_spec.findMany({
                where: {
                    created_by: {
                        equals: address,
                        mode: "insensitive"
                    }
                },
                include: {
                    job_spec_versions: {
                        orderBy: { 
                            id: 'desc'
                        },
                        take: 1
                    }
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
}
