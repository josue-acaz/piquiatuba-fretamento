import React from "react";

import './styles.css';

const Inline = ({ components=[], align="center", justify="center" }) => {

    const styles = {
        inline: {
            alignItems: align,
            justifyContent: justify
        },
        cmp: {}
    };

    return(
        <div style={styles.inline} className="inline">
            {components.map(cmp => (
                <div key={cmp.id} style={styles.cmp} className="cmp">
                    <div className="center-cmp">{cmp.component}</div>
                </div>
            ))}
        </div>
    );
};

export default Inline;