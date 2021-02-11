import React from 'react';
import {Screen} from '../../components';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import './styles.css';

const Error = ({history}) => {

    return(
        <div className="wrapper-error">
            <Screen id="error-page" className="error-page">
                <div className="flex-error">
                    <ErrorOutlineIcon className="error-icon" />
                    <p className="title">Não foi possível completar sua solicitação devido a um erro.</p>
                    <p className="msg">Por favor, tente novamente.</p>

                    <button 
                        className="error-button"
                        type="submit"
                        onClick={() => {
                            history.goBack();
                        }}
                    >
                        Voltar
                    </button>
                </div>
            </Screen>
        </div>
    );
};

export default Error;