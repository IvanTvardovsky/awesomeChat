import React, { useState, useEffect } from 'react';
import { Typography, Snackbar, Alert, Card, CardContent, CardActions, Button, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

const RoomListComponent = ({ onJoinRoom }) => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [password, setPassword] = useState('');

    useEffect(() => {
        const socket = new WebSocket('ws://127.0.0.1:8080/roomUpdates');

        socket.onopen = () => {
            console.log('Connected to the WebSocket server for room updates');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'roomList') {
                setRooms(data.rooms);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('WebSocket error. Check console for more details.');
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleJoinRoomClick = (room) => {
        if (room.open) {
            onJoinRoom(room.id);
        } else {
            setSelectedRoomId(room.id);
            setOpenDialog(true);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setPassword('');
        setSelectedRoomId(null);
    };

    const handleJoinRoomWithPassword = () => {
        if (selectedRoomId !== null) {
            onJoinRoom(selectedRoomId, password);
            handleDialogClose();
        }
    };

    return (
        <>
            <Typography component="h2" variant="h6">
                Available Rooms
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                {rooms.map((room) => (
                    <Card key={room.id} variant="outlined">
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
            {error && (
                <Snackbar open={true} autoHideDuration={6000} onClose={() => setError(null)}>
                    <Alert onClose={() => setError(null)} severity="error">
                        {error}
                    </Alert>
                </Snackbar>
            )}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
            </DialogActions>
        </Dialog>
</>
);
};

export default RoomListComponent;