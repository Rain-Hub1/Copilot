-- CopilotLib.lua
-- Biblioteca principal de UI para Roblox

local CopilotLib = {}

-- Temas
CopilotLib.themes = {
    default = {
        backgroundColor = Color3.fromRGB(255, 255, 255),
        textColor = Color3.fromRGB(0, 0, 0)
    },
    dark = {
        backgroundColor = Color3.fromRGB(30, 30, 30),
        textColor = Color3.fromRGB(255, 255, 255)
    }
}

-- Sistema de chave
function CopilotLib.generateKey()
    return tostring(math.random(100000, 999999))
end

-- Validação remota
function CopilotLib.validateInput(input)
    return type(input) == "string" and #input > 0
end

-- Componentes UI
function CopilotLib.createButton(name, callback)
    local button = Instance.new("TextButton")
    button.Text = name
    button.MouseButton1Click:Connect(callback)
    return button
end

return CopilotLib