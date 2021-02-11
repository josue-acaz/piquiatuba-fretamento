import React, { useState, useEffect } from 'react';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { ActivityIndicator, Screen } from '../../components';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../auth/actions';
import logo from '../../assets/img/logo.png';

import './styles.css';

export default function SingnIn({ history }) {
    const [submitted, setSubmitted] = useState(false);
    const [inputs, setInputs] = useState({ email: "", password: "" });
    const { email, password } = inputs;

    const [visible, setVisible] = useState(false);
    const handleVisible = () => { setVisible(!visible) };

    const loggingIn = useSelector(state => state.authentication.loggingIn) || false;
    const loggedIn = useSelector(state => state.authentication.loggedIn) || true;
    const dispatch = useDispatch();

    useEffect(() => { dispatch(userActions.logout()) }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    };

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);

        if(email && password) {
            dispatch(userActions.login(email, password, history));
        }
    }

    return(
        <div className="wrapper-signin">
            <Screen id="signin" className="signin">
                <form onSubmit={handleSubmit} className="form">

                <div className="wrapper-logo">
                    <img className="logo" src={logo} alt="logo" />
                </div>
                <h3 className="title">Fretamento Piquiatuba</h3>

                <div className="zInput">
                    <input 
                        id="email" 
                        type="email" 
                        name="email" 
                        value={email} 
                        onChange={handleChange} 
                        placeholder="Endereço de email"
                    />
                    <span>
                        <MailOutlineIcon className="icon" />
                    </span>
                </div>
                {submitted && !email && <p className="error">Este campo é obrigatório!</p>}

                <div className="zInput">
                    <input 
                        id="password" 
                        type={visible ? "text" : "password"} 
                        name="password" 
                        value={password} 
                        onChange={handleChange} 
                        placeholder="Senha" 
                    />
                    <span onClick={handleVisible}>
                        {visible ? <VisibilityIcon className="icon" /> : <VisibilityOffIcon className="icon" />}
                    </span>
                </div>
                {submitted && !password && <p className="error">Este campo é obrigatório!</p>}
                {!loggedIn && (
                    <p className="error">Email ou senha inválidos!</p>
                )}

                <button type="submit" className="loginBtn">
                    {loggingIn ? <ActivityIndicator /> : "Acessar"}
                </button>
                </form>
            </Screen>
        </div>
    );
}