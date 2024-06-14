import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Typography, Container, Box, Paper } from '@mui/material';

const ChatComponent = ({ socket, messageHistory, roomName, onLeaveChat, setMessageHistory }) => {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    const sendMessage = () => {
        if (messageInput.trim() !== '') {
            const jsonMessage = JSON.stringify({
                type: 'usual',
                content: messageInput,
                username: localStorage.getItem('username')
            });

            socket.send(jsonMessage);

            setMessageHistory(prevMessages => [
                ...prevMessages,
                { content: messageInput, username: localStorage.getItem('username') }
            ]);

            setMessageInput('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageHistory]);

    return (
        <Container component="main" maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Typography component="h1" variant="h5">
                {roomName}
            </Typography>
            <Button variant="contained" color="secondary" onClick={onLeaveChat}>
                Leave Chat
            </Button>
            <Paper elevation={3} sx={{ marginTop: '20px', padding: '10px', flexGrow: 1, overflowY: 'auto' }}>
                <Box id="incomingMessages" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%' }}>
                    {messageHistory.map((message, index) => (
                        <div key={index}>
                            <strong>{message.username}</strong>{message.content ? `: ${message.content}` : ''}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>
            </Paper>
            <Box component="form" onSubmit={e => { e.preventDefault(); sendMessage(); }} sx={{ mt: 2, display: 'flex' }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Enter your message"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={sendMessage}>
                    Send
                </Button>
            </Box>
        </Container>
    );
};

export default ChatComponent;
