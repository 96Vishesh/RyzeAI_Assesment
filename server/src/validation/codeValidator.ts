/**
 * Code Validator & Whitelist Enforcement
 * 
 * Validates generated code to ensure it only uses whitelisted components
 * and follows the deterministic component system rules.
 */

const ALLOWED_COMPONENTS = new Set([
    'Button', 'Card', 'Input', 'Table', 'Modal', 'Sidebar', 'Navbar', 'Chart',
]);

const ALLOWED_LAYOUT_CLASSES = new Set([
    'ui-layout-flex', 'ui-layout-flex-col', 'ui-layout-grid-2', 'ui-layout-grid-3', 'ui-layout-grid-4',
    'ui-layout-center', 'ui-layout-between',
    'ui-gap-sm', 'ui-gap-md', 'ui-gap-lg', 'ui-gap-xl',
    'ui-p-sm', 'ui-p-md', 'ui-p-lg', 'ui-p-xl',
    'ui-mt-sm', 'ui-mt-md', 'ui-mt-lg',
    'ui-w-full', 'ui-flex-1',
    'ui-text-center', 'ui-text-sm', 'ui-text-lg', 'ui-text-xl',
    'ui-font-bold', 'ui-font-medium',
    'ui-heading', 'ui-text-muted', 'ui-container',
    'ui-badge', 'ui-badge--primary', 'ui-badge--success', 'ui-badge--danger', 'ui-badge--warning',
]);

const ALLOWED_HTML_ELEMENTS = new Set([
    'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'img', 'a', 'ul', 'ol', 'li', 'strong', 'em',
]);

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateGeneratedCode(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check for inline styles
    const inlineStyleRegex = /style\s*=\s*\{\{/g;
    const inlineMatches = code.match(inlineStyleRegex);
    if (inlineMatches) {
        // Allow inline styles only for Chart component (dynamic bar heights)
        const chartStyleContext = /className="ui-chart__bar"[\s\S]{0,50}style/;
        if (!chartStyleContext.test(code)) {
            warnings.push(`Found ${inlineMatches.length} inline style(s). Only Chart bar heights are allowed.`);
        }
    }

    // 2. Check for non-whitelisted component usage (PascalCase JSX tags)
    const jsxComponentRegex = /<([A-Z][a-zA-Z]*)/g;
    let match;
    const usedComponents = new Set<string>();
    while ((match = jsxComponentRegex.exec(code)) !== null) {
        usedComponents.add(match[1]);
    }

    for (const comp of usedComponents) {
        // React.Fragment and React built-ins are okay
        if (comp === 'React' || comp === 'Fragment') continue;
        if (!ALLOWED_COMPONENTS.has(comp)) {
            errors.push(`Non-whitelisted component used: <${comp}>. Only these are allowed: ${[...ALLOWED_COMPONENTS].join(', ')}`);
        }
    }

    // 3. Check for external imports
    const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(code)) !== null) {
        const importPath = match[1];
        if (importPath !== 'react' && importPath !== './components/ui') {
            errors.push(`Non-allowed import: "${importPath}". Only 'react' and './components/ui' are permitted.`);
        }
    }

    // 4. Check for default export
    if (!code.includes('export default')) {
        errors.push('Missing default export. Component must have a default export.');
    }

    // 5. Check for class names that aren't whitelisted
    const classNameRegex = /className="([^"]+)"/g;
    while ((match = classNameRegex.exec(code)) !== null) {
        const classes = match[1].split(/\s+/);
        for (const cls of classes) {
            if (cls && !ALLOWED_LAYOUT_CLASSES.has(cls)) {
                warnings.push(`Potentially non-whitelisted class: "${cls}"`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
