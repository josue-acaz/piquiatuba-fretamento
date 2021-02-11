import React from "react";

import './styles.css';

const Input = ({ 
    id='', 
    placeholder='', 
    type='text', 
    name,
    value, 
    style,
    decoration='primary',
    error=false,
    onChange=(e)=>e,
}) => (
    <div className="input-container">
        <input 
            id={id} 
            type={type} 
            name={name} 
            style={style}
            value={value} 
            placeholder={placeholder}
            className={`input input-${decoration}`}
            onChange={onChange} 
        />
        {error && <span className="error">Este campo é obrigatório.</span>}
    </div>
);

export default Input;