import React, { useState } from 'react';
import LoginComponent from './LoginComponent';

const Login = ({ onLogin, onGoToRegistration }) => {
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: loginInput, password: passwordInput }),
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                console.log('Login successful:', data);
                onLogin();
            })
            .catch(error => {
                setError('Login failed. Please check your credentials.');
                console.error('Error during login:', error);
            });
    };

    const handleInputChange = event => {
        const { id, value } = event.target;
        if (id === 'loginInput') {
            setLoginInput(value);
        } else if (id === 'passwordInput') {
            setPasswordInput(value);
        }
    };

    return (
        <LoginComponent
            isRegistration={false}
            onLogin={handleLogin}
            onRegistration={onGoToRegistration}
            error={error}
            handleInputChange={handleInputChange}
        />
    );
};

export default Login;
