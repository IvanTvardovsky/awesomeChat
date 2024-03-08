// Глобальная переменная для хранения объекта WebSocket
let socket;
// Массив для хранения истории входящих сообщений
let messageHistory = [];

// Обработчик событий для отправки сообщения
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;

    if (message.trim() !== "") {
        const jsonMessage = JSON.stringify({
            type: "usual",
            content: message,
            username: "we will make username later to server"
        });

        socket.send(jsonMessage);

        // Добавляем сообщение и информацию об отправителе в историю
        messageHistory.push({
            content: message,
            username: "we will make username later to client"
        });

        // Обновляем отображение входящих сообщений
        updateIncomingMessages();

        // Очистка поля ввода после отправки
        messageInput.value = "";
    }
}

function connectToChat() {
    const connectionInput = document.getElementById("connectionInput");
    const number = connectionInput.value;

    if (number.trim() !== "") {
        socket = new WebSocket("ws://127.0.0.1:8080/chatroom/" + number);
        console.log("Attempting Connection...");

        socket.onopen = () => {
            console.log("Successfully Connected");
        };

        socket.onclose = event => {
            console.log("Socket Closed Connection: ", event);
        };

        socket.onerror = error => {
            console.log("Socket Error: ", error);
        };

        socket.onmessage = function (e) {
            console.log("Server: " + e.data + "\n");

            // Парсим JSON-строку в объект
            const messageObj = JSON.parse(e.data);

            if (messageObj.type === "usual") {
                messageHistory.push({
                    content: messageObj.content,
                    username: messageObj.username
                });

                // Обновляем отображение входящих сообщений
                updateIncomingMessages();
            } else if (messageObj.type === "userLeft") {
                const decodedContent = atob(messageObj.content);
                messageHistory.push({
                    content: "",
                    username: decodedContent  // костыль для выделения жирным
                });
                updateIncomingMessages();
            } else {
                console.error("Неизвестный тип сообщения:", messageObj.type);
            }
        };

        // Показываем окно для отправки и отображения сообщений
        document.getElementById("chatContainer").style.display = "block";

        connectionInput.value = "";
    }
}

// Функция для обновления отображения входящих сообщений
function updateIncomingMessages() {
    // Получаем div для истории сообщений
    const incomingMessagesDiv = document.getElementById("incomingMessages");

    // Очищаем содержимое div
    incomingMessagesDiv.innerHTML = "";

    // Добавляем новые сообщения в конец div в обратном порядке
    for (let i = messageHistory.length - 1; i >= 0; i--) {
        const messageDiv = document.createElement("div");
        const usernameSpan = document.createElement("span");
        usernameSpan.textContent = messageHistory[i].username;
        usernameSpan.style.fontWeight = "bold";
        messageDiv.appendChild(usernameSpan);
        // Добавляем текст сообщения после имени пользователя
        if (messageHistory[i].content !== "") {
            messageDiv.innerHTML += `: ${messageHistory[i].content}`;
        }

        incomingMessagesDiv.appendChild(messageDiv);
    }

    // Прокручиваем контейнер вниз
    incomingMessagesDiv.scrollTop = incomingMessagesDiv.scrollHeight;
}

// Отправка сообщения при нажатии Enter
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
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

