import {
    NextApiRequest,
    NextApiResponse,
} from "next/types";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const { prompt } = request.body;

    const payload = {
        model: "gpt-3.5-turbo",
        prompt,
        temperature: 0.3,
        // top_p: 1,
        // frequency_penalty: 0,
        // presence_penalty: 0,
        // max_tokens: 200,
        // n: 1,
    };

    const completion = await fetch("https://api.openai.com/v1/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    const json = await completion.json();
    response.status(200).json(json);
}