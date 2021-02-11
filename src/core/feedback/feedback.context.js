import React, {createContext, useState, useContext} from 'react';
import {SnackbarFeedback} from '../../components';

const FeedbackContext = createContext({});

export const FeedbackProvider = ({children}) => {
    const [feedback, setFeedback] = useState({});
    const handleFeedback = (name, value) => {
        setFeedback(feedback => ({ ...feedback, [name]: value }));
    };

    const close = () => handleFeedback('open', false);

    function open(preferences) {
        handleFeedback('open', true);
        setPreferences(preferences);
    }

    function setPreferences(preferences) {
        Object.keys(preferences).forEach(key => {
            handleFeedback(key, preferences[key]);
        });
    }

    return(
        <FeedbackContext.Provider value={{open}}>
            {children}
            <SnackbarFeedback 
                open={feedback.open} 
                severity={feedback.severity} 
                msg={feedback.msg}
                handleClose={close} 
            />
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);
    return context;
}