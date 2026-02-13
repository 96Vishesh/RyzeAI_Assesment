/**
 * Prompt Sanitizer
 * 
 * Basic prompt injection protection and input sanitization.
 */

const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /ignore\s+the\s+above/i,
    /disregard\s+(all\s+)?previous/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /you\s+are\s+now\s+/i,
    /pretend\s+you\s+are/i,
    /act\s+as\s+if/i,
    /new\s+instructions\s*:/i,
    /override\s+(all\s+)?rules/i,
    /forget\s+(all\s+)?(your\s+)?instructions/i,
];

const MAX_PROMPT_LENGTH = 5000;

export interface SanitizationResult {
    sanitized: string;
    blocked: boolean;
    reason?: string;
}

export function sanitizePrompt(input: string): SanitizationResult {
    if (!input || typeof input !== 'string') {
        return { sanitized: '', blocked: true, reason: 'Empty or invalid input' };
    }

    // Trim and enforce length limit
    let sanitized = input.trim();
    if (sanitized.length > MAX_PROMPT_LENGTH) {
        sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
    }

    // Check for injection patterns
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
            return {
                sanitized: '',
                blocked: true,
                reason: `Input contains potentially harmful pattern. Please rephrase your UI request.`,
            };
        }
    }

    // Remove any HTML/script tags
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<[^>]+>/g, '');

    return { sanitized, blocked: false };
}
