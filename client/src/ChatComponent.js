import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Toolbar,
    AppBar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Slide,
    Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useSnackbar } from 'notistack';
import { formatDistanceToNow } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ChatComponent = ({socket, messageHistory, setMessageHistory, roomName, onLeaveChat}) => {
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [confirmClose, setConfirmClose] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUser = localStorage.getItem('username');

    const groupMessages = (messages) => {
        return messages.reduce((acc, message) => {
            const lastGroup = acc[acc.length - 1];
            if (lastGroup &&
                lastGroup.username === message.username &&
                new Date(message.timestamp) - new Date(lastGroup.timestamp) < 15000) {
                lastGroup.messages.push(message.content);
                lastGroup.timestamp = message.timestamp;
            } else {
                acc.push({
                    username: message.username,
                    messages: [message.content],
                    timestamp: message.timestamp,
                    type: message.type
                });
            }
            return acc;
        }, []);
    };

    const handleSendMessage = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error('Connection not ready');
            return;
        }

        if (messageInput.trim()) {
            const messageData = {
                type: 'usual',
                content: messageInput,
                username: currentUser,
                timestamp: new Date().toISOString()
            };

            try {
                socket.send(JSON.stringify(messageData));
                setMessageInput('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageHistory]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            setMessageHistory(prev => [...prev, message]);
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, setMessageHistory]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: 'background.default'
        }}>
            {/* Header */}
            <AppBar position="static" color="inherit" elevation={1}>
                <Toolbar>
                    <IconButton onClick={() => setConfirmClose(true)}>
                        <ExitToAppIcon />
                    </IconButton>

                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="h6">{roomName}</Typography>
                        <Chip
                            label={currentUser}
                            size="small"
                            avatar={<Avatar>{currentUser[0]}</Avatar>}
                            sx={{ mr: 1 }}
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Messages Area */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
            }}>
                <List sx={{ pb: 8 }}>
                    {groupMessages(messageHistory).map((group, index) => (
                        <Box key={index} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: group.username === currentUser ? 'flex-end' : 'flex-start',
                            mb: 2
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5,
                                alignSelf: group.username === currentUser ? 'flex-end' : 'flex-start'
                            }}>
                                <ListItemAvatar>
                                    <Avatar>{group.username[0]}</Avatar>
                                </ListItemAvatar>
                                <Typography variant="subtitle2">{group.username}</Typography>
                            </Box>

                            {group.messages.map((msg, msgIndex) => (
                                <ListItem
                                    key={msgIndex}
                                    sx={{
                                        maxWidth: '70%',
                                        alignSelf: group.username === currentUser ? 'flex-end' : 'flex-start',
                                        p: 0,
                                        mb: 0.5
                                    }}
                                >
                                    <Box sx={{
                                        bgcolor: group.username === currentUser ? 'primary.main' : 'background.paper',
                                        color: group.username === currentUser ? 'primary.contrastText' : 'text.primary',
                                        borderRadius: 4,
                                        px: 2,
                                        py: 1,
                                        boxShadow: 1
                                    }}>
                                        <ListItemText
                                            primary={msg}
                                            secondary={msgIndex === group.messages.length - 1 &&
                                                formatDistanceToNow(new Date(group.timestamp), { addSuffix: true })}
                                            secondaryTypographyProps={{
                                                variant: 'caption',
                                                color: group.username === currentUser ? 'primary.light' : 'text.secondary'
                                            }}
                                        />
                                    </Box>
                                </ListItem>
                            ))}
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Input Area */}
            <Box sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        multiline
                        maxRows={4}
                    />

                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || !socket || socket.readyState !== WebSocket.OPEN}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatComponent;