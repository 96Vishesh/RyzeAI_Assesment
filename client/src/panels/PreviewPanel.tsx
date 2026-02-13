import React, { useEffect, useRef } from 'react';
import componentCSS from '../components/ui/components.css?raw';

interface PreviewPanelProps {
  code: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !code) return;

    // Transform the code to be renderable in an iframe
    // We strip imports and create a self-contained HTML page
    const transformedCode = code
      .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '') // Remove imports
      .replace(/export\s+default\s+/g, '') // Remove export default
      .replace(/export\s+/g, ''); // Remove other exports

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    ${componentCSS}
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <script type="text/babel">
    // Component definitions for the preview
    const Button = ({ variant = 'primary', size = 'md', children, onClick, disabled = false, type = 'button' }) => {
      const classes = ['ui-button', 'ui-button--' + variant, size !== 'md' ? 'ui-button--' + size : ''].filter(Boolean).join(' ');
      return React.createElement('button', { className: classes, onClick, disabled, type }, children);
    };

    const Card = ({ title, subtitle, children, footer }) => {
      return React.createElement('div', { className: 'ui-card' },
        (title || subtitle) && React.createElement('div', { className: 'ui-card__header' },
          title && React.createElement('h3', { className: 'ui-card__title' }, title),
          subtitle && React.createElement('p', { className: 'ui-card__subtitle' }, subtitle)
        ),
        children && React.createElement('div', { className: 'ui-card__body' }, children),
        footer && React.createElement('div', { className: 'ui-card__footer' }, footer)
      );
    };

    const Input = ({ label, placeholder, type = 'text', value, onChange, disabled = false, multiline = false, rows = 3 }) => {
      return React.createElement('div', { className: 'ui-input-group' },
        label && React.createElement('label', { className: 'ui-input-group__label' }, label),
        multiline
          ? React.createElement('textarea', { className: 'ui-textarea', placeholder, value, onChange: e => onChange?.(e.target.value), disabled, rows })
          : React.createElement('input', { className: 'ui-input', type, placeholder, value, onChange: e => onChange?.(e.target.value), disabled })
      );
    };

    const Table = ({ columns, data }) => {
      return React.createElement('div', { className: 'ui-table-wrapper' },
        React.createElement('table', { className: 'ui-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              columns.map((col, i) => React.createElement('th', { key: i }, col.header))
            )
          ),
          React.createElement('tbody', null,
            data.map((row, i) => React.createElement('tr', { key: i },
              columns.map((col, j) => React.createElement('td', { key: j }, row[col.key]))
            ))
          )
        )
      );
    };

    const Modal = ({ title, isOpen, onClose, children, footer }) => {
      if (!isOpen) return null;
      return React.createElement('div', { className: 'ui-modal-overlay', onClick: onClose },
        React.createElement('div', { className: 'ui-modal', onClick: e => e.stopPropagation() },
          React.createElement('div', { className: 'ui-modal__header' },
            React.createElement('h3', { className: 'ui-modal__title' }, title),
            React.createElement('button', { className: 'ui-modal__close', onClick: onClose }, '×')
          ),
          children && React.createElement('div', { className: 'ui-modal__body' }, children),
          footer && React.createElement('div', { className: 'ui-modal__footer' }, footer)
        )
      );
    };

    const Sidebar = ({ brand, items, activeItem, onSelect }) => {
      return React.createElement('div', { className: 'ui-sidebar' },
        brand && React.createElement('div', { className: 'ui-sidebar__header' },
          React.createElement('h2', { className: 'ui-sidebar__brand' }, brand)
        ),
        React.createElement('nav', { className: 'ui-sidebar__nav' },
          items.map((item, i) => React.createElement('a', {
            key: i,
            className: 'ui-sidebar__item' + (activeItem === item.id ? ' ui-sidebar__item--active' : ''),
            onClick: () => onSelect?.(item.id)
          }, item.icon ? item.icon + ' ' : '', item.label))
        )
      );
    };

    const Navbar = ({ brand, links = [], actions }) => {
      return React.createElement('nav', { className: 'ui-navbar' },
        React.createElement('span', { className: 'ui-navbar__brand' }, brand),
        links.length > 0 && React.createElement('ul', { className: 'ui-navbar__links' },
          links.map((link, i) => React.createElement('li', { key: i },
            React.createElement('a', {
              className: 'ui-navbar__link' + (link.active ? ' ui-navbar__link--active' : ''),
              href: link.href || '#'
            }, link.label)
          ))
        ),
        actions && React.createElement('div', { className: 'ui-navbar__actions' }, actions)
      );
    };

    const Chart = ({ data, title }) => {
      const maxValue = Math.max(...data.map(d => d.value), 1);
      return React.createElement('div', { className: 'ui-chart' },
        title && React.createElement('h3', { className: 'ui-chart__title' }, title),
        React.createElement('div', { className: 'ui-chart__container' },
          data.map((item, i) => {
            const heightPercent = (item.value / maxValue) * 100;
            return React.createElement('div', {
              key: i,
              className: 'ui-chart__bar',
              style: { height: heightPercent + '%', backgroundColor: item.color || 'var(--ui-primary)' }
            },
              React.createElement('span', { className: 'ui-chart__bar-value' }, item.value),
              React.createElement('span', { className: 'ui-chart__bar-label' }, item.label)
            );
          })
        )
      );
    };

    const { useState } = React;

    try {
      ${transformedCode}
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(GeneratedUI));
    } catch (error) {
      document.getElementById('root').innerHTML = '<div style="padding:24px;color:#ef4444;font-family:Inter,sans-serif"><h3>⚠️ Preview Error</h3><pre style="margin-top:8px;font-size:13px;white-space:pre-wrap">' + error.message + '</pre></div>';
    }
  <\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    // Cleanup
    return () => URL.revokeObjectURL(url);
  }, [code]);

  return (
    <div className="preview-panel">
      <div className="preview-panel__header">
        <div className="preview-panel__title">
          <span className="preview-panel__icon">👁️</span>
          Live Preview
        </div>
        <div className="preview-panel__status">
          {code ? (
            <span className="preview-panel__live-badge">● Live</span>
          ) : (
            <span className="preview-panel__idle-badge">○ Idle</span>
          )}
        </div>
      </div>
      <div className="preview-panel__content">
        {!code ? (
          <div className="preview-panel__empty">
            <div className="preview-panel__empty-icon">🖼️</div>
            <p>Preview will appear here</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="preview-panel__iframe"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
