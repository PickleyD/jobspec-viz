import { NextApiRequest, NextApiResponse } from 'next'
import { getUser } from "../../../auth/user"
import prisma from '../../../../../lib/prisma';

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

    const { specId } = request.query

    // Add a new version to the job spec
    if (request.method === "POST") {
        const { content } = request.body

        if (!content) {
            return response.status(400).json({
                message: "Missing job spec content in request body.",
            })
        }

        try {
            let jobSpecCreate
            if (specId !== "null") {
                jobSpecCreate = {
                    connectOrCreate: {
                        where: {
                            id: typeof(specId) === "number" ? parseInt(specId) : parseInt(specId[0])
                        },
                        create: {
                            created_by: address.toLowerCase()
                        }
                    }
                }
            }
            else {
                jobSpecCreate = {
                    create: {
                        created_by: address.toLowerCase()
                    }
                }
            }

            const jobSpecVersion = await prisma.job_spec_version.create({
                data: {
                    content: content,
                    users: {
                        connect: {
                            address: address.toLowerCase()
                        }
                    },
                    job_specs: jobSpecCreate
                }
            })

            return response.status(200).json(jobSpecVersion)

        } catch (err) {
            console.error("Failed to add job spec version.", err)
            return response.status(500).json({
                message: "Failed to add job spec version."
            })
        }
    }
}
