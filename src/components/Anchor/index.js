import React from "react";

import './styles.css';

const Anchor = ({ children, className="" }) => (
    <div className={`anchor ${className}`}>
        {children}
    </div>
);

export default Anchor;