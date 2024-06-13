import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';
import ChatComponent from './ChatComponent';
import RoomComponent from './RoomComponent';
import { Container, CssBaseline } from '@mui/material';

const App = () => {
    const [currentView, setCurrentView] = useState('login');
    const [socket, setSocket] = useState(null);
    const [messageHistory, setMessageHistory] = useState([]);
    const [roomName, setRoomName] = useState('AwesomeChat');

    const handleLogin = () => {
        setCurrentView('room');
    };

    const handleRegistration = () => {
        setCurrentView('registration');
    };

    const handleJoinRoom = (roomId) => {
        const username = localStorage.getItem('username');
        const socketUrl = `ws://127.0.0.1:8080/connectToChatroom/${roomId}?username=${encodeURIComponent(username)}`;
        connectToWebSocket(socketUrl);
        setCurrentView('chat');
    };

    const handleCreateRoom = (roomId, roomName) => {
        const username = localStorage.getItem('username');
        const socketUrl = `ws://127.0.0.1:8080/createChatroom/${roomId}?username=${encodeURIComponent(username)}&roomname=${encodeURIComponent(roomName)}`;
        connectToWebSocket(socketUrl);
        setCurrentView('chat');
    };

    const connectToWebSocket = (url) => {
        const newSocket = new WebSocket(url);
        newSocket.onopen = () => {
            console.log('Successfully connected to chat room');
        };
        newSocket.onclose = (event) => {
            console.log('Socket Closed Connection: ', event);
        };
        newSocket.onerror = (error) => {
            console.log('Socket Error: ', error);
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

    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            {currentView === 'login' && (
                <Login onLogin={handleLogin} onGoToRegistration={handleRegistration} />
            )}

            {currentView === 'registration' && (
                <Registration onRegister={handleLogin} onGoToLogin={handleGoToLogin} />
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
        </Container>
    );
};

export default App;
