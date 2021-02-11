import React, {useState, useEffect, useRef} from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Skeleton from '@material-ui/lab/Skeleton';
import { Spinner } from '../../../components';

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

export default function Core({ 
    value, 
    onChange, 
    Icon,
    visible,
    loading,
    toggleVisible,
    error,
    options=[],
    initializing,
    renderOption,
    placeholder='Pesquisar por...', 
    handleClickInput,
    iconPosition='start',
    onOptionSelected }) {
    const [cursor, setCursor] = useState('');
    const wrapperRef = useRef(null);

    function handleClickOption(option) {
        onOptionSelected(option);
        toggleVisible();
    }

    function handleKeyDown(e) {
        // arrow up/down button should select next/previous list element
        if (e.keyCode === 38 && cursor > 0) {
          setCursor(cursor - 1);
        } else if (e.keyCode === 40 && cursor < options.length - 1) {
          setCursor(cursor + 1);
        }
    }

    // Hide on click outside
    useOutsideAutocomplete(wrapperRef, (clickedOutside) => {
        if(clickedOutside) {
            if(visible) {
                toggleVisible();
            }
        }
    });

    return(
        <div ref={wrapperRef} className="autocomplete-core">
            <div className="autocomplete-input">
                {initializing ? <Skeleton variant="rect" animation="wave" className="input-skeleton" /> : (
                    <input 
                        type="text" 
                        value={value} 
                        onChange={onChange} 
                        onClick={handleClickInput}
                        placeholder={placeholder}
                        className={visible ? 'no-border-bottom auto-visible' : ''}
                        onKeyDown={handleKeyDown}
                    />
                )}
                {error && <span className="error">Este campo é obrigatório.</span>}
                <span className={`icon-${iconPosition}`}>
                    <Icon className="icon" />
                </span>
                <span className="arrow">
                    {loading ? <Spinner /> : <ArrowDropDownIcon className="icon" />}
                </span>
            </div>
            {visible && (
                <span className={`autocomplete-core-options ${visible ? 'autocomplete-core-options-visible' : ''}`}>
                    <ul className="autocomplete-options">
                        {options.length > 0 ? (
                            options.map((option, index) => (
                                <li 
                                    key={index}
                                    className={`core-option ${cursor === index ? 'core-option-active' : ''} ${index === options.length-1 ? 'no-border-bottom' : ''}`} 
                                    onClick={() => handleClickOption(option)}
                                >
                                    {renderOption(option)}
                                </li>
                            ))
                        ) : <p className="no-results">{`Nenhum resultado encontrado para "${value.trim()}"`}</p>}
                    </ul>
                </span>
            )}
        </div>
    );
}
