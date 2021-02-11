import React, { useState, Fragment } from "react";
import Base from "./Base";
import { sleep } from "../../utils";
import api from "../../api";

import './styles.css';

export default function Autocomplete({ 
    id="", 
    icon=<Fragment />, 
    filter="", 
    placeholder="", 
    url="", 
    inputValue="",
    resource="",
    params={ city: "", uf: "", transport: "" }, 
    handleOptionSelected=(op={})=>op 
}) {
    const[open, setOpen] = useState(false);
    const[loading, setLoading] = useState(false);

    const index = async(text="") => {
        let data = [];
        setLoading(true);
        try {
            const query = { 
                filter, 
                text, 
                ...params
            };

            const response = await api.get(url, { params: query });
            data = response.data;
            await sleep(1e3);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }

        return data;
    }

    return (
        <Base 
            id={id}
            className="xAutocomplete"
            open={open}
            loading={loading} 
            icon={icon}
            resource={resource}
            params={params}
            inputValue={inputValue}
            placeholder={placeholder}
            iconPosition="start"
            getOptionSelected={handleOptionSelected}
            handleOpen={() => { setOpen(true) }}
            handleClose={() => { setOpen(false) }}
            onChangeText={index}
        />
    );
}