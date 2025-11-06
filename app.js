const PARSE_APPLICATION_ID = 'Tk5Zxhr0L5RZkXu8xTAn0uBYCOJcD9Z0JctLnmTz';
const PARSE_JAVASCRIPT_KEY = 'SXU64wQdwWggMcOOAz4OCqQ8KnBrBeCGiREtGkNi';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

// Elementos Globais
const messagesList = document.querySelector('#messages-list');
const loader = document.querySelector('#loader');
const usernameInput = document.querySelector('#username-input');

// Lógica do Chat
const attachChatListeners = () => {
    let selectedFile = null;
    const messageForm = document.querySelector('#message-form');
    const messageInput = document.querySelector('#message-input');
    const fileInput = document.querySelector('#file-input');
    const imagePreviewContainer = document.querySelector('#image-preview');
    const previewImage = document.querySelector('#preview-image');
    const removeImageBtn = document.querySelector('#remove-image-btn');

    document.querySelector('#image-upload-btn').addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(selectedFile);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        imagePreviewContainer.style.display = 'none';
    });

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const content = messageInput.value.trim();

        if (!username || (!content && !selectedFile)) return;

        const Comentario = Parse.Object.extend("Comentarios");
        const comentario = new Comentario();
        comentario.set("username", username);
        if (content) comentario.set("content", content);
        comentario.set("likes", 0);

        if (selectedFile) {
            const parseFile = new Parse.File(selectedFile.name, selectedFile);
            await parseFile.save();
            comentario.set("image", parseFile);
        }
        
        try {
            await comentario.save();
            messageInput.value = '';
            removeImageBtn.click();
        } catch (error) { console.error("Erro ao salvar:", error); }
    });
};

const fetchComments = async () => {
    loader.style.display = 'block';
    const query = new Parse.Query("Comentarios");
    query.ascending("createdAt");
    try {
        const comments = await query.find();
        loader.style.display = 'none';
        messagesList.innerHTML = '';
        comments.forEach(displayComment);
        messagesList.scrollTop = messagesList.scrollHeight;
    } catch (error) { console.error("Erro ao buscar:", error); }
};

const displayComment = (comment) => {
    const username = comment.get("username") || "Anônimo";
    const content = comment.get("content");
    const likes = comment.get("likes") || 0;
    const imageFile = comment.get("image");

    const commentElement = document.createElement('div');
    commentElement.id = `comment-${comment.id}`;
    commentElement.classList.add('comment');
    
    const imageHTML = imageFile ? `<img src="${imageFile.url()}" class="comment-image" alt="Imagem do comentário">` : '';
    const contentHTML = content ? `<p>${content}</p>` : '';

    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${username}</strong>
            <span>${new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        ${imageHTML}
        ${contentHTML}
        <div class="comment-actions">
            <button class="like-btn" data-id="${comment.id}">👍 <span>Curtir (${likes})</span></button>
            <button class="delete-btn" data-id="${comment.id}">🗑️ <span>Deletar</span></button>
        </div>
    `;
    messagesList.appendChild(commentElement);

    commentElement.querySelector('.delete-btn').addEventListener('click', (e) => deleteComment(e.target.closest('button').dataset.id));
    commentElement.querySelector('.like-btn').addEventListener('click', (e) => likeComment(e.target.closest('button').dataset.id));
};

const deleteComment = async (id) => {
    const query = new Parse.Query("Comentarios");
    try {
        const comentario = await query.get(id);
        await comentario.destroy();
    } catch (error) { console.error("Erro ao deletar:", error); }
};

const likeComment = async (id) => {
    const query = new Parse.Query("Comentarios");
    try {
        const comentario = await query.get(id);
        comentario.increment("likes");
        await comentario.save();
    } catch (error) { console.error("Erro ao curtir:", error); }
};

const listenToChanges = async () => {
    const query = new Parse.Query('Comentarios');
    const subscription = await query.subscribe();

    subscription.on('create', (comment) => {
        const isScrolledToBottom = messagesList.scrollHeight - messagesList.clientHeight <= messagesList.scrollTop + 1;
        displayComment(comment);
        if (isScrolledToBottom) {
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    });
    subscription.on('update', (comment) => {
        const likeButtonSpan = document.querySelector(`#comment-${comment.id} .like-btn span`);
        if (likeButtonSpan) {
            likeButtonSpan.textContent = `Curtir (${comment.get("likes") || 0})`;
        }
    });
    subscription.on('delete', (comment) => {
        document.querySelector(`#comment-${comment.id}`)?.remove();
    });
};

// Lógica do Modal de Configurações
const attachSettingsListeners = () => {
    const settingsBtn = document.querySelector('#settings-btn');
    const settingsModal = document.querySelector('#settings-modal');
    const closeModalBtn = document.querySelector('#close-modal-btn');
    const saveSettingsBtn = document.querySelector('#save-settings-btn');
    const usernameSettingInput = document.querySelector('#username-setting');

    settingsBtn.addEventListener('click', () => {
        usernameSettingInput.value = localStorage.getItem('chatUsername') || '';
        settingsModal.style.display = 'flex';
    });

    const closeModal = () => {
        settingsModal.style.display = 'none';
    };

    closeModalBtn.addEventListener('click', closeModal);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeModal();
        }
    });

    saveSettingsBtn.addEventListener('click', () => {
        const newUsername = usernameSettingInput.value.trim();
        if (newUsername) {
            localStorage.setItem('chatUsername', newUsername);
            usernameInput.value = newUsername;
        }
        closeModal();
    });
};

// Função Principal de Inicialização
const init = async () => {
    usernameInput.value = localStorage.getItem('chatUsername') || '';
    attachChatListeners();
    attachSettingsListeners();
    await fetchComments();
    await listenToChanges();
};

init();
