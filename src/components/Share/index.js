import React, { useState } from "react";
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import EmailIcon from '@material-ui/icons/Email';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import OutsideClickHandler from "react-outside-click-handler";
import { shareOnWhatsapp } from "../../utils";

import './styles.css';

export default function Share({ quotation, history }) {
    const[open, setOpen] = useState(false);
    const handleOpen = () => { setOpen(!open) };

    function handleShareEmail(act) {
        
    }

    return(
        <div className="share">
            {open && (
                <OutsideClickHandler onOutsideClick={handleOpen}>
                    <div className="dialog">
                        <span onClick={() => { handleShareEmail(quotation) }}><EmailIcon className="icon email" /></span>
                        <span onClick={() => { shareOnWhatsapp(`pedidos/${quotation.id}/pdf`) }}><WhatsAppIcon className="icon whatsapp" /></span>
                    </div>
                </OutsideClickHandler>
            )}
            <button className="btnShare" onClick={handleOpen}>
                <ShareOutlinedIcon className="icon" />
            </button>
        </div>
    );
}