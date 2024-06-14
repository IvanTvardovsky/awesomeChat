import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Grid, FormControlLabel, RadioGroup, Radio, Snackbar, Alert } from '@mui/material';

const RoomComponent = ({ onJoinRoom, onCreateRoom }) => {
    const [joinRoomId, setJoinRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('open'); // 'open' or 'closed'
    const [createRoomPassword, setCreateRoomPassword] = useState('');
    const [joinRoomPassword, setJoinRoomPassword] = useState('');
    const [error, setError] = useState(null);

    const handleJoinRoom = () => {
        if (joinRoomId.trim() !== '') {
            const roomId = joinRoomId.trim();
            const password = joinRoomPassword.trim();
            onJoinRoom(roomId, password);
        }
    };

    const handleCreateRoom = () => {
        if (roomName.trim() === '' || (roomType === 'closed' && createRoomPassword.trim() === '')) {
            setError('Please fill in all required fields');
            return;
        }
        const password = roomType === 'closed' ? createRoomPassword.trim() : '';
        const open = roomType === 'open' ? 1 : 0;
        onCreateRoom(roomName, password, open);
    };

    const handleRoomTypeChange = (event) => {
        setRoomType(event.target.value);
        if (event.target.value === 'open') {
            setCreateRoomPassword('');
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Container component="main" maxWidth="sm">
            <Typography component="h1" variant="h5">
                Join or Create Room
            </Typography>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
                {/* Join Room Section */}
                <Grid item xs={12}>
                    <Typography component="h2" variant="h6">
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="joinRoomIdInput"
                        label="Room ID"
                        name="joinRoomId"
                        autoComplete="room-id"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        id="joinRoomPasswordInput"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={joinRoomPassword}
                        onChange={(e) => setJoinRoomPassword(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleJoinRoom}
                    >
                        Join Room
                    </Button>
                </Grid>
                {/* Create Room Section */}
                <Grid item xs={12}>
                    <Typography component="h2" variant="h6">
                        Create a Room
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="roomNameInput"
                        label="Room Name"
                        name="roomName"
                        autoComplete="room-name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <RadioGroup
                        aria-label="roomType"
                        name="roomType"
                        value={roomType}
                        onChange={handleRoomTypeChange}
                        row
                    >
                        <FormControlLabel
                            value="open"
                            control={<Radio />}
                            label="Open Room"
                        />
                        <FormControlLabel
                            value="closed"
                            control={<Radio />}
                            label="Closed Room"
                        />
                    </RadioGroup>
                </Grid>
                {roomType === 'closed' && (
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="createRoomPasswordInput"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            value={createRoomPassword}
                            onChange={(e) => setCreateRoomPassword(e.target.value)}
                        />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={handleCreateRoom}
                    >
                        Create Room
                    </Button>
                </Grid>
            </Grid>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RoomComponent;
