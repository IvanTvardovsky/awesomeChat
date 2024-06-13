import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Grid } from '@mui/material';

const RoomComponent = ({ onJoinRoom, onCreateRoom }) => {
    const [joinRoomId, setJoinRoomId] = useState('');
    const [newRoomId, setNewRoomId] = useState('');
    const [roomName, setRoomName] = useState('');

    const handleJoinRoom = () => {
        if (joinRoomId.trim() !== '') {
            onJoinRoom(joinRoomId);
        }
    };

    const handleCreateRoom = () => {
        if (newRoomId.trim() !== '' && roomName.trim() !== '') {
            onCreateRoom(newRoomId, roomName);
        }
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
                        id="newRoomIdInput"
                        label="Room ID"
                        name="newRoomId"
                        autoComplete="new-room-id"
                        value={newRoomId}
                        onChange={(e) => setNewRoomId(e.target.value)}
                    />
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
        </Container>
    );
};

export default RoomComponent;
