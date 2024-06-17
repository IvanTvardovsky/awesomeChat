import React, { useState, useEffect } from 'react';
import {
    Button, TextField, Typography, Container, Grid,
    FormControlLabel, RadioGroup, Radio, Box,
    Card, CardContent, CardActions, Dialog,
    DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';

const RoomComponent = ({ onJoinRoom, onCreateRoom }) => {
    const [joinRoomId, setJoinRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('open'); // 'open' or 'closed'
    const [createRoomPassword, setCreateRoomPassword] = useState('');
    const [joinRoomPassword, setJoinRoomPassword] = useState('');
    const [maxUsers, setMaxUsers] = useState(10); // Default max users
    const [availableRooms, setAvailableRooms] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [dialogPassword, setDialogPassword] = useState('');

    useEffect(() => {
        const socket = new WebSocket('ws://127.0.0.1:8080/roomUpdates');

        socket.onopen = () => {
            console.log('Connected to the WebSocket server');
        };

        socket.onmessage = (event) => {
            const rooms = JSON.parse(event.data);
            setAvailableRooms(rooms);
        };

        socket.onclose = (event) => {
            console.log('WebSocket connection closed: ', event);
        };

        socket.onerror = (error) => {
            console.log('WebSocket error: ', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleJoinRoom = () => {
        if (joinRoomId.trim() !== '') {
            const roomId = joinRoomId.trim();
            const password = joinRoomPassword.trim();
            onJoinRoom(roomId, password);
        } else {
            console.error('Room ID is required');
        }
    };

    const handleCreateRoom = () => {
        if (roomName.trim() !== '') {
            const password = roomType === 'closed' ? createRoomPassword.trim() : '';
            const open = roomType === 'open' ? 1 : 0;
            onCreateRoom(roomName, password, open, maxUsers);
        } else {
            console.error('Room name is required');
        }
    };

    const handleRoomTypeChange = (event) => {
        setRoomType(event.target.value);
        if (event.target.value === 'open') {
            setCreateRoomPassword('');
        }
    };

    const handleJoinRoomClick = (room) => {
        if (room.open) {
            onJoinRoom(room.id, '');
        } else {
            setSelectedRoomId(room.id);
            setOpenDialog(true);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setDialogPassword('');
        setSelectedRoomId(null);
    };

    const handleJoinRoomWithPassword = () => {
        if (selectedRoomId !== null) {
            onJoinRoom(selectedRoomId, dialogPassword);
            handleDialogClose();
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <Typography component="h1" variant="h5">
                Join or Create Room
            </Typography>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
                <Grid item xs={8}>
                    {/* Join Room Section */}
                    <Typography component="h2" variant="h6">
                        Join a Room
                    </Typography>
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
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleJoinRoom}
                    >
                        Join Room
                    </Button>

                    {/* Create Room Section */}
                    <Typography component="h2" variant="h6" style={{ marginTop: '20px' }}>
                        Create a Room
                    </Typography>
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
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="maxUsersInput"
                        label="Max Users"
                        type="number"
                        value={maxUsers}
                        onChange={(e) => setMaxUsers(e.target.value)}
                    />
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
                    {roomType === 'closed' && (
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
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={handleCreateRoom}
                        style={{ marginTop: '10px' }}
                    >
                        Create Room
                    </Button>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography component="h2" variant="h6">
                            Available Rooms
                        </Typography>
                        {availableRooms.map((room) => (
                            <Card key={room.id} variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {room.name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Room ID: {room.id}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        {room.open ? 'Open' : 'Closed'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Users: {room.users}/{room.maxUsers}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => handleJoinRoomClick(room)}>
                                        Join Room
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                </Grid>
            </Grid>

            {/* Password Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Enter Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This room is closed. Please enter the password to join.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={dialogPassword}
                        onChange={(e) => setDialogPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleJoinRoomWithPassword} color="primary">
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RoomComponent;
