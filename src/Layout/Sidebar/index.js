import React, { useState, useEffect } from "react";
import { MenuItem } from "../../components";
import MainNav from "./MainNav";
import MenuIcon from '@material-ui/icons/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import OutsideClickHandler from 'react-outside-click-handler';

import './styles.css';

export default function Sidebar({className, options=[], handleShow, handleOpen, open=false, show=false}) {
    //const url = window.location.href.split('fretamento-piquiatuba.netlify.app')[1];

    const [visible, setVisible] = useState({});

    useEffect(() => {
        let visibleItems = {};

        options.forEach((option, index) => {
            visibleItems[`op_${index}`] = false;
        });

        setVisible(visibleItems);
    }, []);

    function toggleOpen(name) {
        let _visible = {};
        Object.keys(visible).forEach(key => {
            _visible[key] = key === name ? visible[name] ? false : true : false;
        });

        setVisible(_visible);
    }

    function handleCloseAll() {
        let _visible = {};
        Object.keys(visible).forEach(key => {
            _visible[key] = false;
        });

        setVisible(_visible);
    }

    return(
        <div className={`sidebar ${className} ${show ? "show" : ""}`}>
            <MainNav open={open} handleOpen={handleOpen} handleShow={handleShow} />
            <div className="nav-items">
                <OutsideClickHandler onOutsideClick={() => {
                    if(!open) {
                        handleCloseAll();
                    }
                }}>
                    {options.map((op, index) => (
                        <MenuItem
                            key={index}
                            style={open ? styles.empty: styles.centerItem}
                            Icon={op.Icon} 
                            expansive={!op.to}
                            expansive_options={!op.to ? op.options : null}
                            minimize={!open}
                            label={op.label} 
                            to={op.to} 
                            toggleSidebar={handleShow}
                            open={visible[`op_${index}`]}
                            toggleOpen={() => toggleOpen(`op_${index}`)}
                        />
                    ))}
                </OutsideClickHandler>
            </div>

            <div className="menu">
                <button style={open ? styles.empty : styles.centerBtn} className="menuBtn" onClick={handleOpen}>
                    {open ? <MenuOpenIcon className="icon" /> : <MenuIcon className="icon" />}
                </button>
            </div>
        </div>
    );
}

const styles = {
    empty: {},
    centerItem: {
        textAlign: 'center',
        display: 'block'
    },
    centerBtn: {
        textAlign: 'center'
    }
};