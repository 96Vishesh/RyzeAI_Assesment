import React from 'react';

interface SidebarItem {
    id: string;
    label: string;
    icon?: string;
}

interface SidebarProps {
    brand?: string;
    items: SidebarItem[];
    activeItem?: string;
    onSelect?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ brand, items, activeItem, onSelect }) => {
    return (
        <div className="ui-sidebar">
            {brand && (
                <div className="ui-sidebar__header">
                    <h2 className="ui-sidebar__brand">{brand}</h2>
                </div>
            )}
            <nav className="ui-sidebar__nav">
                {items.map((item) => (
                    <a
                        key={item.id}
                        className={`ui-sidebar__item ${activeItem === item.id ? 'ui-sidebar__item--active' : ''}`}
                        onClick={() => onSelect?.(item.id)}
                    >
                        {item.icon && <span>{item.icon}</span>} {item.label}
                    </a>
                ))}
            </nav>
        </div>
    );
};
