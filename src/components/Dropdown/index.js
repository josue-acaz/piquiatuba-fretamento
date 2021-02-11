import React from "react";
import { Inline } from "../../components";

import './styles.css';

export default function Dropdown({ Icon, options=[], text='', iconSize='large', decoration='circle', dropPosition='left' }) {

    return(
        <div className="dropdown">
            <button className={`dropbtn dropbtn-${decoration}`}>
                {text && <p>{text}</p>}
                <Icon className={`icon icon-${iconSize}`} />
            </button>
            <div className={`dropdown-content dropdown-content-${dropPosition}`}>
                {options.map((op, index) => (
                    <div 
                        key={index}
                        className="op" 
                        onClick={op.onClick}
                    >
                        <Inline components={[
                            {
                                id: 1,
                                component: <op.icon className="icon-dropdown" />
                            },
                            {
                                id: 2,
                                component: <div className="label-dropdown">{op.label}</div>
                            }
                        ]} justify="left" align="center" />
                    </div>
                ))}
            </div>
        </div>
    );
}