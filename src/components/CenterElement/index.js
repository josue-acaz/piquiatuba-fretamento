import React from "react";

import './styles.css';

export default function CenterElement({ children }) {

    return(
        <div className="centerel">
            {children}
        </div>
    );
}
