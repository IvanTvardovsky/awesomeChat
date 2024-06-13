import React, { useState, useEffect } from 'react';

const ChatComponent = ({ socket, messageHistory, roomName, onUpdateRoomName, onLeaveChat }) => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (socket) {
            socket.onmessage = (e) => {
                const messageObj = JSON.parse(e.data);

                if (messageObj.type === 'usual') {
                    messageHistory.push({
                        content: messageObj.content,
                        username: messageObj.username
                    });
                } else if (messageObj.type === 'userLeft' || messageObj.type === 'userJoined') {
                    const decodedContent = atob(messageObj.content);
                    messageHistory.push({
                        content: '',
                        username: decodedContent  // костыль для выделения жирным
                    });
                } else if (messageObj.type === 'setRoomName') {
                    const decodedContent = atob(messageObj.content);
                    onUpdateRoomName(decodedContent);
                } else {
                    console.error('Неизвестный тип сообщения:', messageObj.type);
                }
                updateIncomingMessages();
            };
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [socket, messageHistory, onUpdateRoomName]);

    const sendMessage = () => {
        if (message.trim() !== '') {
            const jsonMessage = JSON.stringify({
                type: 'usual',
                content: message,
                username: localStorage.getItem('username')
            });

            socket.send(jsonMessage);

            messageHistory.push({
                content: message,
                username: localStorage.getItem('username')
            });

            updateIncomingMessages();
            setMessage('');
        }
    };

    const updateIncomingMessages = () => {
        const incomingMessagesDiv = document.getElementById('incomingMessages');

        incomingMessagesDiv.innerHTML = '';

        for (let i = messageHistory.length - 1; i >= 0; i--) {
            const messageDiv = document.createElement('div');
            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = messageHistory[i].username;
            usernameSpan.style.fontWeight = 'bold';
            messageDiv.appendChild(usernameSpan);

            if (messageHistory[i].content !== '') {
                messageDiv.innerHTML += `: ${messageHistory[i].content}`;
            }

            incomingMessagesDiv.appendChild(messageDiv);
        }

        incomingMessagesDiv.scrollTop = incomingMessagesDiv.scrollHeight;
    };

    const handleLeaveChat = () => {
        messageHistory.splice(0);
        updateIncomingMessages();
        onLeaveChat();
    };

    return (
        <div id="chatContainer">
            <h2 id="roomNameHeader">{roomName}</h2>
            <div id="incomingMessages" className="border p-2 mb-2" style={{ height: '300px', overflowY: 'scroll' }}>
                {/* //todo */}
            </div>
            <input
                type="text"
                id="messageInput"
                className="form-control"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>
            <button className="btn btn-secondary mt-2 ml-2" onClick={handleLeaveChat}>Leave Chat</button>
        </div>
    );
};

export default ChatComponent;
