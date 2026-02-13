import React from 'react';

interface Column {
    key: string;
    header: string;
}

interface TableProps {
    columns: Column[];
    data: Record<string, React.ReactNode>[];
}

export const Table: React.FC<TableProps> = ({ columns, data }) => {
    return (
        <div className="ui-table-wrapper">
            <table className="ui-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {columns.map((col) => (
                                <td key={col.key}>{row[col.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
