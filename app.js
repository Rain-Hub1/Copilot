const PARSE_APPLICATION_ID = 'Tk5Zxhr0L5RZkXu8xTAn0uBYCOJcD9Z0JctLnmTz';
const PARSE_JAVASCRIPT_KEY = 'SXU64wQdwWggMcOOAz4OCqQ8KnBrBeCGiREtGkNi';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

const root = document.querySelector('#root');
const templates = {
    chat: document.querySelector('#template-chat'),
    settings: document.querySelector('#template-settings')
};

const router = () => {
    const path = window.location.hash || '#/';
    root.innerHTML = '';
    if (path === '#/settings') {
        renderSettingsPage();
    } else {
        renderChatPage();
    }
};

const renderTemplate = (templateId) => {
    const template = document.querySelector(templateId);
    const content = template.content.cloneNode(true);
    root.appendChild(content);
};

const renderChatPage = () => {
    renderTemplate('#template-chat');
    document.querySelector('#settings-btn').addEventListener('click', () => window.location.hash = '/settings');
    
    const usernameInput = document.querySelector('#username-input');
    usernameInput.value = localStorage.getItem('chatUsername') || '';

    // Re-anexar todos os outros eventos do chat
    attachChatListeners();
    fetchComments();
    listenToChanges();
};

const renderSettingsPage = () => {
    renderTemplate('#template-settings');
    document.querySelector('#back-btn').addEventListener('click', () => window.location.hash = '/');
    
    const usernameSettingInput = document.querySelector('#username-setting');
    usernameSettingInput.value = localStorage.getItem('chatUsername') || '';

    document.querySelector('#save-settings-btn').addEventListener('click', () => {
        const newUsername = usernameSettingInput.value.trim();
        if (newUsername) {
            localStorage.setItem('chatUsername', newUsername);
            window.location.hash = '/';
        }
    });
};

const attachChatListeners = () => {
    let selectedFile = null;
    const fileInput = document.querySelector('#file-input');
    const imagePreviewContainer = document.querySelector('#image-preview');
    const previewImage = document.querySelector('#preview-image');

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

    document.querySelector('#remove-image-btn').addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        imagePreviewContainer.style.display = 'none';
    });

    document.querySelector('#message-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.querySelector('#username-input').value.trim();
        const content = document.querySelector('#message-input').value.trim();

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
            document.querySelector('#message-input').value = '';
            document.querySelector('#remove-image-btn').click();
        } catch (error) { console.error("Erro ao salvar:", error); }
    });
};

const fetchComments = async () => {
    document.querySelector('#loader').style.display = 'block';
    const query = new Parse.Query("Comentarios");
    query.ascending("createdAt");
    try {
        const comments = await query.find();
        document.querySelector('#loader').style.display = 'none';
        const messagesList = document.querySelector('#messages-list');
        messagesList.innerHTML = '';
        comments.forEach(displayComment);
    } catch (error) { console.error("Erro ao buscar:", error); }
};

const displayComment = (comment) => {
    const messagesList = document.querySelector('#messages-list');
    if (!messagesList) return;

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
    messagesList.scrollTop = messagesList.scrollHeight;

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
    subscription.on('create', (comment) => { displayComment(comment); });
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

window.addEventListener('hashchange', router);
router(); // Inicia o roteador na primeira carga
