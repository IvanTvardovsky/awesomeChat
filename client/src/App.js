import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';
import ChatComponent from './ChatComponent';
import RoomComponent from './RoomComponent';
import { Container, CssBaseline, Snackbar, Alert } from '@mui/material';

const App = () => {
    const [currentView, setCurrentView] = useState('login');
    const [socket, setSocket] = useState(null);
    const [messageHistory, setMessageHistory] = useState([]);
    const [roomName, setRoomName] = useState('AwesomeChat');
    const [error, setError] = useState(null);

    const handleLogin = () => {
        setCurrentView('room');
    };

    const handleRegistration = () => {
        setCurrentView('registration');
    };

    const handleJoinRoom = (roomId, password) => {
        const username = localStorage.getItem('username');
        const socketUrl = `ws://127.0.0.1:8080/connectToChatroom/${roomId}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        connectToWebSocket(socketUrl, () => {
            setCurrentView('chat');
        });
    };

    const handleCreateRoom = (roomName, password, open) => {
        const username = localStorage.getItem('username');
        const socketUrl = `ws://127.0.0.1:8080/createChatroom/?username=${encodeURIComponent(username)}&roomname=${encodeURIComponent(roomName)}&open=${open}&password=${encodeURIComponent(password)}`;
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
            console.log('Successfully connected to chat room');
            onSuccess();
        };
        newSocket.onclose = (event) => {
            console.log('Socket Closed Connection: ', event);
            setError('Failed to connect to the chat room');
        };
        newSocket.onerror = (error) => {
            console.log('Socket Error: ', error);
            setError('An error occurred while connecting to the chat room');
        };
        newSocket.onmessage = (e) => {
            const messageObj = JSON.parse(e.data);
            if (messageObj.type === 'usual') {
                setMessageHistory((prevMessages) => [
                    ...prevMessages,
                    { content: messageObj.content, username: messageObj.username }
                ]);
            } else if (messageObj.type === 'userLeft' || messageObj.type === 'userJoined') {
                const decodedContent = atob(messageObj.content);
                console.log(decodedContent)
                setMessageHistory((prevMessages) => [
                    ...prevMessages,
                    { content: '', username: decodedContent }
                ]);
            } else if (messageObj.type === 'setRoomName') {
                const decodedContent = atob(messageObj.content);
                setRoomName(decodedContent);
            } else {
                console.error('Неизвестный тип сообщения:', messageObj.type);
            }
        };
        setSocket(newSocket);
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
        <Container component="main" maxWidth="md">
            <CssBaseline />
            {currentView === 'login' && (
                <Login onLogin={handleLogin} onGoToRegistration={handleRegistration} />
            )}

            {currentView === 'registration' && (
                <Registration onRegister={handleRegister} onGoToLogin={handleGoToLogin} />
            )}

            {currentView === 'chat' && (
                <ChatComponent
                    socket={socket}
                    messageHistory={messageHistory}
                    roomName={roomName}
                    onUpdateRoomName={setRoomName}
                    onLeaveChat={handleLeaveChat}
                    setMessageHistory={setMessageHistory}
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
