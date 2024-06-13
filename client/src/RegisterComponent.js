import React from 'react';
import { Button, TextField, Typography, Container, Alert } from '@mui/material';

const RegistrationComponent = ({ onRegister, onGoToLogin, error, handleInputChange }) => {
    return (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                Registration
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
                    onClick={onRegister}
                >
                    Register
                </Button>
                <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={onGoToLogin}
                    style={{ marginTop: '10px' }}
                >
                    Back to Login
                </Button>
            </form>
        </Container>
    );
};

export default RegistrationComponent;
