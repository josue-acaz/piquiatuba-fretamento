import React from 'react';
import CloseIcon from '@material-ui/icons/Close';

import './styles.css';

export default function SideConfig({children, open, handleOpen, handleClose}) {
    return(
        <div className={`layout-config ${open ? 'layout-config-active' : ''}`}>
            <div className="layout-config-content-wrapper">
                <button onClick={open ? handleClose : handleOpen} className="layout-config-button p-link">
                    <i className="pi pi-cog"></i>
                </button>
                <button onClick={handleClose} className="layout-config-close p-link">
                    <CloseIcon className="icon" />
                </button>
                <div className="layout-config-content">
                    <div className="content">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}