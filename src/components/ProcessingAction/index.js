import React from 'react';

import './styles.css';

export default function ProcessingAction({title, message, icon}) {

    return(
        <div className="processing-action">
            <div className="pcs">
                <div className="loader-action">
                    <div className="content">
                        {icon}
                        <div className="loader-processing-action">
                        </div>
                    </div>
                </div>
                <div className="desc">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
}