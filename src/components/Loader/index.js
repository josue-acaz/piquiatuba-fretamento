import React from 'react';

import './styles.css';

export default function Loader({ title }) {

    return(
        <div className="loader">
            <div className="spinner">
                    <div>
                        <div className="sk-cube-grid">
                            <div className="sk-cube sk-cube1"></div>
                            <div className="sk-cube sk-cube2"></div>
                            <div className="sk-cube sk-cube3"></div>
                            <div className="sk-cube sk-cube4"></div>
                            <div className="sk-cube sk-cube5"></div>
                            <div className="sk-cube sk-cube6"></div>
                            <div className="sk-cube sk-cube7"></div>
                            <div className="sk-cube sk-cube8"></div>
                            <div className="sk-cube sk-cube9"></div>
                        </div>
                        <div className="info">
                            <p className="title">{title}</p>
                            <p className="subtitle">Por favor, aguarde...</p>   
                        </div>
                    </div>
                </div>
        </div>
    );
}