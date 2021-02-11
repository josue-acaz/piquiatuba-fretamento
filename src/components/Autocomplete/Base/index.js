import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Spinner } from '../../../components';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import './styles.css';

function useOutsideAutocomplete(ref, onClickOutside=(clickedOutside=false)=>clickedOutside) {
    useEffect(() => {
        /**
         * If clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                onClickOutside(true);
            } else { onClickOutside(false); }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onClickOutside]);
}

export default function Base({ 
    id="",
    open=false, 
    loading=false, 
    className="", 
    placeholder="",
    inputValue="",
    icon=<Fragment />,
    noIcon=false,
    getOptionSelected = (op={}) => op,
    iconPosition="start",
    onChangeText=() => [],
    handleOpen=()=>{},
    resource="",
    params={
        city: "",
        uf: "",
        transport: ""
    },
    handleClose=()=>{},
    noResultsText="Nenhum resultado encontrado!",
    loadingOptionsTxt="Carregando..."
}) {
    const[visible, setVisible] = useState(open);
    const[value, setValue] = useState("");
    const[options, setOptions] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setValue(inputValue);
    }, [inputValue]);

    // Aerodromo
    useEffect(() => {
        if(resource === "aerodrome") {
            setValue("");
        }
    }, [params.city, params.uf, resource]);

    // Aeronaves
    useEffect(() => {
        if(resource === "aircraft") {
            setValue("");
        }
    }, [params.transport, resource]);

    useOutsideAutocomplete(wrapperRef, (clickedOutside) => {
        if(clickedOutside) {
            setVisible(false);
        }
    });

    const onChange = async (event) => {
        if(!visible) {
            setVisible(true);
        }
        const text = event.target.value;
        setValue(text);
        const data = await  onChangeText(text);
        setOptions(data);
    };

    const handleOptionSelected = (op) => {
        setValue(op.name);
        setVisible(false);
        handleClose();
        getOptionSelected(op);
    };

    const handleClickEvent = async () => {
        setVisible(true);
        handleOpen();
        const empty = "";
        setOptions([]);
        setValue(empty);
        const data = await onChangeText(empty);
        setOptions(data);
    };

    const getElement = (op) => {
        return(resource==="aircraft" ? `${op.prefix} • ${op.name}` : op.name);
    };

    return(
        <div id={id} className={`autocomplete ${className}`}>
            <div className="input">
                <input 
                    type="text" 
                    value={value} 
                    style={iconPosition === "start" && !noIcon ? styles.paddingStart : styles.empty}
                    onChange={onChange} 
                    placeholder={placeholder}
                    onClick={handleClickEvent}
                />
                {iconPosition === "end" ? (
                    <>
                        {!loading && (
                            <span style={iconPosition === "start" ? styles.iconStart : styles.iconEnd} className="spanicon">
                                {!noIcon ? icon : <Fragment />}
                            </span>
                        )}
                    </>
                ) : (
                    <span style={iconPosition === "start" ? styles.iconStart : styles.iconEnd} className="spanicon">
                        {!noIcon ? icon : <Fragment />}
                    </span>
                )}
                <span style={styles.iconEnd} className="spanicon">{loading ? <Spinner /> : <ArrowDropDownIcon className="icon" />}</span>
            </div>
            {visible && (
                <span className="auto-container">
                    <div ref={wrapperRef} className="spanoption">
                        {loading && <p className="loading-options">{loadingOptionsTxt}</p>}
                        {(value && !loading && options.length === 0) ? (
                            <div className="noresults">{noResultsText}</div>
                        ) : (
                            <div className="options">
                                {options.map((op, index) => (
                                    <div key={op.id} className="op" onClick={() => handleOptionSelected(op)}>
                                        <div style={index===options.length-1 ? styles.noBorderBottom : styles.empty} className="item">{getElement(op)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </span>
            )}
        </div>
    );
}

const styles = {
    iconStart: {
        left: '.5rem'
    },
    iconEnd: {
        right: '.5rem'
    },
    empty: {},
    paddingStart: { paddingLeft: 36 },
    noBorderBottom: { borderBottom: "none" }
};