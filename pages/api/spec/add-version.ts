import { NextApiRequest, NextApiResponse } from 'next'
import { getUser } from "../auth/user"
import prisma from '../../../lib/prisma';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const { specId, content } = request.body

    if (!content) {
        return response.status(400).json({
            message: "Missing job spec content in request body.",
        })
    }

    const user = await getUser(request)

    // Check if the user is authenticated
    if (!user) {
        return response.status(401).json({
            message: "Not authorized.",
        })
    }

    const { address } = user

    if (specId) {
        // Check that the spec ID provided by the user was previously created by the user
        try {
            const jobSpec = await prisma.job_specs.findUniqueOrThrow({
                where: {
                    id: specId
                }
            })
        }
        catch (err) {
            return response.status(401).json({
                message: "Not authorized to append to this job spec."
            })
        }
    }

    try {

        let jobSpecsCreate
        if (specId) {
            jobSpecsCreate = {
                connectOrCreate: {
                    where: {
                        id: specId
                    },
                    create: {
                        created_by: address.toLowerCase()
                    }
                }
            }
        }
        else {
            jobSpecsCreate = {
                create: {
                    created_by: address.toLowerCase()
                }
            }
        }

        const jobSpecVersion = await prisma.job_spec_versions.create({
            data: {
                content: content,
                users: {
                    connect: {
                        address: address.toLowerCase()
                    }
                },
                job_specs: jobSpecsCreate
            }
        })

        return response.status(200).json(jobSpecVersion)

    } catch (err) {
        console.log("Failed to insert job spec version in database.", err)
    }
}
