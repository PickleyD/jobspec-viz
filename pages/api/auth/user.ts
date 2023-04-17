/**
 * Typically these auth routes would all be created under a /[...thirdweb]
 * but the combination of .ts routes under /pages/api and the .go routes under
 * /api seems to break the catch-all feature. As a result each has been split
 * into a separate file.
 **/
import { thirdwebAuthConfig } from "./_config"
import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import {
    NextApiRequest,
    NextApiResponse,
  } from "next/types";

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth(thirdwebAuthConfig);

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    
    request.query.thirdweb = ["user"]
    
    return ThirdwebAuthHandler(request, response);
} 