/**
 * API Client
 * 
 * Centralized API communication with the backend agent.
 */

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

export interface VersionInfo {
    id: string;
    code: string;
    plan: unknown;
    explanation: string;
    userPrompt: string;
    timestamp: string;
    type: 'generate' | 'modify' | 'rollback';
}

export interface ValidationInfo {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export interface GenerateResponse {
    success: boolean;
    version: VersionInfo;
    validation: ValidationInfo;
    steps: {
        planner: { layout: { type: string; description: string }; componentCount: number; reasoning: string };
        generator: { codeLength: number };
        explainer: { explanation: string };
    };
}

export interface ModifyResponse {
    success: boolean;
    version: VersionInfo;
    validation: ValidationInfo;
    steps: {
        modifier: { originalLength: number; newLength: number };
        explainer: { explanation: string };
    };
}

export interface VersionSummary {
    id: string;
    userPrompt: string;
    timestamp: string;
    type: string;
    codeLength: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data as T;
}

export async function generateUI(prompt: string, sessionId: string): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId }),
    });
    return handleResponse<GenerateResponse>(response);
}

export async function modifyUI(prompt: string, sessionId: string): Promise<ModifyResponse> {
    const response = await fetch(`${API_BASE}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId }),
    });
    return handleResponse<ModifyResponse>(response);
}

export async function regenerateUI(sessionId: string): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
    });
    return handleResponse<GenerateResponse>(response);
}

export async function getVersions(sessionId: string): Promise<VersionSummary[]> {
    const response = await fetch(`${API_BASE}/versions/${sessionId}`);
    const data = await handleResponse<{ success: boolean; versions: VersionSummary[] }>(response);
    return data.versions;
}

export async function rollbackVersion(sessionId: string, versionId: string): Promise<{ success: boolean; version: VersionInfo }> {
    const response = await fetch(`${API_BASE}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, versionId }),
    });
    return handleResponse(response);
}
