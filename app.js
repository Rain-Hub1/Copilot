const PARSE_APPLICATION_ID = 'Tk5Zxhr0L5RZkXu8xTAn0uBYCOJcD9Z0JctLnmTz';
const PARSE_JAVASCRIPT_KEY = 'SXU64wQdwWggMcOOAz4OCqQ8KnBrBeCGiREtGkNi';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

const messageForm = document.querySelector('#message-form');
const usernameInput = document.querySelector('#username-input');
const messageInput = document.querySelector('#message-input');
const messagesList = document.querySelector('#messages-list');
const loader = document.querySelector('#loader');

const icons = {
    like: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M5.32.942a.75.75 0 0 1 .917-.015l.07.06C7.063 1.68 8.32 2.843 9.5 4.25c.142.17.284.34.424.51.14-.17.282-.34.424-.51C11.68 2.843 12.937 1.68 13.69.987l.07-.06a.75.75 0 0 1 .917.015l.06.053c.415.37.745.81.992 1.299l.04.085c.32 1.013.21 2.124-.31 3.088l-.1.173C14.165 7.28 13.063 8.5 12 9.737c-1.062 1.238-2.124 2.475-3.187 3.712a.75.75 0 0 1-1.117.004c-1.063-1.237-2.125-2.474-3.188-3.712C3.437 8.5 2.335 7.28 1.44 5.79l-.1-.173c-.52-1-.63-2.16-.31-3.173l.04-.085c.247-.49.577-.93.992-1.3l.06-.052Z"></path></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.71l.5 5a.75.75 0 0 1-1.474.14l-.5-5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.5 5a.75.75 0 0 1-1.474-.14l.5-5a.75.75 0 0 1 .762-.647Z" clip-rule="evenodd"></path></svg>'
};

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const content = messageInput.value.trim();

    if (content && username) {
        const Comentario = Parse.Object.extend("Comentarios");
        const comentario = new Comentario();
        comentario.set("content", content);
        comentario.set("username", username);
        comentario.set("likes", 0);
        
        try {
            await comentario.save();
            messageInput.value = '';
            messageInput.focus();
            // Salva o nome de usuário para a próxima mensagem
            localStorage.setItem('chatUsername', username);
        } catch (error) {
            console.error("Erro ao salvar comentário:", error);
        }
    }
});

const fetchComments = async () => {
    loader.style.display = 'block';
    const Comentario = Parse.Object.extend("Comentarios");
    const query = new Parse.Query(Comentario);
    query.ascending("createdAt");
    try {
        const comments = await query.find();
        loader.style.display = 'none';
        messagesList.innerHTML = '';
        comments.forEach(comment => displayComment(comment));
    } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        loader.style.display = 'none';
    }
};

const displayComment = (comment) => {
    const username = comment.get("username") || "Anônimo";
    const content = comment.get("content");
    const likes = comment.get("likes") || 0;

    const commentElement = document.createElement('div');
    commentElement.id = `comment-${comment.id}`;
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${username}</strong>
            <span>${new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p>${content}</p>
        <div class="comment-actions">
            <button class="like-btn" data-id="${comment.id}">${icons.like} <span>Curtir (${likes})</span></button>
            <button class="delete-btn" data-id="${comment.id}">${icons.delete} <span>Deletar</span></button>
        </div>
    `;
    messagesList.appendChild(commentElement);
    messagesList.scrollTop = messagesList.scrollHeight; // Rola para o final

    commentElement.querySelector('.delete-btn').addEventListener('click', (e) => deleteComment(e.target.closest('button').dataset.id));
    commentElement.querySelector('.like-btn').addEventListener('click', (e) => likeComment(e.target.closest('button').dataset.id));
};

const deleteComment = async (id) => {
    const Comentario = Parse.Object.extend("Comentarios");
    const query = new Parse.Query(Comentario);
    try {
        const comentario = await query.get(id);
        await comentario.destroy();
    } catch (error) {
        console.error("Erro ao deletar:", error);
    }
};

const likeComment = async (id) => {
    const Comentario = Parse.Object.extend("Comentarios");
    const query = new Parse.Query(Comentario);
    try {
        const comentario = await query.get(id);
        comentario.increment("likes");
        await comentario.save();
    } catch (error) {
        console.error("Erro ao curtir:", error);
    }
};

const listenToChanges = async () => {
    const query = new Parse.Query('Comentarios');
    const subscription = await query.subscribe();

    subscription.on('create', (comment) => {
        // Adiciona o novo comentário na tela
        displayComment(comment);
    });

    subscription.on('update', (comment) => {
        // Atualiza o contador de curtidas
        const likeButtonSpan = document.querySelector(`#comment-${comment.id} .like-btn span`);
        if (likeButtonSpan) {
            likeButtonSpan.textContent = `Curtir (${comment.get("likes") || 0})`;
        }
    });

    subscription.on('delete', (comment) => {
        // Remove o comentário da tela
        const elementToRemove = document.querySelector(`#comment-${comment.id}`);
        if (elementToRemove) {
            elementToRemove.remove();
        }
    });
};

// Função para iniciar tudo
const init = async () => {
    // Preenche o nome de usuário se já foi salvo antes
    usernameInput.value = localStorage.getItem('chatUsername') || '';
    await fetchComments();
    await listenToChanges();
};

init();
