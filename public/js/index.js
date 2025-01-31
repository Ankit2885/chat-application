const socket = io('http://localhost:8000', { transports: ['websocket'] });

const joinBtn = document.getElementById('join-btn');
const sendBtn = document.getElementById('send-btn');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const chatBox = document.getElementById('chat-box');
const welcomeSection = document.getElementById('welcome-section');
const chatSection = document.getElementById('chat-section');

let roomId = null;

joinBtn.addEventListener('click', () => {
    const name = nameInput.value;
    if (name) {
        socket.emit('new-user-joined', name);
        welcomeSection.style.display = 'none';
        chatSection.style.display = 'block';
    }
});

socket.on('joined-room', (room) => {
    roomId = room;
    chatBox.innerHTML += `<p class="info-message">You joined room: ${roomId}</p>`;
});

socket.on('user-joined', (name) => {
    chatBox.innerHTML += `<p class="info-message">${name} joined the room.</p>`;
});

socket.on('receive', (data) => {
    chatBox.innerHTML += `<p class="received-message"><strong>${data.name}:</strong> ${data.message}</p>`;
});

socket.on('leave', (name) => {
    chatBox.innerHTML += `<p class="info-message">${name} left the room.</p>`;
});

sendBtn.addEventListener('click', () => {
    const message = messageInput.value;
    if (message && roomId) {
        socket.emit('send', message);
        messageInput.value = ''; // Clear the message input
        chatBox.innerHTML += `<p class="sent-message"><strong>You:</strong> ${message}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to bottom
    }
});
