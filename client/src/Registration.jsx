import React, { useState } from 'react';
import RegistrationComponent from './RegistrationComponent';

const Registration = ({ onRegister, onGoToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleRegister = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) throw new Error('Registration failed');
                onGoToLogin();
            })
            .catch(error => setError(error.message));
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <RegistrationComponent
            formData={formData}
            error={error}
            onChange={handleChange}
            onRegister={handleRegister}
            onGoToLogin={onGoToLogin}
        />
    );
};

export default Registration;