import React from 'react';
import OutsideClickHandler from 'react-outside-click-handler';

import './styles.css';

const Modal = ({handleClose, show=false, children, hideOnClickOutside=true, className}) => {
  return (
        <div className={`lay-modal ${className} ${show ? "display-block" : "display-none"}`}>
            <OutsideClickHandler onOutsideClick={() => {
                if(hideOnClickOutside) {
                    handleClose();
                }
            }}>
                <section className="lay-modal-main">
                    {children}
                </section>
            </OutsideClickHandler>
        </div>
  );
};

export default Modal;