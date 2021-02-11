import React from "react";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import './styles.css';

export default function GoBack({ onClick }) {

    return(
        <div onClick={onClick} className="goBack">
            <ArrowBackIcon className="icon" />
            <span>Voltar</span>
        </div>
    );
}