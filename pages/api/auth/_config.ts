import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuthConfig } from "@thirdweb-dev/auth/next";
import { Json } from "@thirdweb-dev/auth";
import { Pool } from "pg"
import { getUserExists, insertUser, updateLoginData } from "./_db";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const thirdwebAuthConfig: ThirdwebAuthConfig<Json, Json> = {
    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || "",
    wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
    callbacks: {
        onLogin: async (address) => {
            try {
                const userExistsResult = await getUserExists(address)
                if (!userExistsResult[0].exists) {
                    await insertUser(address)
                }
                else {
                    await updateLoginData(address)
                }
            } catch (err) {
                console.log("Failed to update user in database.", err)
            }
        },
        onUser: async (user) => {
            console.log("USER: " + JSON.stringify(user))
        },
        onLogout: async (user) => {
            console.log("LOGGED OUT: " + JSON.stringify(user))
        }
    },
}