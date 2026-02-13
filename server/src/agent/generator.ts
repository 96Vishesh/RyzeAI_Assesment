/**
 * Generator Agent Step
 * 
 * Converts a structured plan into valid React component code
 * using only the whitelisted components.
 */

import { getGroqClient, AI_MODEL, withRetry } from './aiClient.js';
import { GENERATOR_PROMPT, MODIFIER_PROMPT } from './prompts.js';
import type { UIPlan } from './planner.js';

export async function runGenerator(plan: UIPlan): Promise<string> {
    const groq = getGroqClient();

    const result = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: GENERATOR_PROMPT },
                { role: 'user', content: JSON.stringify(plan, null, 2) },
            ],
            temperature: 0.2,
            max_tokens: 4096,
        })
    );

    let code = (result.choices[0]?.message?.content || '').trim();

    // Strip markdown fences if present
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:tsx|jsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '');
    }

    // Basic validation: must contain an export default function
    if (!code.includes('export default function') && !code.includes('export default')) {
        if (code.includes('function GeneratedUI')) {
            code += '\nexport default GeneratedUI;';
        } else {
            throw new Error('Generator produced code without a default export');
        }
    }

    return code;
}

export async function runModifier(currentCode: string, modificationRequest: string): Promise<string> {
    const groq = getGroqClient();

    const systemPrompt = MODIFIER_PROMPT.replace('{CURRENT_CODE}', currentCode);

    const result = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: modificationRequest },
            ],
            temperature: 0.2,
            max_tokens: 4096,
        })
    );

    let code = (result.choices[0]?.message?.content || '').trim();

    // Strip markdown fences if present
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:tsx|jsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '');
    }

    if (!code.includes('export default function') && !code.includes('export default')) {
        if (code.includes('function GeneratedUI')) {
            code += '\nexport default GeneratedUI;';
        } else {
            throw new Error('Modifier produced code without a default export');
        }
    }

    return code;
}
