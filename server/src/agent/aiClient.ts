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
