/**
 * Version Store
 * 
 * In-memory version history management per session.
 * Stores each generated/modified UI version for rollback support.
 */

import { v4 as uuidv4 } from 'uuid';
import type { UIPlan } from '../agent/planner.js';

export interface Version {
    id: string;
    code: string;
    plan: UIPlan | null;
    explanation: string;
    userPrompt: string;
    timestamp: string;
    type: 'generate' | 'modify' | 'rollback';
}

class VersionStore {
    private versions: Map<string, Version[]> = new Map();

    /**
     * Get or create a session's version history
     */
    private getSessionVersions(sessionId: string): Version[] {
        if (!this.versions.has(sessionId)) {
            this.versions.set(sessionId, []);
        }
        return this.versions.get(sessionId)!;
    }

    /**
     * Add a new version to a session
     */
    addVersion(
        sessionId: string,
        code: string,
        plan: UIPlan | null,
        explanation: string,
        userPrompt: string,
        type: 'generate' | 'modify' | 'rollback'
    ): Version {
        const version: Version = {
            id: uuidv4(),
            code,
            plan,
            explanation,
            userPrompt,
            timestamp: new Date().toISOString(),
            type,
        };

        this.getSessionVersions(sessionId).push(version);
        return version;
    }

    /**
     * Get all versions for a session
     */
    getVersions(sessionId: string): Version[] {
        return this.getSessionVersions(sessionId);
    }

    /**
     * Get a specific version
     */
    getVersion(sessionId: string, versionId: string): Version | undefined {
        return this.getSessionVersions(sessionId).find((v) => v.id === versionId);
    }

    /**
     * Get the latest version for a session
     */
    getLatestVersion(sessionId: string): Version | undefined {
        const versions = this.getSessionVersions(sessionId);
        return versions.length > 0 ? versions[versions.length - 1] : undefined;
    }

    /**
     * Rollback to a specific version (adds a new version entry)
     */
    rollbackTo(sessionId: string, versionId: string): Version | undefined {
        const targetVersion = this.getVersion(sessionId, versionId);
        if (!targetVersion) return undefined;

        return this.addVersion(
            sessionId,
            targetVersion.code,
            targetVersion.plan,
            `Rolled back to version from ${targetVersion.timestamp}`,
            `Rollback to version ${versionId}`,
            'rollback'
        );
    }

    /**
     * Clear all versions for a session
     */
    clearSession(sessionId: string): void {
        this.versions.delete(sessionId);
    }
}

// Singleton instance
export const versionStore = new VersionStore();
