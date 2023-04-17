import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { NextApiRequest, NextApiResponse } from 'next'

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || "",
    wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
    callbacks: {
        onLogin: async (address) => {
            console.log("LOGGED IN: " + address)
        },
        onUser: async (user) => {
            console.log("USER: " + user)
        },
        onLogout: async (user) => {
            console.log("LOGGED OUT: " + user)
        }
    },
});

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    
    request.query.thirdweb = ["user"]
    
    return ThirdwebAuthHandler(request, response);
} 