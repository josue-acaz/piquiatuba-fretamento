import React from "react";
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@material-ui/icons/CheckBoxOutlineBlankOutlined';

import './styles.css';

export default function Checkbox({ id="", name="", className="", checked=false, onChange=(e)=>e }) {

    const checkedIcon = <CheckBoxOutlinedIcon className="icon" />;
    const notCheckedIcon = <CheckBoxOutlineBlankOutlinedIcon className="icon" />;

    return(
        <div className="checkbox">
            <input 
                id={id}
                name={name}
                className={className}
                type="checkbox" 
                checked={checked} 
                onChange={onChange}
            />
            <span className="checkmark">{checked ? checkedIcon : notCheckedIcon}</span>
        </div>
    )
}