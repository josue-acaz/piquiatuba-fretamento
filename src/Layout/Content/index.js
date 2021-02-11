import React from "react";

import './styles.css';

export default function Content({ children, className="", style={} }) {

    return(
        <div style={style} className={`main ${className}`}>
            {children}
        </div>
    );
}