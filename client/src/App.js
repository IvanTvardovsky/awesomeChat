import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';
import ChatComponent from './ChatComponent';
import RoomComponent from './RoomComponent';
import Dashboard from './Dashboard';
import { Container, CssBaseline, Snackbar, Alert } from '@mui/material';

const App = () => {
    const [currentView, setCurrentView] = useState('login');
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [socket, setSocket] = useState(null);
    const [messageHistory, setMessageHistory] = useState([]);
    const [roomName, setRoomName] = useState('AwesomeChat');
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleLogin = () => {
        setCurrentView('dashboard');
    };

    const handleRegistration = () => {
        setCurrentView('registration');
    };

    const handleStartDiscussion = (subtopic) => {
        setSelectedSubtopic(subtopic);
        setCurrentView('chat');
    };

    const handleJoinRoom = (roomId, password) => {
        const username = localStorage.getItem('username');
        const socketUrl = `ws://127.0.0.1:8080/connectToChatroom/${roomId}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        connectToWebSocket(socketUrl, () => {
            setCurrentView('chat');
        });
    };

    const handleCreateRoom = (roomName, password, open, maxUsers) => {
        const username = localStorage.getItem('username');
        const socketUrl = `ws://127.0.0.1:8080/createChatroom/?username=${encodeURIComponent(username)}&roomname=${encodeURIComponent(roomName)}&open=${open}&password=${encodeURIComponent(password)}&maxUsers=${maxUsers}`;
        connectToWebSocket(socketUrl, () => {
            setCurrentView('chat');
        });
    };


    const handleRegister = (username, password) => {
        fetch('http://127.0.0.1:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Registration failed');
                }
            })
            .then(data => {
                localStorage.setItem('username', username);
                handleLogin();
            })
            .catch(error => {
                console.error('Registration error:', error);
                setError('Registration failed. Please try again.');
            });
    };

    const connectToWebSocket = (url, onSuccess) => {
        const newSocket = new WebSocket(url);

        newSocket.onopen = () => {
            console.log('Connected to chat room');
            onSuccess();
        };

        newSocket.onclose = (event) => {
            console.log('Connection closed:', event);
            setError(event.reason || 'Connection closed');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Connection error');
        };

        newSocket.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessageHistory(prev => [...prev, {
                content: message.content,
                username: message.username,
                type: message.type,
                timestamp: new Date().toISOString()
            }]);
        };

        setSocket(newSocket);
    };


    const handleInputChange = (e) => {
        setMessageInput(e.target.value);

        if (socket?.readyState === WebSocket.OPEN) {

        }
    };

    const handleLeaveChat = () => {
        if (socket) {
            socket.close();
        }
        setMessageHistory([]);
        setCurrentView('room');
    };

    const handleGoToLogin = () => {
        setCurrentView('login');
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Container component="main" maxWidth={false} disableGutters>
            <CssBaseline />
            {currentView === 'login' && (
                <Login onLogin={handleLogin} onGoToRegistration={handleRegistration} />
            )}

            {currentView === 'registration' && (
                <Registration onRegister={handleRegister} onGoToLogin={handleGoToLogin} />
            )}

            {currentView === 'dashboard' && (
                <Dashboard onStartDiscussion={handleStartDiscussion} />
            )}

            {currentView === 'chat' && (
                <ChatComponent
                    socket={socket}
                    messageHistory={messageHistory}
                    setMessageHistory={setMessageHistory}
                    roomName={roomName}
                    onLeaveChat={handleLeaveChat}
                />
            )}

            {currentView === 'room' && (
                <RoomComponent onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
            )}

            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default App;
