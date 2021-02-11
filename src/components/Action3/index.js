import React from "react";
import Paper from "@material-ui/core/Paper";
import { Inline } from "../../components";

import './styles.css';

export default function Action3({ actions, data }) {

    return(
        <div className="action3">
            <Inline components={actions.map((action, index) => {
                function component(action, index) {
                    return(
                        <Paper 
                            key={action.id} 
                            style={index===0 ? {marginLeft: 0} : {}} 
                            className="action3-paper"
                            onClick={() => { action.onClick(data) }}
                        >
                            <action.icon className={action.className} />
                            <p>{action.label}</p>
                        </Paper>
                    );
                }

                action = {
                    id: action.id,
                    component: component(action, index)
                };

                return action;
            })} justify="left" align="center" />
        </div>
    );
}