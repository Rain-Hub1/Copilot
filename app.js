const PARSE_APPLICATION_ID = 'Tk5Zxhr0L5RZkXu8xTAn0uBYCOJcD9Z0JctLnmTz';
const PARSE_JAVASCRIPT_KEY = 'SXU64wQdwWggMcOOAz4OCqQ8KnBrBeCGiREtGkNi';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

const root = document.querySelector('#root');
const templates = {
    chat: document.querySelector('#template-chat'),
    login: document.querySelector('#template-login'),
    signup: document.querySelector('#template-signup')
};

const icons = {
    like: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M5.32.942a.75.75 0 0 1 .917-.015l.07.06C7.063 1.68 8.32 2.843 9.5 4.25c.142.17.284.34.424.51.14-.17.282-.34.424-.51C11.68 2.843 12.937 1.68 13.69.987l.07-.06a.75.75 0 0 1 .917.015l.06.053c.415.37.745.81.992 1.299l.04.085c.32 1.013.21 2.124-.31 3.088l-.1.173C14.165 7.28 13.063 8.5 12 9.737c-1.062 1.238-2.124 2.475-3.187 3.712a.75.75 0 0 1-1.117.004c-1.063-1.237-2.125-2.474-3.188-3.712C3.437 8.5 2.335 7.28 1.44 5.79l-.1-.173c-.52-1-.63-2.16-.31-3.173l.04-.085c.247-.49.577-.93.992-1.3l.06-.052Z"></path></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.71l.5 5a.75.75 0 0 1-1.474.14l-.5-5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.5 5a.75.75 0 0 1-1.474-.14l.5-5a.75.75 0 0 1 .762-.647Z" clip-rule="evenodd"></path></svg>'
};

const router = () => {
    const path = window.location.hash || '#/';
    root.innerHTML = '';
    const currentUser = Parse.User.current();
    if (currentUser) {
        if (path === '#/login' || path === '#/signup') { window.location.hash = '/'; return; }
        renderChatPage();
    } else {
        if (path === '#/signup') { renderSignupPage(); } else { renderLoginPage(); }
    }
};

const renderTemplate = (template) => {
    const content = template.content.cloneNode(true);
    root.appendChild(content);
};

const renderChatPage = () => {
    renderTemplate(templates.chat);
    document.querySelector('#logout-btn').addEventListener('click', async () => { await Parse.User.logOut(); router(); });
    document.querySelector('#message-form').addEventListener('submit', handleMessageSubmit);
    fetchComments();
    listenToChanges();
};

const renderLoginPage = () => {
    renderTemplate(templates.login);
    document.querySelector('#login-form').addEventListener('submit', handleLogin);
};

const renderSignupPage = () => {
    renderTemplate(templates.signup);
    document.querySelector('#signup-form').addEventListener('submit', handleSignup);
};

const handleLogin = async (e) => {
    e.preventDefault();
    try {
        await Parse.User.logIn(e.target.email.value, e.target.password.value);
        router();
    } catch (error) { document.querySelector('#error-message').textContent = 'Login inválido: ' + error.message; }
};

const handleSignup = async (e) => {
    e.preventDefault();
    const user = new Parse.User();
    user.set("username", e.target.email.value);
    user.set("email", e.target.email.value);
    user.set("password", e.target.password.value);
    try {
        await user.signUp();
        router();
    } catch (error) { document.querySelector('#error-message').textContent = 'Erro no cadastro: ' + error.message; }
};

const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const messageInput = document.querySelector('#message-input');
    const content = messageInput.value.trim();
    if (content) {
        const Comentario = Parse.Object.extend("Comentarios");
        const comentario = new Comentario();
        comentario.set("content", content);
        comentario.set("likes", 0);
        comentario.set("user", Parse.User.current());
        await comentario.save();
        messageInput.value = '';
    }
};

const fetchComments = async () => {
    const loader = document.querySelector('#loader');
    const messagesList = document.querySelector('#messages-list');
    loader.style.display = 'block';
    const Comentario = Parse.Object.extend("Comentarios");
    const query = new Parse.Query(Comentario);
    query.include("user");
    query.ascending("createdAt");
    const comments = await query.find();
    loader.style.display = 'none';
    messagesList.innerHTML = '';
    comments.forEach(comment => displayComment(comment));
};

const displayComment = (comment) => {
    const messagesList = document.querySelector('#messages-list');
    if (!messagesList) return;
    const user = comment.get("user");
    const currentUser = Parse.User.current();
    const isOwner = currentUser && user && currentUser.id === user.id;
    const userEmail = user ? user.get("email") : "Anônimo";

    const commentElement = document.createElement('div');
    commentElement.id = `comment-${comment.id}`;
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${userEmail.split('@')[0]}</strong>
            <span>${new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p>${comment.get("content")}</p>
        <div class="comment-actions">
            <button class="like-btn" data-id="${comment.id}" data-likes="${comment.get("likes") || 0}">${icons.like} <span>Curtir (${comment.get("likes") || 0})</span></button>
            ${isOwner ? `<button class="delete-btn" data-id="${comment.id}">${icons.delete} <span>Deletar</span></button>` : ''}
        </div>
    `;
    messagesList.appendChild(commentElement);

    if (isOwner) {
        commentElement.querySelector('.delete-btn').addEventListener('click', (e) => deleteComment(e.target.closest('button').dataset.id));
    }
    commentElement.querySelector('.like-btn').addEventListener('click', (e) => likeComment(e.target.closest('button').dataset.id));
};

const deleteComment = async (id) => {
    const Comentario = Parse.Object.extend("Comentarios");
    const query = new Parse.Query(Comentario);
    const comentario = await query.get(id);
    await comentario.destroy();
};

const likeComment = async (id) => {
    const Comentario = Parse.Object.extend("Comentarios");
    const query = new Parse.Query(Comentario);
    const comentario = await query.get(id);
    comentario.increment("likes");
    await comentario.save();
};

const listenToChanges = async () => {
    const query = new Parse.Query('Comentarios');
    const subscription = await query.subscribe();
    subscription.on('create', (comment) => {
        comment.get("user").fetch().then(() => displayComment(comment));
    });
    subscription.on('update', (comment) => {
        const likeButton = document.querySelector(`#comment-${comment.id} .like-btn`);
        if (likeButton) {
            const newLikes = comment.get("likes") || 0;
            likeButton.dataset.likes = newLikes;
            likeButton.querySelector('span').textContent = `Curtir (${newLikes})`;
        }
    });
    subscription.on('delete', (comment) => {
        document.querySelector(`#comment-${comment.id}`)?.remove();
    });
};

router();
