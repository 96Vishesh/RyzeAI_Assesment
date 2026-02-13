import React from 'react';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    disabled = false,
    type = 'button',
}) => {
    const classes = [
        'ui-button',
        `ui-button--${variant}`,
        size !== 'md' ? `ui-button--${size}` : '',
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} onClick={onClick} disabled={disabled} type={type}>
            {children}
        </button>
    );
};
