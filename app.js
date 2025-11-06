const { Client, Databases, Storage, Query, ID } = Appwrite;

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'as-bah-mkskejjsjb91-jkjjjjjvdihhjnnn';
const DATABASE_ID = 'db-chat';
const COLLECTION_ID = 'comentarios';
const BUCKET_ID = '690c218f0005c98c9957';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);

const messagesList = document.querySelector('#messages-list');
const loader = document.querySelector('#loader');
const usernameInput = document.querySelector('#username-input');

const attachChatListeners = () => {
    let selectedFile = null;
    const messageForm = document.querySelector('#message-form');
    const messageInput = document.querySelector('#message-input');
    const fileInput = document.querySelector('#file-input');
    const imagePreviewContainer = document.querySelector('#image-preview');
    const previewImage = document.querySelector('#preview-image');
    const removeImageBtn = document.querySelector('#remove-image-btn');
    const sendBtn = document.querySelector('.send-btn');

    document.querySelector('#image-upload-btn').addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            previewImage.src = URL.createObjectURL(selectedFile);
            imagePreviewContainer.style.display = 'block';
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
        
        sendBtn.disabled = true;
        let fileId = null;

        try {
            if (selectedFile) {
                const uploadedFile = await storage.createFile(
                    BUCKET_ID,
                    ID.unique(),
                    selectedFile
                );
                fileId = uploadedFile.$id;
            }

            const newComment = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    username: username,
                    content: content,
                    likes: 0,
                    fileId: fileId
                },
                [
                    `read("any")`,
                    `update("any")`,
                    `delete("any")`
                ]
            );

            displayComment(newComment);

            messageInput.value = '';
            removeImageBtn.click();
            localStorage.setItem('chatUsername', username);

        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            alert("Não foi possível enviar o comentário.");
        } finally {
            sendBtn.disabled = false;
        }
    });
};

const fetchComments = async () => {
    loader.style.display = 'block';
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.orderAsc('$createdAt')]
        );
        loader.style.display = 'none';
        messagesList.innerHTML = '';
        response.documents.forEach(displayComment);
        messagesList.scrollTop = messagesList.scrollHeight;
    } catch (error) {
        console.error("Erro ao buscar:", error);
        loader.style.display = 'none';
    }
};

const getFileUrl = (fileId) => {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
};

const displayComment = (comment) => {
    const username = comment.username || "Anônimo";
    const content = comment.content;
    const likes = comment.likes || 0;
    const fileId = comment.fileId;

    const commentElement = document.createElement('div');
    commentElement.id = `comment-${comment.$id}`;
    commentElement.classList.add('comment');
    
    const imageHTML = fileId ? `<img src="${getFileUrl(fileId)}" class="comment-image" alt="Imagem do comentário">` : '';
    const contentHTML = content ? `<p>${content}</p>` : '';

    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${username}</strong>
            <span>${new Date(comment.$createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        ${imageHTML}
        ${contentHTML}
        <div class="comment-actions">
            <button class="like-btn" data-id="${comment.$id}">👍 <span>Curtir (${likes})</span></button>
            <button class="delete-btn" data-id="${comment.$id}">🗑️ <span>Deletar</span></button>
        </div>
    `;
    messagesList.appendChild(commentElement);

    commentElement.querySelector('.delete-btn').addEventListener('click', (e) => deleteComment(e.target.closest('button').dataset.id));
    commentElement.querySelector('.like-btn').addEventListener('click', (e) => likeComment(e.target.closest('button').dataset.id, likes));
};

const deleteComment = async (id) => {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
        console.error("Erro ao deletar:", error);
    }
};

const likeComment = async (id, currentLikes) => {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            id,
            { likes: currentLikes + 1 }
        );
    } catch (error) {
        console.error("Erro ao curtir:", error);
    }
};

const listenToChanges = () => {
    client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`, (response) => {
        const payload = response.payload;
        
        if (response.events.includes(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.*.create`)) {
            // O Appwrite Realtime envia o objeto completo, mas evitamos duplicidade
            // Já adicionamos o comentário na tela no momento do envio
        }

        if (response.events.includes(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.*.update`)) {
            const likeButtonSpan = document.querySelector(`#comment-${payload.$id} .like-btn span`);
            if (likeButtonSpan) {
                likeButtonSpan.textContent = `Curtir (${payload.likes || 0})`;
            }
        }

        if (response.events.includes(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.*.delete`)) {
            document.querySelector(`#comment-${payload.$id}`)?.remove();
        }
    });
};

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

    const closeModal = () => { settingsModal.style.display = 'none'; };
    closeModalBtn.addEventListener('click', closeModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });
    saveSettingsBtn.addEventListener('click', () => {
        const newUsername = usernameSettingInput.value.trim();
        if (newUsername) {
            localStorage.setItem('chatUsername', newUsername);
            usernameInput.value = newUsername;
        }
        closeModal();
    });
};

const init = async () => {
    usernameInput.value = localStorage.getItem('chatUsername') || '';
    attachChatListeners();
    attachSettingsListeners();
    await fetchComments();
    listenToChanges();
};

init();
