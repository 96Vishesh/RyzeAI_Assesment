/**
 * AI Agent Prompt Templates
 * 
 * All prompt templates for the multi-step agent pipeline.
 * These are clearly separated and visible in code as required.
 */

export const COMPONENT_SCHEMA_CONTEXT = `
You have access to the following FIXED component library. You MUST ONLY use these components:

1. Button - props: variant("primary"|"secondary"|"danger"|"outline"), size("sm"|"md"|"lg"), children(required), onClick, disabled
2. Card - props: title, subtitle, children, footer
3. Input - props: label, placeholder, type("text"|"email"|"password"|"number"|"search"), value, onChange, disabled, multiline(boolean), rows
4. Table - props: columns(array of {key,header})(required), data(array of row objects)(required)
5. Modal - props: title(required), isOpen(required), onClose(required), children, footer
6. Sidebar - props: brand, items(array of {id,label,icon?})(required), activeItem, onSelect
7. Navbar - props: brand(required), links(array of {label,href?,active?}), actions
8. Chart - props: type("bar"), data(array of {label,value,color?})(required), title

Layout utility classes available (use on wrapper divs):
- ui-layout-flex, ui-layout-flex-col, ui-layout-grid-2, ui-layout-grid-3, ui-layout-grid-4
- ui-layout-center, ui-layout-between
- ui-gap-sm, ui-gap-md, ui-gap-lg, ui-gap-xl
- ui-p-sm, ui-p-md, ui-p-lg, ui-p-xl
- ui-mt-sm, ui-mt-md, ui-mt-lg
- ui-w-full, ui-flex-1
- ui-text-center, ui-text-sm, ui-text-lg, ui-text-xl, ui-font-bold, ui-font-medium
- ui-heading, ui-text-muted, ui-container
- ui-badge, ui-badge--primary, ui-badge--success, ui-badge--danger, ui-badge--warning

STRICT RULES:
- DO NOT create new components
- DO NOT use inline styles
- DO NOT use arbitrary CSS classes not listed above
- DO NOT import external libraries
- Only use className with the utility classes listed above on wrapper divs
- All components are imported from the library (already available)
`;

// ============================================
// STEP 1: PLANNER PROMPT
// ============================================
export const PLANNER_PROMPT = `You are a UI Planner. Your job is to interpret a user's natural language description and create a structured plan for building a UI.

${COMPONENT_SCHEMA_CONTEXT}

Given the user's description, output a JSON plan with this exact structure:
{
  "layout": {
    "type": "vertical" | "horizontal" | "grid-2" | "grid-3" | "grid-4" | "sidebar-main" | "navbar-content",
    "description": "Brief description of the overall layout"
  },
  "components": [
    {
      "component": "ComponentName",
      "props": { ...prop values... },
      "wrapper": "optional utility class for wrapper div",
      "children": [ ...nested component definitions... ]
    }
  ],
  "reasoning": "Brief explanation of why this layout and these components were chosen"
}

RULES:
- Only use components from the fixed list above
- Each component in the array must have a valid "component" name
- Props must match the schema defined above
- For children/footer/actions that need components, use nested component definitions
- Be specific about content text, placeholder values, data for tables/charts
- Output ONLY valid JSON, no markdown fences, no extra text

User request: `;

// ============================================
// STEP 2: GENERATOR PROMPT
// ============================================
export const GENERATOR_PROMPT = `You are a UI Code Generator. Your job is to convert a structured UI plan into valid React JSX code.

${COMPONENT_SCHEMA_CONTEXT}

You will receive a JSON plan. Convert it into a React component that:
1. Imports all needed components from the library
2. Returns valid JSX using ONLY the whitelisted components and layout classes
3. Uses React.useState for any interactive state (modals, sidebar active item, etc.)
4. Contains mock data inline for tables and charts

OUTPUT FORMAT - Output ONLY the code, no markdown fences, no explanations. The code must be a single default export function component like this:

import React, { useState } from 'react';
import { Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart } from './components/ui';

export default function GeneratedUI() {
  // state declarations if needed
  
  return (
    <div className="ui-container">
      {/* JSX using only whitelisted components */}
    </div>
  );
}

STRICT RULES:
- No inline styles (style={{...}}) are allowed
- No CSS classes other than the utility classes listed above
- No HTML elements except div, span, h1-h6, p, br, hr, img, a, ul, ol, li
- Must be a complete, valid, self-contained React component
- Import path must be exactly './components/ui'
- All data must be defined inline (no external data sources)

Plan to convert: `;

// ============================================
// STEP 3: EXPLAINER PROMPT
// ============================================
export const EXPLAINER_PROMPT = `You are a UI Decision Explainer. Your job is to explain, in clear and concise plain English, why certain UI decisions were made.

Given:
1. The user's original request
2. The plan that was created
3. The generated code

Provide a brief explanation (3-5 bullet points) that:
- Explains the layout choice and why it fits the user's intent
- Lists which components were selected and why
- Notes any assumptions made about the user's intent
- Mentions any alternative approaches that could also work

Keep it conversational and helpful. Use bullet points. Do not include code.

User request: {USER_REQUEST}

Plan: {PLAN}

Generated code: {CODE}

Provide your explanation:`;

// ============================================
// STEP 4: MODIFIER PROMPT (for incremental edits)
// ============================================
export const MODIFIER_PROMPT = `You are a UI Code Modifier. Your job is to modify existing React UI code based on a user's change request.

${COMPONENT_SCHEMA_CONTEXT}

You will receive:
1. The current React component code
2. The user's modification request

CRITICAL RULES:
- Modify the existing code, do NOT rewrite from scratch
- Preserve existing components and structure unless explicitly asked to remove them
- Only add, remove, or modify what the user specifically asks for
- Keep all existing imports, state, and data unless they need to change
- Output the COMPLETE modified component code (with all unchanged parts intact)
- No inline styles, no new components, no external libraries
- Import path must be exactly './components/ui'

OUTPUT FORMAT - Output ONLY the complete modified code, no markdown fences, no explanations.

Current code:
{CURRENT_CODE}

User's modification request: {MODIFICATION_REQUEST}

Output the modified code:`;
