import React from 'react';
import './styles.css';

const TextArea = ({
    id='',
    name,
    value,
    placeholder='',
    error=false,
    onChange = () => {},
}) => (
    <div className="custom-text-area">
        <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} />
        {error && <span className="error">Este campo é obrigatório.</span>}
    </div>
);

export default TextArea;