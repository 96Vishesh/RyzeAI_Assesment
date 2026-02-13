/**
 * Shared Gemini AI client
 * 
 * Lazy-initialized to ensure dotenv has loaded the API key first.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function getModel(): GenerativeModel {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey || apiKey === 'your-gemini-api-key-here') {
            throw new Error('GOOGLE_AI_API_KEY is not set. Please add it to server/.env');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

/**
 * Retry wrapper for Gemini API calls with exponential backoff.
 * Handles 429 rate limit errors automatically.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: unknown) {
            const status = (error as { status?: number }).status;
            if (status === 429 && attempt < maxRetries) {
                const waitSeconds = Math.pow(2, attempt + 1) * 5; // 10s, 20s, 40s
                console.log(`[Retry] Rate limited. Waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}
