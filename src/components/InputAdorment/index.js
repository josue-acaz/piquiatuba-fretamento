import React, { Fragment } from "react";

import './styles.css';

const InputAdorment = ({ 
    id="", 
    placeholder="", 
    type="text", 
    name="", 
    value, 
    className="",
    adormentPosition="start",
    onChange=(e)=>e,
    decoration='primary',
    adorment=<Fragment />,
    error=false,
}) => (
    <div className="input-container">
        <div className={`input-adorment input-adorment-${adormentPosition} ${className}`}>
            <input 
                id={id} 
                type={type} 
                name={name} 
                value={value} 
                placeholder={placeholder}
                className={`input input-${adormentPosition} ${decoration}-input`}
                onChange={onChange} 
            />
            <span className={`adorment adorment-${adormentPosition} adorment-${decoration}`}>{adorment}</span>
        </div>
        {error && <span className="error">Este campo é obrigatório.</span>}
    </div>
);

export default InputAdorment;