import React from 'react';

interface InputProps {
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    disabled = false,
    multiline = false,
    rows = 3,
}) => {
    return (
        <div className="ui-input-group">
            {label && <label className="ui-input-group__label">{label}</label>}
            {multiline ? (
                <textarea
                    className="ui-textarea"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    rows={rows}
                />
            ) : (
                <input
                    className="ui-input"
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                />
            )}
        </div>
    );
};
