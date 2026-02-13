import React from 'react';

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="ui-modal-overlay" onClick={onClose}>
            <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ui-modal__header">
                    <h3 className="ui-modal__title">{title}</h3>
                    <button className="ui-modal__close" onClick={onClose}>×</button>
                </div>
                {children && <div className="ui-modal__body">{children}</div>}
                {footer && <div className="ui-modal__footer">{footer}</div>}
            </div>
        </div>
    );
};
