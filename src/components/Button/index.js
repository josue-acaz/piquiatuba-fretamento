import React from 'react';

import './styles.css';

const Button = ({children, type}) => (
    <button type={type} className="pqb-button">
        {children}
    </button>
);

export default Button;
