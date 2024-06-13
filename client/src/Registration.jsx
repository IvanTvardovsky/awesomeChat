import React, { useState } from 'react';
import RegisterComponent from './RegisterComponent';

const Registration = ({ onRegister, onGoToLogin }) => {
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    const handleRegister = () => {
        fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: loginInput, password: passwordInput }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(data => {
                console.log('Registration successful:', data);
                localStorage.setItem('username', loginInput);
                onRegister();
            })
            .catch(error => {
                setError('Registration failed. Please try again.');
                console.error('Error during registration:', error);
            });
    };

    const handleInputChange = event => {
        const { id, value } = event.target;
        if (id === 'loginInputRegistration') {
            setLoginInput(value);
        } else if (id === 'passwordInputRegistration') {
            setPasswordInput(value);
        }
    };

    return (
        <RegisterComponent
            onRegister={handleRegister}
            onGoToLogin={onGoToLogin}
            error={error}
            handleInputChange={handleInputChange}
        />
    );
};

export default Registration;
