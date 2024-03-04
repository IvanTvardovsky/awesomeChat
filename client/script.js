// Глобальная переменная для хранения объекта WebSocket
let socket;
// Массив для хранения истории входящих сообщений
let messageHistory = [];

// Обработчик событий для отправки сообщения
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;

    // Проверка, что сообщение не пустое
    if (message.trim() !== "") {
        // Отправка сообщения на сервер
        const jsonMessage = JSON.stringify({
            type: "usual",
            content: message
        });

        socket.send(jsonMessage);

        // Очистка поля ввода после отправки
        messageInput.value = "";
    }
}

function connectToChat() {
    const connectionInput = document.getElementById("connectionInput");
    const number = connectionInput.value;

    // Проверка, что номер чата не пустой
    if (number.trim() !== "") {
        // Отправка номера чата на сервер через WebSocket
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

            // Обрабатываем разные типы сообщений
            if (messageObj.type === "usual") {
                // Добавляем сообщение в историю
                messageHistory.push(messageObj.content);

                // Обновляем отображение входящих сообщений
                updateIncomingMessages();
            } else {
                console.error("Неизвестный тип сообщения:", messageObj.type);
            }
        };

        // Показываем окно для отправки и отображения сообщений
        document.getElementById("chatContainer").style.display = "block";

        // Очистка поля ввода после отправки
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
        messageDiv.textContent = messageHistory[i];
        incomingMessagesDiv.appendChild(messageDiv);
    }

    // Прокручиваем контейнер вниз
    incomingMessagesDiv.scrollTop = incomingMessagesDiv.scrollHeight;
}
