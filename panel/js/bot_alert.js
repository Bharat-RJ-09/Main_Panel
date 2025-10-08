// panel/js/bot_alert.js - Telegram Bot Alert Configuration Logic

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const botSettingsForm = document.getElementById('botSettingsForm');
    const botTokenInput = document.getElementById('botToken');
    const chatIdInput = document.getElementById('chatId');
    const testAlertForm = document.getElementById('testAlertForm');
    const alertMessageInput = document.getElementById('alertMessage');
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Local Storage Key
    const SETTINGS_KEY = 'nextEarnXTelegramBotSettings';
    
    let currentSettings = {
        token: '',
        chatId: ''
    };

    // --- UTILITIES ---

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : type === 'loading' ? '#00e0ff' : '#e0e0e0';
        logArea.prepend(p);
    }
    
    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            if (saved) {
                currentSettings = saved;
                botTokenInput.value = saved.token || '';
                chatIdInput.value = saved.chatId || '';
                appendLog('Configuration loaded.', 'info');
            } else {
                appendLog('No saved configuration found.', 'info');
            }
        } catch {
            appendLog('Error loading configuration.', 'error');
        }
    }
    
    function saveSettings(token, chatId) {
        currentSettings = { token, chatId };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
        appendLog('✅ Bot settings saved successfully!', 'success');
    }
    
    // Mock/Stub for Telegram API Call
    function sendTelegramMessage(token, chatId, message) {
        if (!token || !chatId) {
            appendLog('Error: Bot Token and Chat ID are required!', 'error');
            return false;
        }

        const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

        appendLog(`Simulating API call to: ${telegramApiUrl.substring(0, 70)}...`, 'loading');
        appendLog(`NOTE: Since this is browser code (HTML/JS), the actual Telegram API call must be handled by a backend server (e.g., PHP/Node.js) to avoid CORS issues.`, 'loading');

        // --- ACTUAL API CALL STUB (COMMENTED OUT) ---
        /*
        // Agar aap future mein isko server se connect karoge to yeh code use hoga
        fetch(telegramApiUrl) 
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    appendLog('🎉 Test message sent successfully to Telegram!', 'success');
                } else {
                    appendLog(❌ Telegram API Error: ${data.description || 'Check token/chat ID'}', 'error');
                }
            })
            .catch(e => {
                 appendLog('❌ Network Error: Failed to reach Telegram API.', 'error');
            });
        */
        
        // --- MOCK SUCCESS RESPONSE ---
        setTimeout(() => {
             appendLog('🎉 Test message successfully **mocked** (Check console for API URL).', 'success');
        }, 1500);
        
        return true;
    }


    // --- EVENT HANDLERS ---
    
    // 1. Save Bot Settings
    botSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const token = botTokenInput.value.trim();
        const chatId = chatIdInput.value.trim();
        
        saveSettings(token, chatId);
    });

    // 2. Send Test Alert
    testAlertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = alertMessageInput.value.trim();
        
        if (!message) {
             appendLog('Error: Please enter a message to send.', 'error');
             return;
        }

        if (sendTelegramMessage(currentSettings.token, currentSettings.chatId, message)) {
             alertMessageInput.value = 'Test alert sent!';
        }
    });

    // 3. Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    // --- INITIALIZE ---
    loadSettings();
});