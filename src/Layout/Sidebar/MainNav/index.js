import React from "react";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import logo from "../../../assets/img/minLogo.png";

import './styles.css';

export default function MainNav({ open, handleOpen, handleShow }) {

    return(
        <div className="main-nav">
            <div className="col-nav">
                <img src={logo} alt="logo" />
            </div>
            <div className="col-nav show-sidebar">
                <button className="btnShowSidebar" onClick={handleShow}>
                    <ArrowBackIcon className="icon" />
                </button>
            </div>
        </div>
    );
}