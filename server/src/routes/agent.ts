/**
 * Agent API Routes
 * 
 * Exposes the multi-step AI agent pipeline via REST endpoints:
 * - POST /api/generate — New UI from prompt
 * - POST /api/modify — Incremental edit
 * - POST /api/regenerate — Re-generate current
 * - GET /api/versions/:sessionId — Version history
 * - POST /api/rollback — Rollback to version
 */

import { Router, Request, Response } from 'express';
import { runPlanner } from '../agent/planner.js';
import { runGenerator, runModifier } from '../agent/generator.js';
import { runExplainer, runModificationExplainer } from '../agent/explainer.js';
import { validateGeneratedCode } from '../validation/codeValidator.js';
import { sanitizePrompt } from '../validation/sanitizer.js';
import { versionStore } from '../storage/versionStore.js';

export const agentRouter = Router();

/**
 * POST /api/generate
 * Full pipeline: Planner → Generator → Explainer
 */
agentRouter.post('/generate', async (req: Request, res: Response) => {
    try {
        const { prompt, sessionId } = req.body;

        if (!prompt || !sessionId) {
            return res.status(400).json({ error: 'Missing prompt or sessionId' });
        }

        // Step 0: Sanitize input
        const sanitized = sanitizePrompt(prompt);
        if (sanitized.blocked) {
            return res.status(400).json({ error: sanitized.reason });
        }

        // Step 1: Planner
        console.log(`[Planner] Processing: "${sanitized.sanitized.substring(0, 100)}..."`);
        const plan = await runPlanner(sanitized.sanitized);
        console.log(`[Planner] Plan created: ${plan.components.length} components, layout: ${plan.layout.type}`);

        // Step 2: Generator
        console.log(`[Generator] Generating code...`);
        const code = await runGenerator(plan);
        console.log(`[Generator] Code generated: ${code.length} chars`);

        // Step 3: Validate
        const validation = validateGeneratedCode(code);
        console.log(`[Validator] Valid: ${validation.valid}, Errors: ${validation.errors.length}, Warnings: ${validation.warnings.length}`);

        // Step 4: Explainer
        console.log(`[Explainer] Generating explanation...`);
        const explanation = await runExplainer(sanitized.sanitized, plan, code);

        // Step 5: Store version
        const version = versionStore.addVersion(
            sessionId, code, plan, explanation, sanitized.sanitized, 'generate'
        );

        res.json({
            success: true,
            version,
            validation,
            steps: {
                planner: { layout: plan.layout, componentCount: plan.components.length, reasoning: plan.reasoning },
                generator: { codeLength: code.length },
                explainer: { explanation },
            },
        });
    } catch (error) {
        console.error('[Generate Error]', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to generate UI',
        });
    }
});

/**
 * POST /api/modify
 * Incremental edit: Modifier → Explainer
 */
agentRouter.post('/modify', async (req: Request, res: Response) => {
    try {
        const { prompt, sessionId } = req.body;

        if (!prompt || !sessionId) {
            return res.status(400).json({ error: 'Missing prompt or sessionId' });
        }

        // Sanitize
        const sanitized = sanitizePrompt(prompt);
        if (sanitized.blocked) {
            return res.status(400).json({ error: sanitized.reason });
        }

        // Get current code
        const latest = versionStore.getLatestVersion(sessionId);
        if (!latest) {
            return res.status(400).json({ error: 'No existing UI to modify. Use /generate first.' });
        }

        // Step 1: Modify existing code
        console.log(`[Modifier] Modifying code...`);
        const modifiedCode = await runModifier(latest.code, sanitized.sanitized);

        // Step 2: Validate
        const validation = validateGeneratedCode(modifiedCode);
        console.log(`[Validator] Valid: ${validation.valid}, Errors: ${validation.errors.length}`);

        // Step 3: Explain changes
        console.log(`[Explainer] Explaining modifications...`);
        const explanation = await runModificationExplainer(latest.code, modifiedCode, sanitized.sanitized);

        // Step 4: Store version
        const version = versionStore.addVersion(
            sessionId, modifiedCode, latest.plan, explanation, sanitized.sanitized, 'modify'
        );

        res.json({
            success: true,
            version,
            validation,
            steps: {
                modifier: { originalLength: latest.code.length, newLength: modifiedCode.length },
                explainer: { explanation },
            },
        });
    } catch (error) {
        console.error('[Modify Error]', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to modify UI',
        });
    }
});

/**
 * POST /api/regenerate
 * Re-generate from the original prompt
 */
agentRouter.post('/regenerate', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        const latest = versionStore.getLatestVersion(sessionId);
        if (!latest) {
            return res.status(400).json({ error: 'No existing UI to regenerate.' });
        }

        // Re-run the full pipeline with the latest user prompt
        const plan = await runPlanner(latest.userPrompt);
        const code = await runGenerator(plan);
        const validation = validateGeneratedCode(code);
        const explanation = await runExplainer(latest.userPrompt, plan, code);

        const version = versionStore.addVersion(
            sessionId, code, plan, explanation, latest.userPrompt, 'generate'
        );

        res.json({
            success: true,
            version,
            validation,
            steps: {
                planner: { layout: plan.layout, componentCount: plan.components.length },
                generator: { codeLength: code.length },
                explainer: { explanation },
            },
        });
    } catch (error) {
        console.error('[Regenerate Error]', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to regenerate UI',
        });
    }
});

/**
 * GET /api/versions/:sessionId
 * Get version history
 */
agentRouter.get('/versions/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const versions = versionStore.getVersions(sessionId);

    res.json({
        success: true,
        versions: versions.map((v) => ({
            id: v.id,
            userPrompt: v.userPrompt,
            timestamp: v.timestamp,
            type: v.type,
            codeLength: v.code.length,
        })),
    });
});

/**
 * POST /api/rollback
 * Rollback to a specific version
 */
agentRouter.post('/rollback', (req: Request, res: Response) => {
    const { sessionId, versionId } = req.body;

    if (!sessionId || !versionId) {
        return res.status(400).json({ error: 'Missing sessionId or versionId' });
    }

    const version = versionStore.rollbackTo(sessionId, versionId);
    if (!version) {
        return res.status(404).json({ error: 'Version not found' });
    }

    res.json({
        success: true,
        version,
    });
});
