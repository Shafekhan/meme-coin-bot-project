import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); 
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"; 
async function getTokenFromLLM(contents: string, retries = 3, delay = 1000): Promise<string> {
    if (!MISTRAL_API_KEY) {
        console.error("❌ Error: Missing Mistral API Key!");
        return "null";
    }
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(
                MISTRAL_API_URL,
                {
                    model: "mistral-small",  
                    messages: [
                        {
                            role: "system",
                            content: "You are an AI agent. Your role is to return a Solana token address (32-44 characters, base58 format) if present in the Reddit post. If no valid Solana address is found, return 'null'. Do not return explanations or other addresses or examples."
                        },
                        {
                            role: "user",
                            content: contents
                        }
                    ]
                },
                {
                    headers: {
                        "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            let result = response.data.choices[0].message.content?.trim() ?? "null";
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(result)) {
                console.warn("⚠️ AI returned an invalid token address:", result);
                return "null";
            }
            return result;
        } catch (error: any) {
            if (error.response?.status === 429) {
                console.warn(`⚠️ Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; 
            } else {
                console.error("❌ Mistral API Error:", error.message);
                break; 
            }
        }
    }
    return "null"; 
}

export { getTokenFromLLM };
