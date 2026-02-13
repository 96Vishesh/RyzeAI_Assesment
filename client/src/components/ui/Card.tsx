import React from 'react';

interface CardProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, footer }) => {
    return (
        <div className="ui-card">
            {(title || subtitle) && (
                <div className="ui-card__header">
                    {title && <h3 className="ui-card__title">{title}</h3>}
                    {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
                </div>
            )}
            {children && <div className="ui-card__body">{children}</div>}
            {footer && <div className="ui-card__footer">{footer}</div>}
        </div>
    );
};
