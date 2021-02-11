import React, { Fragment } from "react";

import './styles.css';

export default function Screen({ id="", style={}, className="", children=<Fragment /> }) {

    return(
        <section id={id} style={style} className={`screen ${className}`}>
            <div className="window">
                {children}
            </div>
        </section>
    );
}