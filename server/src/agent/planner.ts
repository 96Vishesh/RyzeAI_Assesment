/**
 * Planner Agent Step
 * 
 * Interprets user intent, chooses layout structure,
 * selects components, and outputs a structured JSON plan.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PLANNER_PROMPT } from './prompts.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = PLANNER_PROMPT + userIntent;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response (strip markdown fences if present)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
        const plan: UIPlan = JSON.parse(jsonStr);

        // Validate plan structure
        if (!plan.layout || !plan.components || !Array.isArray(plan.components)) {
            throw new Error('Invalid plan structure: missing layout or components');
        }

        return plan;
    } catch (error) {
        throw new Error(`Planner failed to produce valid JSON: ${error instanceof Error ? error.message : 'Unknown error'}\nRaw output: ${responseText.substring(0, 500)}`);
    }
}
