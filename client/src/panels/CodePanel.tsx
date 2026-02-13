import React, { useEffect, useRef } from 'react';

interface CodePanelProps {
    code: string;
    onCodeChange: (code: string) => void;
    isEditable: boolean;
}

// Simple syntax highlighting via regex
function highlightCode(code: string): string {
    return code
        // Strings
        .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="syntax-string">$&</span>')
        // Keywords
        .replace(/\b(import|from|export|default|function|const|let|var|return|if|else|true|false|null|undefined|new|typeof|void)\b/g, '<span class="syntax-keyword">$&</span>')
        // React/JSX
        .replace(/\b(React|useState|useEffect|useRef)\b/g, '<span class="syntax-builtin">$&</span>')
        // Components (PascalCase)
        .replace(/\b(Button|Card|Input|Table|Modal|Sidebar|Navbar|Chart|GeneratedUI)\b/g, '<span class="syntax-component">$&</span>')
        // Comments
        .replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$&</span>')
        // JSX attributes
        .replace(/\b(\w+)=/g, '<span class="syntax-attr">$1</span>=');
}

const CodePanel: React.FC<CodePanelProps> = ({ code, onCodeChange, isEditable }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        if (textareaRef.current && preRef.current) {
            textareaRef.current.scrollTop = preRef.current.scrollTop;
        }
    }, [code]);

    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const lineCount = code ? code.split('\n').length : 0;

    return (
        <div className="code-panel">
            <div className="code-panel__header">
                <div className="code-panel__title">
                    <span className="code-panel__icon">📝</span>
                    Generated Code
                </div>
                <div className="code-panel__meta">
                    {code && (
                        <>
                            <span className="code-panel__badge">{lineCount} lines</span>
                            <span className="code-panel__badge">React/JSX</span>
                        </>
                    )}
                </div>
            </div>

            <div className="code-panel__content">
                {!code ? (
                    <div className="code-panel__empty">
                        <div className="code-panel__empty-icon">{'</>'}</div>
                        <p>Generated code will appear here</p>
                    </div>
                ) : (
                    <div className="code-panel__editor">
                        <div className="code-panel__line-numbers">
                            {Array.from({ length: lineCount }, (_, i) => (
                                <span key={i}>{i + 1}</span>
                            ))}
                        </div>
                        <div className="code-panel__code-area">
                            <pre
                                ref={preRef}
                                className="code-panel__highlighted"
                                dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
                            />
                            {isEditable && (
                                <textarea
                                    ref={textareaRef}
                                    className="code-panel__textarea"
                                    value={code}
                                    onChange={(e) => onCodeChange(e.target.value)}
                                    onScroll={handleScroll}
                                    spellCheck={false}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodePanel;
