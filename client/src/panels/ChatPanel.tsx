import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    steps?: {
        planner?: string;
        explanation?: string;
    };
}

interface ChatPanelProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    onRegenerate: () => void;
    isLoading: boolean;
    hasCode: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    onSendMessage,
    onRegenerate,
    isLoading,
    hasCode,
}) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="chat-panel">
            <div className="chat-panel__header">
                <div className="chat-panel__title">
                    <span className="chat-panel__icon">🤖</span>
                    AI UI Generator
                </div>
                {hasCode && (
                    <button
                        className="chat-panel__action-btn"
                        onClick={onRegenerate}
                        disabled={isLoading}
                        title="Regenerate UI"
                    >
                        🔄 Regenerate
                    </button>
                )}
            </div>

            <div className="chat-panel__messages">
                {messages.length === 0 && (
                    <div className="chat-panel__welcome">
                        <div className="chat-panel__welcome-icon">✨</div>
                        <h3>Welcome to AI UI Generator</h3>
                        <p>Describe a UI in plain English and I'll build it for you using our deterministic component library.</p>
                        <div className="chat-panel__suggestions">
                            <button onClick={() => onSendMessage('Create a dashboard with a navbar, two stats cards, and a data table')}>
                                📊 Dashboard
                            </button>
                            <button onClick={() => onSendMessage('Build a settings page with a sidebar navigation and a form with inputs')}>
                                ⚙️ Settings Page
                            </button>
                            <button onClick={() => onSendMessage('Create a landing page with a navbar, hero card, feature cards in a grid, and a chart')}>
                                🚀 Landing Page
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
                        <div className="chat-message__avatar">
                            {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : 'ℹ️'}
                        </div>
                        <div className="chat-message__content">
                            <div className="chat-message__text">{msg.content}</div>
                            {msg.steps?.explanation && (
                                <div className="chat-message__explanation">
                                    <div className="chat-message__explanation-header">
                                        💡 AI Reasoning
                                    </div>
                                    <div className="chat-message__explanation-body">
                                        {msg.steps.explanation}
                                    </div>
                                </div>
                            )}
                            {msg.steps?.planner && (
                                <div className="chat-message__step-info">
                                    <span>📋 Plan: {msg.steps.planner}</span>
                                </div>
                            )}
                            <div className="chat-message__time">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="chat-message chat-message--assistant">
                        <div className="chat-message__avatar">🤖</div>
                        <div className="chat-message__content">
                            <div className="chat-message__loading">
                                <div className="chat-message__loading-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <span className="chat-message__loading-text">
                                    Generating UI...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-panel__input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-panel__input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={hasCode ? 'Describe changes to the UI...' : 'Describe a UI to generate...'}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="chat-panel__send-btn"
                    disabled={!input.trim() || isLoading}
                >
                    ➤
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
export type { Message };
