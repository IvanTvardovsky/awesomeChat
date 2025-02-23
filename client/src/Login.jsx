import React, { useState } from 'react';
import LoginComponent from './LoginComponent';

const Login = ({ onLogin, onGoToRegistration }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: identifier, password }),
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error('Login failed');
                return response.json();
            })
            .then(data => {
                localStorage.setItem('username', identifier);
                onLogin();
            })
            .catch(() => setError('Invalid credentials. Please try again.'));
    };

    return (
        <LoginComponent
            identifier={identifier}
            password={password}
            error={error}
            onIdentifierChange={(e) => setIdentifier(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onLogin={handleLogin}
            onGoToRegistration={onGoToRegistration}
        />
    );
};

export default Login;