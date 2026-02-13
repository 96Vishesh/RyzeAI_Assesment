/**
 * Shared Groq AI client
 * 
 * Lazy-initialized to ensure dotenv has loaded the API key first.
 * Uses Groq's fast inference with Llama 3.3 70B model.
 */

import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your-groq-api-key-here') {
            throw new Error('GROQ_API_KEY is not set. Please add it to server/.env');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

export const AI_MODEL = 'llama-3.3-70b-versatile';

/**
 * Retry wrapper for API calls with exponential backoff.
 * Handles 429 rate limit errors automatically.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: unknown) {
            const status = (error as { status?: number }).status;
            if (status === 429 && attempt < maxRetries) {
                const waitSeconds = Math.pow(2, attempt + 1) * 5;
                console.log(`[Retry] Rate limited. Waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}
