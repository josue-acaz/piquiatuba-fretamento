import React from 'react';

import './styles.css';

export default function Processing({open=true}) {

    return(
        <div id="modal-processing" style={{display: open ? 'block' : 'none'}} className="modal">
            <div className="processing-modal-content">
                <div className="modal-loader-processing"></div>
            </div>
        </div>
    );
}