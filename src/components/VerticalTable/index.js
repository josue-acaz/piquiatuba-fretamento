import React from 'react';

import './styles.css';

export default function VerticalTable({rows}) {

    return(
        <table id="custom-table" className="custom-table" style={{width: '100%'}}>
            {rows.map(row => (
                <tr key={row.id}>
                    <th className="cs-th">{row.label}</th>
                    <td className="cs-td">{row.text}</td>
                </tr>
            ))}
        </table>
    );
}