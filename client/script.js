// глобальная переменная WebSocket
let socket;
// история входящих сообщений
let messageHistory = [];

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;

    if (message.trim() !== "") {
        const jsonMessage = JSON.stringify({
            type: "usual",
            content: message,
            username: localStorage.getItem("username")
        });

        socket.send(jsonMessage);

        messageHistory.push({
            content: message,
            username: localStorage.getItem("username")
        });

        updateIncomingMessages();
        messageInput.value = "";
    }
}

function connectToExistingRoom() {
    messageHistory.splice(0);
    updateIncomingMessages();
    document.getElementById("chooseRoomContainer").style.display = "none";
    const roomIdInput = document.getElementById("roomIdInput");
    const roomId = roomIdInput.value.trim();
    const username = localStorage.getItem('username');

    if (roomId !== "") {
        const socketUrl = `ws://127.0.0.1:8080/connectToChatroom/${roomId}?username=${encodeURIComponent(username)}`;
        socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("Successfully connected to chat room");
        };

        socket.onclose = event => {
            console.log("Socket Closed Connection: ", event);
        };

        socket.onerror = error => {
            console.log("Socket Error: ", error);
        };

        socket.onmessage = function (e) {
            console.log("Server: " + e.data + "\n");

            const messageObj = JSON.parse(e.data);

            if (messageObj.type === "usual") {
                messageHistory.push({
                    content: messageObj.content,
                    username: messageObj.username
                });

                updateIncomingMessages();
            } else if (messageObj.type === "userLeft") {
                const decodedContent = atob(messageObj.content);
                messageHistory.push({
                    content: "",
                    username: decodedContent  // костыль для выделения жирным
                });
                updateIncomingMessages();
            } else if (messageObj.type === "userJoined") {
                const decodedContent = atob(messageObj.content);
                messageHistory.push({
                    content: "",
                    username: decodedContent  // костыль для выделения жирным
                });
                updateIncomingMessages();
            } else if (messageObj.type === "setRoomName") {
                const decodedContent = atob(messageObj.content);
                updateRoomName(decodedContent)
            } else {
                console.error("Неизвестный тип сообщения:", messageObj.type);
            }
        }
        ;

        document.getElementById("chatContainer").style.display = "block";
        roomIdInput.value = "";
    }
}

function createNewRoom() {
    console.log("Creating new room...");
    messageHistory.splice(0);
    updateIncomingMessages();
    document.getElementById("chooseRoomContainer").style.display = "none";
    const roomIdInput = document.getElementById("roomIdInputNew");
    const roomId = roomIdInput.value.trim();
    const roomNameInput = document.getElementById("roomNameInput");
    const roomName = roomNameInput.value.trim();
    const username = localStorage.getItem('username');

    if (roomId !== "" && roomName !== "") {
        const socketUrl = `ws://127.0.0.1:8080/createChatroom/${roomId}?username=${encodeURIComponent(username)}&roomname=${encodeURIComponent(roomName)}`;
        socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("Successfully connected to chat room");
        };

        socket.onclose = event => {
            console.log("Socket Closed Connection: ", event);
        };

        socket.onerror = error => {
            console.log("Socket Error: ", error);
        };

        socket.onmessage = function (e) {
            console.log("Server: " + e.data + "\n");

            const messageObj = JSON.parse(e.data);

            if (messageObj.type === "usual") {
                messageHistory.push({
                    content: messageObj.content,
                    username: messageObj.username
                });

                updateIncomingMessages();
            } else if (messageObj.type === "userLeft") {
                const decodedContent = atob(messageObj.content);
                messageHistory.push({
                    content: "",
                    username: decodedContent  // костыль для выделения жирным
                });
                updateIncomingMessages();
            } else if (messageObj.type === "userJoined") {
                const decodedContent = atob(messageObj.content);
                messageHistory.push({
                    content: "",
                    username: decodedContent  // костыль для выделения жирным
                });
                updateIncomingMessages();
            } else if (messageObj.type === "setRoomName") {
                const decodedContent = atob(messageObj.content);
                updateRoomName(decodedContent)
            } else {
                console.error("Неизвестный тип сообщения:", messageObj.type);
            }
        };

        document.getElementById("chatContainer").style.display = "block";
        roomIdInput.value = "";
    }
}

function updateIncomingMessages() {
    const incomingMessagesDiv = document.getElementById("incomingMessages");

    incomingMessagesDiv.innerHTML = "";

    for (let i = messageHistory.length - 1; i >= 0; i--) {
        const messageDiv = document.createElement("div");
        const usernameSpan = document.createElement("span");
        usernameSpan.textContent = messageHistory[i].username;
        usernameSpan.style.fontWeight = "bold";
        messageDiv.appendChild(usernameSpan);

        if (messageHistory[i].content !== "") {
            messageDiv.innerHTML += `: ${messageHistory[i].content}`;
        }

        incomingMessagesDiv.appendChild(messageDiv);
    }

    incomingMessagesDiv.scrollTop = incomingMessagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function handleKeyPressLogin(event) {
    if (event.key === 'Enter') {
        performLogin();
    }
}

function handleKeyPressRegistration(event) {
    if (event.key === 'Enter') {
        performRegistration();
    }
}

function performLogin() {
    const loginInput = document.getElementById("loginInput");
    const passwordInput = document.getElementById("passwordInput");

    const loginData = {
        username: loginInput.value,
        password: passwordInput.value
    };

    fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Login failed');
            }
        })
        .then(data => {
            console.log('Login successful:', data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', loginInput.value);
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("chooseRoomContainer").style.display = "block";
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');

            loginInput.value = ""
            passwordInput.value = ""
        });
}

function performRegistration() {
    const loginInput = document.getElementById("loginInputRegistration").value;
    const passwordInput = document.getElementById("passwordInputRegistration").value;

    const registrationData = {
        username: loginInput,
        password: passwordInput
    };

    fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
    })
        .then(response => {
            if (response.ok) {
                goToLogin();
            } else {
                response.text().then(errorMessage => {
                    console.error('Error during registration:', errorMessage);
                    alert('Registration failed. Please try again.\nError: ' + errorMessage);
                });
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert('Error during registration. Please try again.');
        });
}

function goToRegistration() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("registrationContainer").style.display = "block";
}

function goToLogin() {
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("registrationContainer").style.display = "none";
}

function leaveChat() {
    messageHistory.splice(0); // Полное удаление всех элементов из массива messageHistory
    updateIncomingMessages();

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }

    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("chooseRoomContainer").style.display = "block";
}

function updateRoomName(roomName) {
    document.getElementById("roomNameHeader").innerText = roomName;
}

