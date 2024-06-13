import React from 'react';
import { Button, TextField, Typography, Container, Alert } from '@mui/material';

const LoginComponent = ({ isRegistration, onLogin, onRegistration, error, handleInputChange }) => {
    return (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                {isRegistration ? 'Registration' : 'Login'}
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <form>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="loginInput"
                    label="Login"
                    name="login"
                    autoComplete="login"
                    autoFocus
                    onChange={handleInputChange}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="passwordInput"
                    autoComplete="current-password"
                    onChange={handleInputChange}
                />
                <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={onLogin}
                >
                    {isRegistration ? 'Register' : 'Login'}
                </Button>
                {!isRegistration && (
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={onRegistration}
                        style={{ marginTop: '10px' }}
                    >
                        Go to registration
                    </Button>
                )}
            </form>
        </Container>
    );
};

export default LoginComponent;
