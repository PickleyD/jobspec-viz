import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuthConfig } from "@thirdweb-dev/auth/next";
import { Json } from "@thirdweb-dev/auth";
import prisma from "../../../lib/prisma";

export const thirdwebAuthConfig: ThirdwebAuthConfig<Json, Json> = {
    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || "",
    wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
    callbacks: {
        onLogin: async (address) => {
            try {
                const user = await prisma.user.upsert({
                    where: {
                        address: address.toLowerCase()
                    },
                    update: {
                        address: address.toLowerCase(),
                        num_logins: { increment: 1 }
                    },
                    create: {
                        address: address.toLowerCase(),
                        num_logins: 1
                    }
                })
            } catch (err) {
                console.error(err)
            }
        },
        onUser: async (user) => {
        },
        onLogout: async (user) => {
        }
    },
}