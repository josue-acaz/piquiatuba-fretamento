import React from 'react';
import {Screen} from '../../components';
import CheckIcon from '@material-ui/icons/Check';

import './styles.css';

const Success = ({history}) => {

    const goToSite = () => {
        window.open("https://www.piquiatuba.com.br/site/");
    };

    return(
        <div className="wrapper-success">
            <Screen id="success-page" className="success-page">
                <div className="flex-success">
                    <CheckIcon className="success-icon" />
                    <p className="title">Informações enviadas com successo!</p>

                    <button 
                        className="success-button"
                        type="submit"
                        onClick={goToSite}
                    >
                        Concluir
                    </button>
                </div>
            </Screen>
        </div>
    );
};

export default Success;