import React from 'react';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

import './styles.css';

export default function Info({ open=false, loading=false, success=true, error=false, onClose=() => {} }) {
    
    return(
        <div id="info" style={open ? { display: "flex" } : { display: "none" }} className="info">
            <div className="card">
                <div className="process">
                    {loading ? 
                    <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div> :
                    success ? <DoneIcon className="success-icon" /> : <CloseIcon className="error-icon" />}
                </div>
                <p>{loading ? "Enviando email(s)..." : success ? "E-mail(s) enviado(s)!" : "E-mail(s) não enviado(s)!"}</p>
                {!loading && <button onClick={onClose} >OK</button>}
            </div>
        </div>
    );
}