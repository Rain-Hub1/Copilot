-- Exemplo prático de uso da biblioteca Copilot

-- Criando uma janela
local window = Lib:Window("Exemplo Copilot", 600, 400)

-- Adicionando um parágrafo
local paragraph = window:Paragraph("Este é um exemplo de uso da biblioteca Copilot.")

-- Criando um botão
local button = window:Button("Clique Aqui", function()
    Notify("Você clicou no botão!")
end)

-- Criando um botão de alternância
local toggle = window:Toggle("Ativar Notificação", false, function(state)
    if state then
        Notify("Notificações ativadas!")
    else
        Notify("Notificações desativadas!")
    end
end)

-- Exibindo a janela
window:Show()