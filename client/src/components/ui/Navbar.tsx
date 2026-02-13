import React from 'react';

interface NavLink {
    label: string;
    href?: string;
    active?: boolean;
}

interface NavbarProps {
    brand: string;
    links?: NavLink[];
    actions?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ brand, links = [], actions }) => {
    return (
        <nav className="ui-navbar">
            <span className="ui-navbar__brand">{brand}</span>
            {links.length > 0 && (
                <ul className="ui-navbar__links">
                    {links.map((link, i) => (
                        <li key={i}>
                            <a
                                className={`ui-navbar__link ${link.active ? 'ui-navbar__link--active' : ''}`}
                                href={link.href || '#'}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
            {actions && <div className="ui-navbar__actions">{actions}</div>}
        </nav>
    );
};
