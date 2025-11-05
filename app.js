// --- 1. CONFIGURAÇÃO DO SUPABASE ---
// Cole suas chaves da API do Supabase aqui
const SUPABASE_URL = 'https://ypfbzkgjhukjbgpxudxw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZmJ6a2dqaHVramJncHh1ZHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzAxOTcsImV4cCI6MjA3Nzk0NjE5N30.t3JQWZXw5_Aer-cCdad9XcWE129h_or88LcqKmn0WMc';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. ELEMENTOS DO HTML ---
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const messagesList = document.querySelector('#messages-list');
const authContainer = document.querySelector('#auth-container');

// --- 3. AUTENTICAÇÃO ---
// Função para configurar a interface do usuário com base no status de login
async function setupAuthUI() {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
        // Usuário está logado
        authContainer.innerHTML = `<button id="logout-btn">Sair</button>`;
        document.querySelector('#logout-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload(); // Recarrega a página após o logout
        });
        messageInput.disabled = false;
        messageForm.querySelector('button').disabled = false;
    } else {
        // Usuário não está logado
        authContainer.innerHTML = `<button id="login-btn">Entrar com GitHub</button>`;
        document.querySelector('#login-btn').addEventListener('click', () => {
            supabase.auth.signInWithOAuth({
                provider: 'github',
            });
        });
        messageInput.disabled = true;
        messageForm.querySelector('button').disabled = true;
    }
}

// --- 4. FUNÇÕES DO CHAT ---
// Função para buscar e exibir os comentários
async function fetchComments() {
    const { data: comments, error } = await supabase
        .from('comentarios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar comentários:', error);
        return;
    }

    messagesList.innerHTML = ''; // Limpa a lista antes de adicionar os novos
    for (const comment of comments) {
        displayComment(comment);
    }
}

// Função para exibir um único comentário na tela
function displayComment(comment) {
    const { data: { session } } = supabase.auth.getSession();
    const user = session?.user;
    const isOwner = user && user.id === comment.user_id;

    const commentElement = document.createElement('div');
    commentElement.id = `comment-${comment.id}`;
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${comment.user_id.substring(0, 8)}</strong> <!-- Mostra parte do ID do usuário -->
            <span>${new Date(comment.created_at).toLocaleTimeString('pt-BR')}</span>
        </div>
        <p>${comment.content}</p>
        <div class="comment-actions">
            <button class="like-btn" data-id="${comment.id}">👍 Curtir (${comment.likes})</button>
            ${isOwner ? `<button class="delete-btn" data-id="${comment.id}">🗑️ Deletar</button>` : ''}
        </div>
    `;
    messagesList.prepend(commentElement); // Adiciona no início da lista

    // Adiciona evento de clique para deletar
    if (isOwner) {
        commentElement.querySelector('.delete-btn').addEventListener('click', async (e) => {
            const commentId = e.target.dataset.id;
            await deleteComment(commentId);
        });
    }
    
    // Adiciona evento de clique para curtir
    commentElement.querySelector('.like-btn').addEventListener('click', async (e) => {
        const commentId = e.target.dataset.id;
        await likeComment(commentId, comment.likes);
    });
}

// Função para enviar um novo comentário
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    const { data: { user } } = await supabase.auth.getUser();

    if (content && user) {
        await supabase.from('comentarios').insert({ content: content, user_id: user.id });
        messageInput.value = '';
    }
});

// Função para deletar um comentário
async function deleteComment(id) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
        .from('comentarios')
        .delete()
        .match({ id: id, user_id: user.id }); // Só pode deletar se for o dono
}

// Função para curtir um comentário
async function likeComment(id, currentLikes) {
    const newLikes = currentLikes + 1;
    await supabase
        .from('comentarios')
        .update({ likes: newLikes })
        .eq('id', id);
}

// --- 5. REAL-TIME ---
// Ouve por mudanças na tabela 'comentarios'
supabase.channel('public:comentarios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios' }, (payload) => {
        console.log('Mudança recebida!', payload);
        
        if (payload.eventType === 'INSERT') {
            displayComment(payload.new);
        }
        if (payload.eventType === 'DELETE') {
            const elementToRemove = document.querySelector(`#comment-${payload.old.id}`);
            if (elementToRemove) elementToRemove.remove();
        }
        if (payload.eventType === 'UPDATE') {
            const elementToUpdate = document.querySelector(`#comment-${payload.new.id}`);
            if (elementToUpdate) {
                // Atualiza o contador de curtidas
                elementToUpdate.querySelector('.like-btn').textContent = `👍 Curtir (${payload.new.likes})`;
            }
        }
    })
    .subscribe();

// --- 6. INICIALIZAÇÃO ---
// Roda as funções iniciais quando a página carrega
setupAuthUI();
fetchComments();
