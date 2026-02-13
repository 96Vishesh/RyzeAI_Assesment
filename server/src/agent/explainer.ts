/**
 * Explainer Agent Step
 * 
 * Explains AI decisions in plain English,
 * referencing layout and component choices.
 */

import { getGroqClient, AI_MODEL, withRetry } from './aiClient.js';
import { EXPLAINER_PROMPT } from './prompts.js';
import type { UIPlan } from './planner.js';

export async function runExplainer(
    userRequest: string,
    plan: UIPlan,
    code: string
): Promise<string> {
    const groq = getGroqClient();

    const systemPrompt = EXPLAINER_PROMPT
        .replace('{USER_REQUEST}', userRequest)
        .replace('{PLAN}', JSON.stringify(plan, null, 2))
        .replace('{CODE}', code);

    const result = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Provide your explanation.' },
            ],
            temperature: 0.4,
            max_tokens: 1024,
        })
    );

    return (result.choices[0]?.message?.content || '').trim();
}

/**
 * Generate a modification explanation
 */
export async function runModificationExplainer(
    originalCode: string,
    modifiedCode: string,
    modificationRequest: string
): Promise<string> {
    const groq = getGroqClient();

    const result = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are a UI Decision Explainer. The user requested a modification to an existing UI.

Briefly explain (3-5 bullet points):
- What was changed in the UI
- Which components were added, removed, or modified
- Why these changes match the user's request
- Any assumptions made

Keep it conversational and helpful. Use bullet points. Do not include any code.`
                },
                {
                    role: 'user',
                    content: `Modification request: ${modificationRequest}\n\nPrevious code length: ${originalCode.length} chars\nNew code length: ${modifiedCode.length} chars`
                },
            ],
            temperature: 0.4,
            max_tokens: 1024,
        })
    );

    return (result.choices[0]?.message?.content || '').trim();
}
