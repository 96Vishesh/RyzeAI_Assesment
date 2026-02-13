/**
 * Component Registry — Whitelist & Schema
 * 
 * This registry defines ALL allowed components and their props.
 * The AI agent MUST only use components listed here.
 * This is used for validation on both client and server side.
 */

export interface PropSchema {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'node' | 'function';
    required?: boolean;
    description: string;
    options?: string[];
    default?: unknown;
}

export interface ComponentSchema {
    name: string;
    description: string;
    props: PropSchema[];
    category: 'action' | 'display' | 'input' | 'layout' | 'data' | 'overlay';
}

export const COMPONENT_REGISTRY: ComponentSchema[] = [
    {
        name: 'Button',
        description: 'A clickable button component for actions and submissions.',
        category: 'action',
        props: [
            { name: 'variant', type: 'string', description: 'Visual style variant', options: ['primary', 'secondary', 'danger', 'outline'], default: 'primary' },
            { name: 'size', type: 'string', description: 'Button size', options: ['sm', 'md', 'lg'], default: 'md' },
            { name: 'children', type: 'node', required: true, description: 'Button label/content' },
            { name: 'onClick', type: 'function', description: 'Click handler function' },
            { name: 'disabled', type: 'boolean', description: 'Whether button is disabled', default: false },
        ],
    },
    {
        name: 'Card',
        description: 'A container with optional title, subtitle, body content, and footer.',
        category: 'display',
        props: [
            { name: 'title', type: 'string', description: 'Card heading text' },
            { name: 'subtitle', type: 'string', description: 'Subtitle text below heading' },
            { name: 'children', type: 'node', description: 'Card body content' },
            { name: 'footer', type: 'node', description: 'Card footer content (e.g., action buttons)' },
        ],
    },
    {
        name: 'Input',
        description: 'A text input field with optional label. Supports multiline textarea mode.',
        category: 'input',
        props: [
            { name: 'label', type: 'string', description: 'Label text above the input' },
            { name: 'placeholder', type: 'string', description: 'Placeholder text' },
            { name: 'type', type: 'string', description: 'Input type', options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'], default: 'text' },
            { name: 'value', type: 'string', description: 'Current value' },
            { name: 'onChange', type: 'function', description: 'Change handler function' },
            { name: 'disabled', type: 'boolean', description: 'Whether input is disabled', default: false },
            { name: 'multiline', type: 'boolean', description: 'Use textarea instead of input', default: false },
            { name: 'rows', type: 'number', description: 'Number of rows for multiline', default: 3 },
        ],
    },
    {
        name: 'Table',
        description: 'A data table with column headers and rows.',
        category: 'data',
        props: [
            { name: 'columns', type: 'array', required: true, description: 'Array of { key, header } column definitions' },
            { name: 'data', type: 'array', required: true, description: 'Array of row objects with values matching column keys' },
        ],
    },
    {
        name: 'Modal',
        description: 'An overlay dialog box with title, body, and footer.',
        category: 'overlay',
        props: [
            { name: 'title', type: 'string', required: true, description: 'Modal heading text' },
            { name: 'isOpen', type: 'boolean', required: true, description: 'Whether modal is visible' },
            { name: 'onClose', type: 'function', required: true, description: 'Close handler function' },
            { name: 'children', type: 'node', description: 'Modal body content' },
            { name: 'footer', type: 'node', description: 'Modal footer content (e.g., action buttons)' },
        ],
    },
    {
        name: 'Sidebar',
        description: 'A vertical navigation sidebar with brand and items.',
        category: 'layout',
        props: [
            { name: 'brand', type: 'string', description: 'Brand/title text at the top' },
            { name: 'items', type: 'array', required: true, description: 'Array of { id, label, icon? } navigation items' },
            { name: 'activeItem', type: 'string', description: 'ID of the active navigation item' },
            { name: 'onSelect', type: 'function', description: 'Selection handler function' },
        ],
    },
    {
        name: 'Navbar',
        description: 'A horizontal navigation bar with brand, links, and actions.',
        category: 'layout',
        props: [
            { name: 'brand', type: 'string', required: true, description: 'Brand/logo text' },
            { name: 'links', type: 'array', description: 'Array of { label, href?, active? } nav links' },
            { name: 'actions', type: 'node', description: 'Action elements (e.g., buttons) on the right side' },
        ],
    },
    {
        name: 'Chart',
        description: 'A bar chart for data visualization with mock data support.',
        category: 'data',
        props: [
            { name: 'type', type: 'string', description: 'Chart type', options: ['bar'], default: 'bar' },
            { name: 'data', type: 'array', required: true, description: 'Array of { label, value, color? } data items' },
            { name: 'title', type: 'string', description: 'Chart heading text' },
        ],
    },
];

/** Set of allowed component names for quick lookup */
export const ALLOWED_COMPONENTS = new Set(COMPONENT_REGISTRY.map((c) => c.name));

/** Get schema for a specific component */
export function getComponentSchema(name: string): ComponentSchema | undefined {
    return COMPONENT_REGISTRY.find((c) => c.name === name);
}

/** Layout utility classes that the AI is allowed to use */
export const ALLOWED_LAYOUT_CLASSES = [
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
];
