const SUPABASE_URL = "https://ypfbzkgjhukjbgpxudxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZmJ6a2dqaHVramJncHh1ZHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzAxOTcsImV4cCI6MjA3Nzk0NjE5N30.t3JQWZXw5_Aer-cCdad9XcWE129h_or88LcqKmn0WMc";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

let messageSubscription = null;

const router = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const path = window.location.hash || '#/';

    root.innerHTML = '';

    if (session) {
        if (path === '#/login' || path === '#/signup') {
            window.location.hash = '/';
            return;
        }
        renderChatPage();
    } else {
        if (path === '#/signup') {
            renderSignupPage();
        } else {
            renderLoginPage();
        }
    }
};

const renderTemplate = (template) => {
    const content = template.content.cloneNode(true);
    root.appendChild(content);
};

const renderChatPage = () => {
    renderTemplate(templates.chat);
    
    document.querySelector('#logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    const messageForm = document.querySelector('#message-form');
    messageForm.addEventListener('submit', handleMessageSubmit);

    fetchComments();
    listenToChanges();
};

const renderLoginPage = () => {
    renderTemplate(templates.login);
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', handleLogin);
};

const renderSignupPage = () => {
    renderTemplate(templates.signup);
    const signupForm = document.querySelector('#signup-form');
    signupForm.addEventListener('submit', handleSignup);
};

const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        document.querySelector('#error-message').textContent = 'Email ou senha inválidos.';
    }
};

const handleSignup = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        document.querySelector('#error-message').textContent = 'Não foi possível criar a conta.';
    } else {
        document.querySelector('.auth-form-container').innerHTML = '<h1>Verifique seu email</h1><p>Enviamos um link de confirmação para você.</p>';
    }
};

const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const messageInput = document.querySelector('#message-input');
    const content = messageInput.value.trim();
    const { data: { user } } = await supabase.auth.getUser();

    if (content && user) {
        await supabase.from('comentarios').insert({ content: content, user_id: user.id });
        messageInput.value = '';
    }
};

const fetchComments = async () => {
    const loader = document.querySelector('#loader');
    const messagesList = document.querySelector('#messages-list');
    loader.style.display = 'block';
    const { data: comments, error } = await supabase.from('comentarios').select('*').order('created_at', { ascending: true });
    loader.style.display = 'none';

    if (error) return;

    messagesList.innerHTML = '';
    for (const comment of comments) {
        displayComment(comment, { prepend: false });
    }
};

const displayComment = (comment, options = { prepend: false }) => {
    const messagesList = document.querySelector('#messages-list');
    if (!messagesList) return;

    const { data: { session } } = supabase.auth.getSession();
    const user = session?.user;
    const isOwner = user && user.id === comment.user_id;

    const commentElement = document.createElement('div');
    commentElement.id = `comment-${comment.id}`;
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${comment.user_id.substring(0, 8)}...</strong>
            <span>${new Date(comment.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p>${comment.content}</p>
        <div class="comment-actions">
            <button class="like-btn" data-id="${comment.id}" data-likes="${comment.likes}">
                ${icons.like} <span>Curtir (${comment.likes})</span>
            </button>
            ${isOwner ? `<button class="delete-btn" data-id="${comment.id}">${icons.delete} <span>Deletar</span></button>` : ''}
        </div>
    `;

    if (options.prepend) {
        messagesList.prepend(commentElement);
    } else {
        messagesList.appendChild(commentElement);
    }

    if (isOwner) {
        commentElement.querySelector('.delete-btn').addEventListener('click', (e) => deleteComment(e.target.closest('button').dataset.id));
    }
    
    commentElement.querySelector('.like-btn').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        likeComment(button.dataset.id, parseInt(button.dataset.likes, 10));
    });
};

const deleteComment = async (id) => {
    await supabase.from('comentarios').delete().eq('id', id);
};

const likeComment = async (id, currentLikes) => {
    await supabase.from('comentarios').update({ likes: currentLikes + 1 }).eq('id', id);
};

const listenToChanges = () => {
    if (messageSubscription) {
        messageSubscription.unsubscribe();
    }
    messageSubscription = supabase.channel('public:comentarios')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios' }, (payload) => {
            if (payload.eventType === 'INSERT') displayComment(payload.new, { prepend: true });
            if (payload.eventType === 'DELETE') document.querySelector(`#comment-${payload.old.id}`)?.remove();
            if (payload.eventType === 'UPDATE') {
                const likeButton = document.querySelector(`#comment-${payload.new.id} .like-btn`);
                if (likeButton) {
                    likeButton.dataset.likes = payload.new.likes;
                    likeButton.querySelector('span').textContent = `Curtir (${payload.new.likes})`;
                }
            }
        })
        .subscribe();
};

window.addEventListener('hashchange', router);
supabase.auth.onAuthStateChange((event, session) => {
    router();
});

router();
