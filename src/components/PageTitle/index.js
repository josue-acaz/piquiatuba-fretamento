import React from "react";

import './styles.css';

export default function PageTitle({ title, subtitle }) {

    return(
        <div className="pagetitle">
            <p className="subtitle">{subtitle}</p>
            <p className="title">{title}</p>
        </div>
    );
}