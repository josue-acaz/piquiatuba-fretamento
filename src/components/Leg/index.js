import React from "react";
import { formatCurrency, capitalize } from "../../utils";

import './styles.css';

export default function Leg({ type="", style={}, airport_origin="", airport_destination="", km=0 }) {

    const origin = airport_origin.split(" • ");
    const destination = airport_destination.split(" • ");

    // Para prefixos
    const rmOrigin = origin[1].split(" - ");
    const rmDestination = destination[1].split(" - ");

    const getLabel = (formatted="", rmFormatted=[], upper=false, cap=false) => {
        const label = rmFormatted[1] ? rmFormatted[1] : formatted;
        return(upper ? label.toUpperCase() : capitalize(label, true));
    };

    return(
        <div style={style} className="leg">
            <p className="type">{type}</p>
            <div className="content-leg">
                <p className="from">DE {getLabel(origin[1], rmOrigin, true, false)}, PARA</p>
                <p className="to">{getLabel(destination[1], rmDestination, false, true)}</p>
                <p className="km">{formatCurrency(km)} Km</p>
            </div>
        </div>
    );
}