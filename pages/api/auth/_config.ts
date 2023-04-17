import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuthConfig } from "@thirdweb-dev/auth/next";
import { Json } from "@thirdweb-dev/auth";

export const thirdwebAuthConfig: ThirdwebAuthConfig<Json, Json> = {
    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || "",
    wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
    callbacks: {
        onLogin: async (address) => {
            console.log("LOGGED IN: " + JSON.stringify(address))
        },
        onUser: async (user) => {
            console.log("USER: " + JSON.stringify(user))
        },
        onLogout: async (user) => {
            console.log("LOGGED OUT: " + JSON.stringify(user))
        }
    },
}