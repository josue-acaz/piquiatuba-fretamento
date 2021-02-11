import React from "react";
import logo from "../../assets/img/logo.png";

import './styles.css';

export default function Footer() {

    return(
        <footer id="footer">
            <img src={logo} alt="footer logo" />
            <p className="title">Piquiatuba Táxi Aéreo</p>
            <p className="website">www.piquiatuba.com.br</p>
        </footer>
    );
}