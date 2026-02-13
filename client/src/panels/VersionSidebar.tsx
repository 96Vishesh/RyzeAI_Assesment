import React from 'react';

interface VersionItem {
    id: string;
    userPrompt: string;
    timestamp: string;
    type: string;
    codeLength: number;
}

interface VersionSidebarProps {
    versions: VersionItem[];
    currentVersionId?: string;
    onRollback: (versionId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const VersionSidebar: React.FC<VersionSidebarProps> = ({
    versions,
    currentVersionId,
    onRollback,
    isOpen,
    onToggle,
}) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'generate': return '✨';
            case 'modify': return '✏️';
            case 'rollback': return '⏪';
            default: return '📄';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'generate': return 'Generated';
            case 'modify': return 'Modified';
            case 'rollback': return 'Rollback';
            default: return type;
        }
    };

    return (
        <>
            <button
                className={`version-toggle ${isOpen ? 'version-toggle--active' : ''}`}
                onClick={onToggle}
                title="Version History"
            >
                🕐 History ({versions.length})
            </button>

            {isOpen && (
                <div className="version-sidebar">
                    <div className="version-sidebar__header">
                        <h3>Version History</h3>
                        <button className="version-sidebar__close" onClick={onToggle}>×</button>
                    </div>
                    <div className="version-sidebar__list">
                        {versions.length === 0 ? (
                            <div className="version-sidebar__empty">
                                No versions yet
                            </div>
                        ) : (
                            [...versions].reverse().map((version, index) => (
                                <div
                                    key={version.id}
                                    className={`version-item ${currentVersionId === version.id ? 'version-item--active' : ''}`}
                                >
                                    <div className="version-item__header">
                                        <span className="version-item__icon">{getTypeIcon(version.type)}</span>
                                        <span className="version-item__type">{getTypeLabel(version.type)}</span>
                                        <span className="version-item__number">v{versions.length - index}</span>
                                    </div>
                                    <p className="version-item__prompt">
                                        {version.userPrompt.length > 80
                                            ? version.userPrompt.substring(0, 80) + '...'
                                            : version.userPrompt}
                                    </p>
                                    <div className="version-item__footer">
                                        <span className="version-item__time">
                                            {new Date(version.timestamp).toLocaleTimeString()}
                                        </span>
                                        {currentVersionId !== version.id && (
                                            <button
                                                className="version-item__rollback"
                                                onClick={() => onRollback(version.id)}
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default VersionSidebar;
