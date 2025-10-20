-- Hello Copilot
--[[
  Create a UI with the code "--!strict
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

local Lib = {}

-- Temas disponíveis
local THEMES = {
	Dark = {
		Background = Color3.fromRGB(30, 30, 40),
		Foreground = Color3.fromRGB(45, 45, 55),
		Text = Color3.fromRGB(255, 255, 255),
		Accent = Color3.fromRGB(0, 150, 255),
		Success = Color3.fromRGB(60, 180, 80),
		Error = Color3.fromRGB(220, 80, 80),
		Warning = Color3.fromRGB(255, 180, 0)
	},
	Darker = {
		Background = Color3.fromRGB(15, 15, 20),
		Foreground = Color3.fromRGB(25, 25, 35),
		Text = Color3.fromRGB(240, 240, 240),
		Accent = Color3.fromRGB(0, 130, 220),
		Success = Color3.fromRGB(50, 170, 70),
		Error = Color3.fromRGB(200, 60, 60),
		Warning = Color3.fromRGB(240, 160, 0)
	},
	Cyberpunk = {
		Background = Color3.fromRGB(10, 10, 25),
		Foreground = Color3.fromRGB(20, 20, 40),
		Text = Color3.fromRGB(255, 50, 255),
		Accent = Color3.fromRGB(0, 255, 255),
		Success = Color3.fromRGB(0, 255, 150),
		Error = Color3.fromRGB(255, 50, 100),
		Warning = Color3.fromRGB(255, 255, 0)
	}
}

-- Função para verificar keys remotas
local function checkRemoteKeys(url, keysToCheck)
	local success, result = pcall(function()
		return game:HttpGet(url)
	end)
	
	if success then
		local remoteKeys = {}
		for key in string.gmatch(result, '[%w%-]+') do
			table.insert(remoteKeys, key)
		end
		
		for _, inputKey in ipairs(keysToCheck) do
			for _, remoteKey in ipairs(remoteKeys) do
				if inputKey == remoteKey then
					return true
				end
			end
		end
	end
	
	return false
end

function Lib:Window(Info)
	local Info = Info or {}
	local Title = Info.Title or "UI Library"
	local OpenButton = Info.OpenButton
	local ThemeName = Info.Theme or "Darker"
	local Size = Info.Size or {470, 340}
	local Key = Info.Key
	local KeyS = Info.KeyS
	local Parent = Info.Parent or Players.LocalPlayer:WaitForChild("PlayerGui")
	
	local theme = THEMES[ThemeName] or THEMES.Darker
	local isOpen = false
	local elements = {}
	local notifications = {}
	
	-- Validar e extrair tamanho
	local windowWidth = tonumber(Size[1]) or 470
	local windowHeight = tonumber(Size[2]) or 340
	
	-- Sistema de Key
	local keyValidated = false
	local keyScreenGui = nil
	
	-- Função para criar a interface de key
	local function createKeyInterface()
		if keyScreenGui then
			keyScreenGui:Destroy()
		end
		
		keyScreenGui = Instance.new("ScreenGui")
		keyScreenGui.Name = "KeyInterface"
		keyScreenGui.ResetOnSpawn = false
		keyScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
		keyScreenGui.Parent = Parent
		
		local keyTheme = THEMES[KeyS.Theme or "Darker"] or THEMES.Darker
		local keySize = KeyS.Size or {250, 300}
		local keyWidth, keyHeight = keySize[1], keySize[2]
		
		-- Frame principal da key
		local KeyMainFrame = Instance.new("Frame")
		KeyMainFrame.Name = "KeyMainFrame"
		KeyMainFrame.Size = UDim2.new(0, keyWidth, 0, keyHeight)
		KeyMainFrame.AnchorPoint = Vector2.new(0.5, 0.5)
		KeyMainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
		KeyMainFrame.BackgroundColor3 = keyTheme.Background
		KeyMainFrame.Parent = keyScreenGui
		
		-- Efeitos visuais
		local UICorner = Instance.new("UICorner")
		UICorner.CornerRadius = UDim.new(0, 12)
		UICorner.Parent = KeyMainFrame
		
		local UIStroke = Instance.new("UIStroke")
		UIStroke.Color = keyTheme.Accent
		UIStroke.Thickness = 2
		UIStroke.Parent = KeyMainFrame
		
		local DropShadow = Instance.new("ImageLabel")
		DropShadow.Name = "DropShadow"
		DropShadow.Size = UDim2.new(1, 0, 1, 0)
		DropShadow.Position = UDim2.new(0, 0, 0, 0)
		DropShadow.BackgroundTransparency = 1
		DropShadow.Image = "rbxassetid://6010260683"
		DropShadow.ImageColor3 = Color3.new(0, 0, 0)
		DropShadow.ImageTransparency = 0.9
		DropShadow.ScaleType = Enum.ScaleType.Slice
		DropShadow.SliceCenter = Rect.new(49, 49, 450, 450)
		DropShadow.Parent = KeyMainFrame
		
		-- Título
		local TitleLabel = Instance.new("TextLabel")
		TitleLabel.Name = "TitleLabel"
		TitleLabel.Size = UDim2.new(1, -20, 0, 40)
		TitleLabel.Position = UDim2.new(0, 10, 0, 10)
		TitleLabel.BackgroundTransparency = 1
		TitleLabel.Text = KeyS.Title or "Enter Key"
		TitleLabel.TextColor3 = keyTheme.Text
		TitleLabel.TextSize = 18
		TitleLabel.Font = Enum.Font.GothamBold
		TitleLabel.Parent = KeyMainFrame
		
		-- Campo de entrada
		local KeyTextBox = Instance.new("TextBox")
		KeyTextBox.Name = "KeyTextBox"
		KeyTextBox.Size = UDim2.new(1, -20, 0, 40)
		KeyTextBox.Position = UDim2.new(0, 10, 0, 60)
		KeyTextBox.BackgroundColor3 = keyTheme.Foreground
		KeyTextBox.TextColor3 = keyTheme.Text
		KeyTextBox.PlaceholderColor3 = Color3.fromRGB(150, 150, 150)
		KeyTextBox.PlaceholderText = "Enter your key here..."
		KeyTextBox.Text = ""
		KeyTextBox.TextSize = 14
		KeyTextBox.Font = Enum.Font.Gotham
		KeyTextBox.Parent = KeyMainFrame
		
		local TextBoxCorner = Instance.new("UICorner")
		TextBoxCorner.CornerRadius = UDim.new(0, 8)
		TextBoxCorner.Parent = KeyTextBox
		
		-- Botão de submit
		local SubmitButton = Instance.new("TextButton")
		SubmitButton.Name = "SubmitButton"
		SubmitButton.Size = UDim2.new(1, -20, 0, 40)
		SubmitButton.Position = UDim2.new(0, 10, 0, 110)
		SubmitButton.BackgroundColor3 = keyTheme.Accent
		SubmitButton.Text = "Submit Key"
		SubmitButton.TextColor3 = keyTheme.Text
		SubmitButton.TextSize = 14
		SubmitButton.Font = Enum.Font.GothamBold
		SubmitButton.Parent = KeyMainFrame
		
		local SubmitCorner = Instance.new("UICorner")
		SubmitCorner.CornerRadius = UDim.new(0, 8)
		SubmitCorner.Parent = SubmitButton
		
		-- Botão para obter key
		if KeyS.Url then
			local GetKeyButton = Instance.new("TextButton")
			GetKeyButton.Name = "GetKeyButton"
			GetKeyButton.Size = UDim2.new(1, -20, 0, 40)
			GetKeyButton.Position = UDim2.new(0, 10, 0, 160)
			GetKeyButton.BackgroundColor3 = keyTheme.Success
			GetKeyButton.Text = "Get Key"
			GetKeyButton.TextColor3 = keyTheme.Text
			GetKeyButton.TextSize = 14
			GetKeyButton.Font = Enum.Font.GothamBold
			GetKeyButton.Parent = KeyMainFrame
			
			local GetKeyCorner = Instance.new("UICorner")
			GetKeyCorner.CornerRadius = UDim.new(0, 8)
			GetKeyCorner.Parent = GetKeyButton
			
			GetKeyButton.MouseButton1Click:Connect(function()
				game:GetService("StarterGui"):SetCore("OpenBrowserWindow", {
					Url = KeyS.Url
				})
			end)
		end
		
		-- Mensagem de status
		local StatusLabel = Instance.new("TextLabel")
		StatusLabel.Name = "StatusLabel"
		StatusLabel.Size = UDim2.new(1, -20, 0, 30)
		StatusLabel.Position = UDim2.new(0, 10, 1, -40)
		StatusLabel.BackgroundTransparency = 1
		StatusLabel.Text = ""
		StatusLabel.TextColor3 = keyTheme.Text
		StatusLabel.TextSize = 12
		StatusLabel.Font = Enum.Font.Gotham
		StatusLabel.TextWrapped = true
		StatusLabel.Parent = KeyMainFrame
		
		-- Função de validação
		local function validateKey()
			local inputKey = KeyTextBox.Text
			
			if inputKey == "" then
				StatusLabel.Text = "Please enter a key"
				StatusLabel.TextColor3 = keyTheme.Warning
				return
			end
			
			-- Verificar keys locais
			local validKeys = KeyS.Key or {}
			local isValid = false
			
			for _, key in ipairs(validKeys) do
				if inputKey == key then
					isValid = true
					break
				end
			end
			
			-- Verificar keys remotas se houver URL
			if not isValid and KeyS.Url then
				StatusLabel.Text = "Checking remote keys..."
				StatusLabel.TextColor3 = keyTheme.Text
				
				task.spawn(function()
					local remoteValid = checkRemoteKeys(KeyS.Url, {inputKey})
					
					if remoteValid then
						keyValidated = true
						StatusLabel.Text = "Key validated successfully!"
						StatusLabel.TextColor3 = keyTheme.Success
						
						task.wait(1)
						keyScreenGui:Destroy()
						createMainInterface()
					else
						StatusLabel.Text = "Invalid key! Please check and try again."
						StatusLabel.TextColor3 = keyTheme.Error
					end
				end)
			elseif isValid then
				keyValidated = true
				StatusLabel.Text = "Key validated successfully!"
				StatusLabel.TextColor3 = keyTheme.Success
				
				task.wait(1)
				keyScreenGui:Destroy()
				createMainInterface()
			else
				StatusLabel.Text = "Invalid key! Please check and try again."
				StatusLabel.TextColor3 = keyTheme.Error
			end
		end
		
		-- Conexões de eventos
		SubmitButton.MouseButton1Click:Connect(validateKey)
		
		KeyTextBox.FocusLost:Connect(function(enterPressed)
			if enterPressed then
				validateKey()
			end
		end)
		
		-- Efeitos de hover
		SubmitButton.MouseEnter:Connect(function()
			local tween = TweenService:Create(SubmitButton, TweenInfo.new(0.2), {
				BackgroundColor3 = Color3.fromRGB(
					math.floor(keyTheme.Accent.R * 255 * 0.8),
					math.floor(keyTheme.Accent.G * 255 * 0.8),
					math.floor(keyTheme.Accent.B * 255 * 0.8)
				)
			})
			tween:Play()
		end)
		
		SubmitButton.MouseLeave:Connect(function()
			local tween = TweenService:Create(SubmitButton, TweenInfo.new(0.2), {
				BackgroundColor3 = keyTheme.Accent
			})
			tween:Play()
		end)
	end
	
	-- Função para criar a interface principal
	local function createMainInterface()
		-- Criar a UI principal
		local ScreenGui = Instance.new("ScreenGui")
		ScreenGui.Name = "LibWindow"
		ScreenGui.ResetOnSpawn = false
		ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
		ScreenGui.Parent = Parent
		
		-- Botão de abrir/fechar (se OpenButton for true)
		local ToggleButton
		if OpenButton == true then
			ToggleButton = Instance.new("TextButton")
			ToggleButton.Name = "ToggleButton"
			ToggleButton.Size = UDim2.new(0, 120, 0, 40)
			ToggleButton.Position = UDim2.new(0, 20, 0, 20)
			ToggleButton.BackgroundColor3 = theme.Accent
			ToggleButton.Text = "Abrir UI"
			ToggleButton.TextColor3 = theme.Text
			ToggleButton.TextSize = 14
			ToggleButton.Font = Enum.Font.GothamBold
			ToggleButton.Parent = ScreenGui
			
			local ToggleCorner = Instance.new("UICorner")
			ToggleCorner.CornerRadius = UDim.new(0, 8)
			ToggleCorner.Parent = ToggleButton
			
			local ToggleStroke = Instance.new("UIStroke")
			ToggleStroke.Color = Color3.fromRGB(100, 100, 100)
			ToggleStroke.Thickness = 2
			ToggleStroke.Parent = ToggleButton
		end
		
		-- Frame principal
		local MainFrame = Instance.new("Frame")
		MainFrame.Name = "MainFrame"
		MainFrame.Size = UDim2.new(0, windowWidth, 0, windowHeight)
		MainFrame.AnchorPoint = Vector2.new(0.5, 0.5)
		MainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
		MainFrame.BackgroundColor3 = theme.Background
		MainFrame.BackgroundTransparency = 1
		MainFrame.Visible = false
		MainFrame.Parent = ScreenGui
		
		-- Efeitos visuais
		local UICorner = Instance.new("UICorner")
		UICorner.CornerRadius = UDim.new(0, 12)
		UICorner.Parent = MainFrame
		
		local UIStroke = Instance.new("UIStroke")
		UIStroke.Color = theme.Accent
		UIStroke.Thickness = 2
		UIStroke.Transparency = 1
		UIStroke.Parent = MainFrame
		
		local DropShadow = Instance.new("ImageLabel")
		DropShadow.Name = "DropShadow"
		DropShadow.Size = UDim2.new(1, 0, 1, 0)
		DropShadow.Position = UDim2.new(0, 0, 0, 0)
		DropShadow.BackgroundTransparency = 1
		DropShadow.Image = "rbxassetid://6010260683"
		DropShadow.ImageColor3 = Color3.new(0, 0, 0)
		DropShadow.ImageTransparency = 0.9
		DropShadow.ScaleType = Enum.ScaleType.Slice
		DropShadow.SliceCenter = Rect.new(49, 49, 450, 450)
		DropShadow.Parent = MainFrame
		
		-- Header
		local Header = Instance.new("Frame")
		Header.Name = "Header"
		Header.Size = UDim2.new(1, 0, 0, 45)
		Header.Position = UDim2.new(0, 0, 0, 0)
		Header.BackgroundColor3 = theme.Foreground
		Header.BackgroundTransparency = 1
		Header.Parent = MainFrame
		
		local HeaderCorner = Instance.new("UICorner")
		HeaderCorner.CornerRadius = UDim.new(0, 12)
		HeaderCorner.Parent = Header
		
		local TitleLabel = Instance.new("TextLabel")
		TitleLabel.Name = "TitleLabel"
		TitleLabel.Size = UDim2.new(1, -40, 1, 0)
		TitleLabel.Position = UDim2.new(0, 15, 0, 0)
		TitleLabel.BackgroundTransparency = 1
		TitleLabel.Text = Title
		TitleLabel.TextColor3 = theme.Text
		TitleLabel.TextSize = 18
		TitleLabel.Font = Enum.Font.GothamBold
		TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
		TitleLabel.Parent = Header
		
		local CloseButton = Instance.new("TextButton")
		CloseButton.Name = "CloseButton"
		CloseButton.Size = UDim2.new(0, 30, 0, 30)
		CloseButton.Position = UDim2.new(1, -35, 0.5, -15)
		CloseButton.BackgroundColor3 = theme.Error
		CloseButton.BackgroundTransparency = 1
		CloseButton.Text = "×"
		CloseButton.TextColor3 = theme.Text
		CloseButton.TextSize = 20
		CloseButton.Font = Enum.Font.GothamBold
		CloseButton.Parent = Header
		
		local CloseCorner = Instance.new("UICorner")
		CloseCorner.CornerRadius = UDim.new(1, 0)
		CloseCorner.Parent = CloseButton
		
		-- Container de conteúdo
		local ContentContainer = Instance.new("ScrollingFrame")
		ContentContainer.Name = "ContentContainer"
		ContentContainer.Size = UDim2.new(1, -20, 1, -65)
		ContentContainer.Position = UDim2.new(0, 10, 0, 55)
		ContentContainer.BackgroundTransparency = 1
		ContentContainer.BorderSizePixel = 0
		ContentContainer.ScrollBarThickness = 4
		ContentContainer.ScrollBarImageColor3 = theme.Accent
		ContentContainer.CanvasSize = UDim2.new(0, 0, 0, 0)
		ContentContainer.AutomaticCanvasSize = Enum.AutomaticSize.Y
		ContentContainer.Parent = MainFrame
		
		local UIListLayout = Instance.new("UIListLayout")
		UIListLayout.Padding = UDim.new(0, 12)
		UIListLayout.Parent = ContentContainer
		
		-- Sistema de arrastar para PC e Mobile
		local isDragging = false
		local dragStart: Vector2
		local dragOffset: Vector2
		
		local function makeDraggable(guiObject: GuiObject)
			local function startDrag(input: InputObject)
				isDragging = true
				dragStart = input.Position
				dragOffset = dragStart - guiObject.AbsolutePosition
				
				local tween = TweenService:Create(Header, TweenInfo.new(0.1), {
					BackgroundTransparency = 0.8
				})
				tween:Play()
			end
			
			local function endDrag(input: InputObject)
				isDragging = false
				
				local tween = TweenService:Create(Header, TweenInfo.new(0.1), {
					BackgroundTransparency = 1
				})
				tween:Play()
			end
			
			-- Para PC (Mouse)
			guiObject.InputBegan:Connect(function(input: InputObject)
				if input.UserInputType == Enum.UserInputType.MouseButton1 then
					startDrag(input)
				end
			end)

			-- Para Mobile (Touch)
			guiObject.InputBegan:Connect(function(input: InputObject)
				if input.UserInputType == Enum.UserInputType.Touch then
					startDrag(input)
				end
			end)

			-- Movimento para ambos
			UserInputService.InputChanged:Connect(function(input: InputObject)
				if isDragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
					local newPos = input.Position - dragOffset
					local screenSize = guiObject.Parent.AbsoluteSize
					local guiSize = guiObject.AbsoluteSize
					
					newPos = Vector2.new(
						math.clamp(newPos.X, 0, screenSize.X - guiSize.X),
						math.clamp(newPos.Y, 0, screenSize.Y - guiSize.Y)
					)
					
					guiObject.Position = UDim2.new(0, newPos.X, 0, newPos.Y)
				end
			end)

			-- Fim do arrasto para ambos
			UserInputService.InputEnded:Connect(function(input: InputObject)
				if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
					endDrag(input)
				end
			end)
		end
		
		makeDraggable(MainFrame)
		
		-- Funções de animação
		local function openWindow()
			if isOpen then return end
			isOpen = true
			MainFrame.Visible = true
			
			local tweenInfo = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
			
			local tween = TweenService:Create(MainFrame, tweenInfo, {
				BackgroundTransparency = 0
			})
			
			local strokeTween = TweenService:Create(UIStroke, tweenInfo, {
				Transparency = 0
			})
			
			tween:Play()
			strokeTween:Play()
			
			if ToggleButton then
				ToggleButton.Text = "Fechar UI"
			end
		end
		
		local function closeWindow()
			if not isOpen then return end
			isOpen = false
			
			local tweenInfo = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
			
			local tween = TweenService:Create(MainFrame, tweenInfo, {
				BackgroundTransparency = 1
			})
			
			local strokeTween = TweenService:Create(UIStroke, tweenInfo, {
				Transparency = 1
			})
			
			tween:Play()
			strokeTween:Play()
			
			tween.Completed:Connect(function()
				if not isOpen then
					MainFrame.Visible = false
				end
			end)
			
			if ToggleButton then
				ToggleButton.Text = "Abrir UI"
			end
		end
		
		-- Controle por botão (se OpenButton for true)
		if ToggleButton then
			ToggleButton.MouseButton1Click:Connect(function()
				if isOpen then
					closeWindow()
				else
					openWindow()
				end
			end)
			
			-- Efeitos de hover para o botão toggle
			ToggleButton.MouseEnter:Connect(function()
				local tween = TweenService:Create(ToggleButton, TweenInfo.new(0.2), {
					BackgroundColor3 = Color3.fromRGB(0, 110, 200)
				})
				tween:Play()
			end)
			
			ToggleButton.MouseLeave:Connect(function()
				local tween = TweenService:Create(ToggleButton, TweenInfo.new(0.2), {
					BackgroundColor3 = theme.Accent
				})
				tween:Play()
			end)
		end
		
		-- Evento do botão fechar
		CloseButton.MouseButton1Click:Connect(closeWindow)
		
		-- Efeitos de hover para o botão fechar
		CloseButton.MouseEnter:Connect(function()
			local tween = TweenService:Create(CloseButton, TweenInfo.new(0.2), {
				BackgroundTransparency = 0.2
			})
			tween:Play()
		end)
		
		CloseButton.MouseLeave:Connect(function()
			local tween = TweenService:Create(CloseButton, TweenInfo.new(0.2), {
				BackgroundTransparency = 1
			})
			tween:Play()
		end)
		
		-- Função para criar notificações
		local function createNotification(Info)
			local Title = Info.Title or "Notification"
			local Desc = Info.Desc or ""
			local Time = Info.Time or 5
			
			local NotificationFrame = Instance.new("Frame")
			NotificationFrame.Name = "Notification"
			NotificationFrame.Size = UDim2.new(0, 300, 0, 80)
			NotificationFrame.Position = UDim2.new(1, 320, 0.1 + (#notifications * 0.15), 0)
			NotificationFrame.BackgroundColor3 = theme.Foreground
			NotificationFrame.Parent = ScreenGui
			
			local NotificationCorner = Instance.new("UICorner")
			NotificationCorner.CornerRadius = UDim.new(0, 8)
			NotificationCorner.Parent = NotificationFrame
			
			local UIStroke = Instance.new("UIStroke")
			UIStroke.Color = theme.Accent
			UIStroke.Thickness = 2
			UIStroke.Parent = NotificationFrame
			
			local TitleLabel = Instance.new("TextLabel")
			TitleLabel.Name = "TitleLabel"
			TitleLabel.Size = UDim2.new(1, -20, 0, 25)
			TitleLabel.Position = UDim2.new(0, 10, 0, 10)
			TitleLabel.BackgroundTransparency = 1
			TitleLabel.Text = Title
			TitleLabel.TextColor3 = theme.Text
			TitleLabel.TextSize = 16
			TitleLabel.Font = Enum.Font.GothamBold
			TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
			TitleLabel.Parent = NotificationFrame
			
			local DescLabel = Instance.new("TextLabel")
			DescLabel.Name = "DescLabel"
			DescLabel.Size = UDim2.new(1, -20, 0, 35)
			DescLabel.Position = UDim2.new(0, 10, 0, 35)
			DescLabel.BackgroundTransparency = 1
			DescLabel.Text = Desc
			DescLabel.TextColor3 = theme.Text
			DescLabel.TextSize = 14
			DescLabel.Font = Enum.Font.Gotham
			DescLabel.TextXAlignment = Enum.TextXAlignment.Left
			DescLabel.TextYAlignment = Enum.TextYAlignment.Top
			DescLabel.TextWrapped = true
			DescLabel.Parent = NotificationFrame
			
			-- Animação de entrada
			local tweenIn = TweenService:Create(NotificationFrame, TweenInfo.new(0.3), {
				Position = UDim2.new(1, -310, 0.1 + (#notifications * 0.15), 0)
			})
			tweenIn:Play()
			
			table.insert(notifications, NotificationFrame)
			
			-- Atualizar posições das notificações existentes
			for i, notif in ipairs(notifications) do
				local tween = TweenService:Create(notif, TweenInfo.new(0.3), {
					Position = UDim2.new(1, -310, 0.1 + ((i-1) * 0.15), 0)
				})
				tween:Play()
			end
			
			-- Remover após o tempo
			task.delay(Time, function()
				local tweenOut = TweenService:Create(NotificationFrame, TweenInfo.new(0.3), {
					Position = UDim2.new(1, 320, NotificationFrame.Position.Y.Scale, 0)
				})
				tweenOut:Play()
				
				tweenOut.Completed:Connect(function()
					NotificationFrame:Destroy()
					local index = table.find(notifications, NotificationFrame)
					if index then
						table.remove(notifications, index)
					end
				end)
			end)
		end
		
		-- API pública da janela
		local WindowAPI = {}
		
		-- Componente Paragraph
		function WindowAPI:Paragraph(Info)
			local Info = Info or {}
			local Name = Info.Name or "Paragraph"
			local Desc = Info.Desc or ""
			
			local ParagraphFrame = Instance.new("Frame")
			ParagraphFrame.Name = "ParagraphFrame"
			ParagraphFrame.Size = UDim2.new(1, 0, 0, 0)
			ParagraphFrame.BackgroundTransparency = 1
			ParagraphFrame.Parent = ContentContainer
			
			local NameLabel = Instance.new("TextLabel")
			NameLabel.Name = "NameLabel"
			NameLabel.Size = UDim2.new(1, 0, 0, 20)
			NameLabel.Position = UDim2.new(0, 0, 0, 0)
			NameLabel.BackgroundTransparency = 1
			NameLabel.Text = Name
			NameLabel.TextColor3 = theme.Text
			NameLabel.TextSize = 16
			NameLabel.Font = Enum.Font.GothamBold
			NameLabel.TextXAlignment = Enum.TextXAlignment.Left
			NameLabel.Parent = ParagraphFrame
			
			local DescLabel = Instance.new("TextLabel")
			DescLabel.Name = "DescLabel"
			DescLabel.Size = UDim2.new(1, 0, 0, 0)
			DescLabel.Position = UDim2.new(0, 0, 0, 25)
			DescLabel.BackgroundTransparency = 1
			DescLabel.Text = Desc
			DescLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
			DescLabel.TextSize = 14
			DescLabel.Font = Enum.Font.Gotham
			DescLabel.TextXAlignment = Enum.TextXAlignment.Left
			DescLabel.TextYAlignment = Enum.TextYAlignment.Top
			DescLabel.TextWrapped = true
			DescLabel.AutomaticSize = Enum.AutomaticSize.Y
			DescLabel.Parent = ParagraphFrame
			
			-- Ajustar altura do frame
			task.defer(function()
				ParagraphFrame.Size = UDim2.new(1, 0, 0, 25 + DescLabel.TextBounds.Y + 5)
			end)
			
			local ParagraphAPI = {}
			
			function ParagraphAPI:SetName(NewName)
				NameLabel.Text = NewName or Name
			end
			
			function ParagraphAPI:SetDesc(NewDesc)
				DescLabel.Text = NewDesc or Desc
				task.defer(function()
					ParagraphFrame.Size = UDim2.new(1, 0, 0, 25 + DescLabel.TextBounds.Y + 5)
				end)
			end
			
			function ParagraphAPI:Destroy()
				ParagraphFrame:Destroy()
			end
			
			table.insert(elements, ParagraphFrame)
			return ParagraphAPI
		end
		
		-- Componente Button
		function WindowAPI:Button(Info)
			local Info = Info or {}
			local Name = Info.Name or "Button"
			local Desc = Info.Desc or ""
			local Color = Info.Color or theme.Accent
			local Callback = Info.Callback or function() end
			
			local ButtonFrame = Instance.new("Frame")
			ButtonFrame.Name = "ButtonFrame"
			ButtonFrame.Size = UDim2.new(1, 0, 0, 0)
			ButtonFrame.BackgroundColor3 = theme.Foreground
			ButtonFrame.BackgroundTransparency = 0
			ButtonFrame.Parent = ContentContainer
			
			local ButtonCorner = Instance.new("UICorner")
			ButtonCorner.CornerRadius = UDim.new(0, 8)
			ButtonCorner.Parent = ButtonFrame
			
			local Button = Instance.new("TextButton")
			Button.Name = "Button"
			Button.Size = UDim2.new(1, 0, 1, 0)
			Button.BackgroundTransparency = 1
			Button.Text = ""
			Button.Parent = ButtonFrame
			
			local NameLabel = Instance.new("TextLabel")
			NameLabel.Name = "NameLabel"
			NameLabel.Size = UDim2.new(1, -15, 0, 20)
			NameLabel.Position = UDim2.new(0, 10, 0, 10)
			NameLabel.BackgroundTransparency = 1
			NameLabel.Text = Name
			NameLabel.TextColor3 = theme.Text
			NameLabel.TextSize = 15
			NameLabel.Font = Enum.Font.GothamBold
			NameLabel.TextXAlignment = Enum.TextXAlignment.Left
			NameLabel.Parent = ButtonFrame
			
			local DescLabel = Instance.new("TextLabel")
			DescLabel.Name = "DescLabel"
			DescLabel.Size = UDim2.new(1, -15, 0, 0)
			DescLabel.Position = UDim2.new(0, 10, 0, 35)
			DescLabel.BackgroundTransparency = 1
			DescLabel.Text = Desc
			DescLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
			DescLabel.TextSize = 13
			DescLabel.Font = Enum.Font.Gotham
			DescLabel.TextXAlignment = Enum.TextXAlignment.Left
			DescLabel.TextYAlignment = Enum.TextYAlignment.Top
			DescLabel.TextWrapped = true
			DescLabel.AutomaticSize = Enum.AutomaticSize.Y
			DescLabel.Parent = ButtonFrame
			
			-- Ajustar altura
			task.defer(function()
				local descHeight = Desc == "" and 0 or (DescLabel.TextBounds.Y + 5)
				ButtonFrame.Size = UDim2.new(1, 0, 0, 45 + descHeight)
			end)
			
			-- Efeitos de hover
			Button.MouseEnter:Connect(function()
				local tween = TweenService:Create(ButtonFrame, TweenInfo.new(0.2), {
					BackgroundColor3 = Color
				})
				tween:Play()
			end)
			
			Button.MouseLeave:Connect(function()
				local tween = TweenService:Create(ButtonFrame, TweenInfo.new(0.2), {
					BackgroundColor3 = theme.Foreground
				})
				tween:Play()
			end)
			
			Button.MouseButton1Click:Connect(function()
				Callback()
			end)
			
			local ButtonAPI = {}
			
			function ButtonAPI:SetName(NewName)
				NameLabel.Text = NewName or Name
			end
			
			function ButtonAPI:SetDesc(NewDesc)
				DescLabel.Text = NewDesc or Desc
				task.defer(function()
					local descHeight = NewDesc == "" and 0 or (DescLabel.TextBounds.Y + 5)
					ButtonFrame.Size = UDim2.new(1, 0, 0, 45 + descHeight)
				end)
			end
			
			function ButtonAPI:SetColor(NewColor)
				Color = NewColor or Color
			end
			
			function ButtonAPI:SetCallback(NewCallback)
				if type(NewCallback) == "function" then
					Callback = NewCallback
				elseif type(NewCallback) == "table" and NewCallback.Callback then
					Callback = NewCallback.Callback
				end
			end
			
			function ButtonAPI:Destroy()
				ButtonFrame:Destroy()
			end
			
			table.insert(elements, ButtonFrame)
			return ButtonAPI
		end
		
		-- Componente Toggle
		function WindowAPI:Toggle(Info)
			local Info = Info or {}
			local Name = Info.Name or "Toggle"
			local Desc = Info.Desc or ""
			local Color = Info.Color or theme.Success
			local Default = Info.Default or false
			local Callback = Info.Callback or function() end
			
			local ToggleFrame = Instance.new("Frame")
			ToggleFrame.Name = "ToggleFrame"
			ToggleFrame.Size = UDim2.new(1, 0, 0, 0)
			ToggleFrame.BackgroundColor3 = theme.Foreground
			ToggleFrame.BackgroundTransparency = 0
			ToggleFrame.Parent = ContentContainer
			
			local ToggleCorner = Instance.new("UICorner")
			ToggleCorner.CornerRadius = UDim.new(0, 8)
			ToggleCorner.Parent = ToggleFrame
			
			local ToggleButton = Instance.new("TextButton")
			ToggleButton.Name = "ToggleButton"
			ToggleButton.Size = UDim2.new(1, 0, 1, 0)
			ToggleButton.BackgroundTransparency = 1
			ToggleButton.Text = ""
			ToggleButton.Parent = ToggleFrame
			
			local NameLabel = Instance.new("TextLabel")
			NameLabel.Name = "NameLabel"
			NameLabel.Size = UDim2.new(1, -70, 0, 20)
			NameLabel.Position = UDim2.new(0, 10, 0, 10)
			NameLabel.BackgroundTransparency = 1
			NameLabel.Text = Name
			NameLabel.TextColor3 = theme.Text
			NameLabel.TextSize = 15
			NameLabel.Font = Enum.Font.GothamBold
			NameLabel.TextXAlignment = Enum.TextXAlignment.Left
			NameLabel.Parent = ToggleFrame
			
			local DescLabel = Instance.new("TextLabel")
			DescLabel.Name = "DescLabel"
			DescLabel.Size = UDim2.new(1, -70, 0, 0)
			DescLabel.Position = UDim2.new(0, 10, 0, 35)
			DescLabel.BackgroundTransparency = 1
			DescLabel.Text = Desc
			DescLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
			DescLabel.TextSize = 13
			DescLabel.Font = Enum.Font.Gotham
			DescLabel.TextXAlignment = Enum.TextXAlignment.Left
			DescLabel.TextYAlignment = Enum.TextYAlignment.Top
			DescLabel.TextWrapped = true
			DescLabel.AutomaticSize = Enum.AutomaticSize.Y
			DescLabel.Parent = ToggleFrame
			
			local ToggleBackground = Instance.new("Frame")
			ToggleBackground.Name = "ToggleBackground"
			ToggleBackground.Size = UDim2.new(0, 45, 0, 20)
			ToggleBackground.Position = UDim2.new(1, -55, 0, 15)
			ToggleBackground.BackgroundColor3 = Default and Color or theme.Foreground
			ToggleBackground.Parent = ToggleFrame
			
			local ToggleBackgroundCorner = Instance.new("UICorner")
			ToggleBackgroundCorner.CornerRadius = UDim.new(1, 0)
			ToggleBackgroundCorner.Parent = ToggleBackground
			
			local ToggleDot = Instance.new("Frame")
			ToggleDot.Name = "ToggleDot"
			ToggleDot.Size = UDim2.new(0, 16, 0, 16)
			ToggleDot.Position = UDim2.new(0, Default and 25 or 2, 0.5, -8)
			ToggleDot.BackgroundColor3 = theme.Text
			ToggleDot.Parent = ToggleBackground
			
			local ToggleDotCorner = Instance.new("UICorner")
			ToggleDotCorner.CornerRadius = UDim.new(1, 0)
			ToggleDotCorner.Parent = ToggleDot
			
			-- Ajustar altura
			task.defer(function()
				local descHeight = Desc == "" and 0 or (DescLabel.TextBounds.Y + 5)
				ToggleFrame.Size = UDim2.new(1, 0, 0, 45 + descHeight)
			end)
			
			local isToggled = Default
			
			local function updateToggle()
				local tweenInfo = TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
				
				local backgroundTween = TweenService:Create(ToggleBackground, tweenInfo, {
					BackgroundColor3 = isToggled and Color or theme.Foreground
				})
				
				local dotTween = TweenService:Create(ToggleDot, tweenInfo, {
					Position = UDim2.new(0, isToggled and 25 or 2, 0.5, -8)
				})
				
				backgroundTween:Play()
				dotTween:Play()
				
				Callback(isToggled)
			end
			
			ToggleButton.MouseButton1Click:Connect(function()
				isToggled = not isToggled
				updateToggle()
			end)
			
			local ToggleAPI = {}
			
			function ToggleAPI:SetName(NewName)
				NameLabel.Text = NewName or Name
			end
			
			function ToggleAPI:SetDesc(NewDesc)
				DescLabel.Text = NewDesc or Desc
				task.defer(function()
					local descHeight = NewDesc == "" and 0 or (DescLabel.TextBounds.Y + 5)
					ToggleFrame.Size = UDim2.new(1, 0, 0, 45 + descHeight)
				end)
			end
			
			function ToggleAPI:SetColor(NewColor)
				Color = NewColor or Color
				updateToggle()
			end
			
			function ToggleAPI:SetDefault(NewDefault)
				isToggled = NewDefault or Default
				updateToggle()
			end
			
			function ToggleAPI:SetCallback(NewCallback)
				if type(NewCallback) == "function" then
					Callback = NewCallback
				elseif type(NewCallback) == "table" and NewCallback.Callback then
					Callback = NewCallback.Callback
				end
			end
			
			function ToggleAPI:GetValue()
				return isToggled
			end
			
			function ToggleAPI:SetValue(Value)
				isToggled = Value
				updateToggle()
			end
			
			function ToggleAPI:Destroy()
				ToggleFrame:Destroy()
			end
			
			table.insert(elements, ToggleFrame)
			return ToggleAPI
		end
		
		-- Função de notificação
		function WindowAPI:Notify(Info)
			createNotification(Info)
		end
		
		-- Métodos da janela
		function WindowAPI:Destroy()
			ScreenGui:Destroy()
		end
		
		function WindowAPI:Open()
			openWindow()
		end
		
		function WindowAPI:Close()
			closeWindow()
		end
		
		return WindowAPI
	end
	
	-- Verificar se precisa de key
	if Key == false then
		-- Se Key é false, criar a interface principal diretamente
		return createMainInterface()
	elseif KeyS then
		-- Se KeyS existe, criar a interface de key
		createKeyInterface()
		return {} -- Retornar tabela vazia temporariamente
	else
		-- Caso contrário, criar a interface principal diretamente
		return createMainInterface()
	end
end

return Lib" all separated by files in this repository it loads the files by url.
]]
