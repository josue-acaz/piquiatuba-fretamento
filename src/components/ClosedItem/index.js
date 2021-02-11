import React, { useState } from "react";
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import api from "../../api";

import './styles.css';

function ClosedItem({quotation}) {
    const[closed, setClosed] = useState(quotation.closed);
    const undetermined = closed===null;
    const handleClosed = () => {
        setClosed(!closed);
        markClosed(!closed, quotation.id);
    };

    async function markClosed(closed, id) {
        try {
            await api.put(`/internal/quotations/${id}/update`, { closed });
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <button 
            onClick={handleClosed} 
            className={`closed-item ${undetermined ? 'closed-under' : closed ? 'closed-primary' : 'closed-secondary'}`}
        >
            <div className={`circle ${closed ? "switch" : ""}`}>
                {undetermined ? <RemoveIcon className="icon" /> : closed ? <CheckIcon className="icon" /> : <CloseIcon className="icon" />}
            </div>
            {<p>{undetermined ? "Em Espera" : closed ? "Fechada" : "Não Fechada"}</p>}
        </button>
    );
}

export default ClosedItem;