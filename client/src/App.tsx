import { useState, useCallback, useRef } from 'react';
import ChatPanel from './panels/ChatPanel';
import CodePanel from './panels/CodePanel';
import PreviewPanel from './panels/PreviewPanel';
import VersionSidebar from './panels/VersionSidebar';
import { generateUI, modifyUI, regenerateUI, getVersions, rollbackVersion } from './api';
import type { Message } from './panels/ChatPanel';
import type { VersionSummary } from './api';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>();
  const [showVersions, setShowVersions] = useState(false);
  const sessionIdRef = useRef(`session-${Date.now()}`);

  const addMessage = useCallback((role: Message['role'], content: string, steps?: Message['steps']) => {
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      steps,
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const refreshVersions = useCallback(async () => {
    try {
      const v = await getVersions(sessionIdRef.current);
      setVersions(v);
    } catch { /* ignore */ }
  }, []);

  const handleSendMessage = useCallback(async (prompt: string) => {
    addMessage('user', prompt);
    setIsLoading(true);

    try {
      const hasExistingCode = code.trim().length > 0;

      if (hasExistingCode) {
        // Modify existing UI
        const result = await modifyUI(prompt, sessionIdRef.current);
        setCode(result.version.code);
        setCurrentVersionId(result.version.id);
        addMessage('assistant', '✅ UI updated successfully!', {
          explanation: result.steps.explainer.explanation,
        });

        if (!result.validation.valid) {
          addMessage('system', `⚠️ Validation warnings: ${result.validation.errors.join(', ')}`);
        }
      } else {
        // Generate new UI
        const result = await generateUI(prompt, sessionIdRef.current);
        setCode(result.version.code);
        setCurrentVersionId(result.version.id);
        addMessage('assistant', '✅ UI generated successfully!', {
          planner: `${result.steps.planner.componentCount} components, ${result.steps.planner.layout.type} layout`,
          explanation: result.steps.explainer.explanation,
        });

        if (!result.validation.valid) {
          addMessage('system', `⚠️ Validation warnings: ${result.validation.errors.join(', ')}`);
        }
      }

      await refreshVersions();
    } catch (error) {
      addMessage('assistant', `❌ Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, addMessage, refreshVersions]);

  const handleRegenerate = useCallback(async () => {
    setIsLoading(true);
    addMessage('system', '🔄 Regenerating UI...');

    try {
      const result = await regenerateUI(sessionIdRef.current);
      setCode(result.version.code);
      setCurrentVersionId(result.version.id);
      addMessage('assistant', '✅ UI regenerated!', {
        planner: `${result.steps.planner.componentCount} components`,
        explanation: result.steps.explainer.explanation,
      });
      await refreshVersions();
    } catch (error) {
      addMessage('assistant', `❌ Error: ${error instanceof Error ? error.message : 'Regeneration failed'}`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, refreshVersions]);

  const handleRollback = useCallback(async (versionId: string) => {
    try {
      const result = await rollbackVersion(sessionIdRef.current, versionId);
      setCode(result.version.code);
      setCurrentVersionId(result.version.id);
      addMessage('system', `⏪ Rolled back to previous version`);
      await refreshVersions();
    } catch (error) {
      addMessage('assistant', `❌ Error: ${error instanceof Error ? error.message : 'Rollback failed'}`);
    }
  }, [addMessage, refreshVersions]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo">⚡</span>
          <span className="app__title">RyzeAI UI Generator</span>
        </div>
        <div className="app__actions">
          <VersionSidebar
            versions={versions}
            currentVersionId={currentVersionId}
            onRollback={handleRollback}
            isOpen={showVersions}
            onToggle={() => setShowVersions(!showVersions)}
          />
        </div>
      </header>

      <main className="app__main">
        <div className="app__panel app__panel--chat">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
            hasCode={code.trim().length > 0}
          />
        </div>

        <div className="app__panel app__panel--code">
          <CodePanel
            code={code}
            onCodeChange={handleCodeChange}
            isEditable={!isLoading}
          />
        </div>

        <div className="app__panel app__panel--preview">
          <PreviewPanel code={code} />
        </div>
      </main>
    </div>
  );
}

export default App;
