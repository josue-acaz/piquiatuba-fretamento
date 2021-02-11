import React from 'react';
import Modal from '../Modal';
import uti_logo from '../../assets/img/uti.png';

import './styles.css';

const UTILoader = () => (
    <Modal handleClose={() => {}} show={true}>
        <div className="uti-loader">
            <div className="props">
                <img src={uti_logo} alt="uti logo" />
                <div className="spinner">
                    <div className="uti_loader"></div>
                </div>
            </div>
        </div>
    </Modal>
);

export default UTILoader;