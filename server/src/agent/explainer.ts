/**
 * Explainer Agent Step
 * 
 * Explains AI decisions in plain English,
 * referencing layout and component choices.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPLAINER_PROMPT } from './prompts.js';
import type { UIPlan } from './planner.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function runExplainer(
    userRequest: string,
    plan: UIPlan,
    code: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = EXPLAINER_PROMPT
        .replace('{USER_REQUEST}', userRequest)
        .replace('{PLAN}', JSON.stringify(plan, null, 2))
        .replace('{CODE}', code);

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

/**
 * Generate a modification explanation without full agent step
 */
export async function runModificationExplainer(
    originalCode: string,
    modifiedCode: string,
    modificationRequest: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a UI Decision Explainer. The user requested a modification to an existing UI.

User's modification request: ${modificationRequest}

Briefly explain (3-5 bullet points):
- What was changed in the UI
- Which components were added, removed, or modified
- Why these changes match the user's request
- Any assumptions made

Keep it conversational and helpful. Use bullet points. Do not include any code.

Previous code length: ${originalCode.length} characters
New code length: ${modifiedCode.length} characters
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}
