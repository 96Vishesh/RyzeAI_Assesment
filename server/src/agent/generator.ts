/**
 * Generator Agent Step
 * 
 * Converts a structured plan into valid React component code
 * using only the whitelisted components.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GENERATOR_PROMPT, MODIFIER_PROMPT } from './prompts.js';
import type { UIPlan } from './planner.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function runGenerator(plan: UIPlan): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = GENERATOR_PROMPT + JSON.stringify(plan, null, 2);

    const result = await model.generateContent(prompt);
    let code = result.response.text().trim();

    // Strip markdown fences if present
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:tsx|jsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '');
    }

    // Basic validation: must contain an export default function
    if (!code.includes('export default function') && !code.includes('export default')) {
        // Try to wrap it in a default export
        if (code.includes('function GeneratedUI')) {
            code += '\nexport default GeneratedUI;';
        } else {
            throw new Error('Generator produced code without a default export');
        }
    }

    return code;
}

export async function runModifier(currentCode: string, modificationRequest: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = MODIFIER_PROMPT
        .replace('{CURRENT_CODE}', currentCode)
        .replace('{MODIFICATION_REQUEST}', modificationRequest);

    const result = await model.generateContent(prompt);
    let code = result.response.text().trim();

    // Strip markdown fences if present
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:tsx|jsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '');
    }

    // Basic validation
    if (!code.includes('export default function') && !code.includes('export default')) {
        if (code.includes('function GeneratedUI')) {
            code += '\nexport default GeneratedUI;';
        } else {
            throw new Error('Modifier produced code without a default export');
        }
    }

    return code;
}
