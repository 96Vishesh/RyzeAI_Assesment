/**
 * Planner Agent Step
 * 
 * Interprets user intent, chooses layout structure,
 * selects components, and outputs a structured JSON plan.
 */

import { getGroqClient, AI_MODEL, withRetry } from './aiClient.js';
import { PLANNER_PROMPT } from './prompts.js';

export interface ComponentPlan {
    component: string;
    props: Record<string, unknown>;
    wrapper?: string;
    children?: ComponentPlan[];
}

export interface UIPlan {
    layout: {
        type: string;
        description: string;
    };
    components: ComponentPlan[];
    reasoning: string;
}

export async function runPlanner(userIntent: string): Promise<UIPlan> {
    const groq = getGroqClient();

    const result = await withRetry(() =>
        groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: PLANNER_PROMPT },
                { role: 'user', content: userIntent },
            ],
            temperature: 0.3,
            max_tokens: 4096,
        })
    );

    const responseText = result.choices[0]?.message?.content || '';

    // Extract JSON from response (strip markdown fences if present)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
        const plan: UIPlan = JSON.parse(jsonStr);

        if (!plan.layout || !plan.components || !Array.isArray(plan.components)) {
            throw new Error('Invalid plan structure: missing layout or components');
        }

        return plan;
    } catch (error) {
        throw new Error(`Planner failed to produce valid JSON: ${error instanceof Error ? error.message : 'Unknown error'}\nRaw output: ${responseText.substring(0, 500)}`);
    }
}
