import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Grid, Snackbar, Alert } from '@mui/material';

const Registration = ({ onRegister, onGoToLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleRegister = () => {
        if (username.trim() === '' || password.trim() === '') {
            setError('Username and password are required');
        } else {
            // Call the onRegister function passed as a prop with the username and password
            onRegister(username, password);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Container component="main" maxWidth="xs">
            <div>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleRegister}
                        >
                            Register
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="text"
                            color="secondary"
                            onClick={onGoToLogin}
                        >
                            Already have an account? Login
                        </Button>
                    </Grid>
                </Grid>
                {error && (
                    <Snackbar open={true} autoHideDuration={6000} onClose={handleCloseError}>
                        <Alert onClose={handleCloseError} severity="error">
                            {error}
                        </Alert>
                    </Snackbar>
                )}
            </div>
        </Container>
    );
};

export default Registration;
