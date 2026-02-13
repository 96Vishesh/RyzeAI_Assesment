import React from 'react';

interface ChartDataItem {
    label: string;
    value: number;
    color?: string;
}

interface ChartProps {
    type?: 'bar';
    data: ChartDataItem[];
    title?: string;
}

export const Chart: React.FC<ChartProps> = ({ data, title }) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="ui-chart">
            {title && <h3 className="ui-chart__title">{title}</h3>}
            <div className="ui-chart__container">
                {data.map((item, i) => {
                    const heightPercent = (item.value / maxValue) * 100;
                    return (
                        <div
                            key={i}
                            className="ui-chart__bar"
                            style={{
                                height: `${heightPercent}%`,
                                backgroundColor: item.color || 'var(--ui-primary)',
                            }}
                        >
                            <span className="ui-chart__bar-value">{item.value}</span>
                            <span className="ui-chart__bar-label">{item.label}</span>
                        </div>
                    );
                })}
            </div>
            {data.some((d) => d.color) && (
                <div className="ui-chart__legend">
                    {data.map((item, i) => (
                        <div className="ui-chart__legend-item" key={i}>
                            <div
                                className="ui-chart__legend-color"
                                style={{ backgroundColor: item.color || 'var(--ui-primary)' }}
                            />
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
