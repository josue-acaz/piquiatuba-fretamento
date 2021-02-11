import React, { useState } from "react";
import { InputAdorment } from "../../components";
import SearchIcon from '@material-ui/icons/Search';

import './styles.css';

export default function Search({ open, handleOpen, placeholder='', handleClose, handleChangeText }) {
    const[text, setText] = useState("");
    const handleChange = (e) => {
        const { value } = e.target;
        setText(value);
        handleChangeText(value);
    };

    const Lupa = () => (
        <div className="lupa" onClick={handleOpen}>
            <SearchIcon className="icon" />
        </div>
    );

    return(
        <div className="search-cmp">
            <InputAdorment 
                id="lupa" 
                name="lupa" 
                className="lupa"
                value={text}
                placeholder={placeholder}
                onChange={handleChange}
                adorment={Lupa()} 
            />
        </div>
    );
}