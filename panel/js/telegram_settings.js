// panel/js/telegram_settings.js - Global Telegram Channel Management

document.addEventListener('DOMContentLoaded', () => {
    const SETTINGS_KEY = 'nextEarnXGlobalSettings';
    const MAX_CHANNELS = 4;
    const BOT_USERNAME = '@FxL_lifafa_verifier_bot';

    // UI Elements
    const activeChannelsContainer = document.getElementById('activeChannelsContainer');
    const totalChannelsDisplay = document.getElementById('totalChannels');
    const newChannelLinkInput = document.getElementById('newChannelLink');
    const addChannelBtn = document.getElementById('addChannelBtn');
    const saveChannelsBtn = document.getElementById('saveChannelsBtn');
    const copyVerifierBtn = document.getElementById('copyVerifierBtn');
    const verifierUsernameInput = document.getElementById('verifierUsername');
    const tapToAdminBtn = document.getElementById('tapToAdminBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let globalSettings = {};
    let currentChannels = []; // Holds channels while editing before final save

    // --- UTILITY FUNCTIONS ---
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            globalSettings = settings || {};
            currentChannels = globalSettings.telegramChannels || [];
        } catch {
            globalSettings = {};
            currentChannels = [];
        }
    }

    function saveSettings() {
        globalSettings.telegramChannels = currentChannels;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(globalSettings));
        alert('✅ Global Telegram Channels saved successfully!');
    }

    // --- UI RENDERING ---
    function renderChannels() {
        activeChannelsContainer.innerHTML = '';
        totalChannelsDisplay.textContent = currentChannels.length;
        const validationCheckIcon = document.querySelector('.validation-check-icon');
        const newChannelLinkInput = document.getElementById('newChannelLink');

        if (currentChannels.length === 0) {
            activeChannelsContainer.innerHTML = '<p style="color:#777;">No channels added yet.</p>';
            return;
        }
          

        currentChannels.forEach((channel, index) => {
            const item = document.createElement('div');
            item.classList.add('channel-item');
            item.innerHTML = `
                <div class="channel-name">
                    <i class="ri-telegram-fill"></i>
                    <span>${channel}</span>
                </div>
                <button class="remove-btn" data-index="${index}"><i class="ri-close-line"></i></button>
            `;
            activeChannelsContainer.appendChild(item);
        });

        attachRemoveListeners();
    }

    // --- EVENT HANDLERS ---

    // 1. Add Channel
    addChannelBtn.addEventListener('click', () => {
    const link = newChannelLinkInput.value.trim();
    if (!link) {
        alert('Please enter a channel link or username.');
        return;
    }
    if (currentChannels.length >= MAX_CHANNELS) {
        alert(`Maximum limit of ${MAX_CHANNELS} channels reached. Remove one first.`);
        return;
    }
    if (currentChannels.includes(link)) {
         alert('This channel is already added.');
         return;
    }
    
    // Simple Link Validation (Check for @ or t.me)
    if (!link.startsWith('@') && !link.toLowerCase().startsWith('https://t.me/') && !link.toLowerCase().startsWith('t.me/')) {
        if (!confirm('The format seems incorrect. Continue anyway?')) return;
    }
    
    currentChannels.push(link);
    newChannelLinkInput.value = '';
    
    // Hide validation icon after successful add
    if(validationCheckIcon) validationCheckIcon.style.display = 'none';

    renderChannels();
    saveChannelsBtn.classList.add('unsaved');
});

// panel/js/telegram_settings.js (Line 115 ke aas-paas)
// Input Listener for Live Validation Icon
newChannelLinkInput.addEventListener('input', () => {
    const link = newChannelLinkInput.value.trim();
    if (!validationCheckIcon) return;
    
    // Show green tick if it looks like a valid link/username, otherwise hide.
    if (link && (link.startsWith('@') || link.toLowerCase().includes('t.me/'))) {
        validationCheckIcon.style.display = 'block';
    } else {
        validationCheckIcon.style.display = 'none';
    }
});

        // Simple Link Validation (Check for @ or t.me)
        if (!link.startsWith('@') && !link.toLowerCase().startsWith('https://t.me/')) {
            if (!confirm('The format seems incorrect. Continue anyway?')) return;
        }

        currentChannels.push(link);
        newChannelLinkInput.value = '';
        renderChannels();
        saveChannelsBtn.classList.add('unsaved');
    });

    // 2. Save Channels
    saveChannelsBtn.addEventListener('click', () => {
        saveSettings();
        saveChannelsBtn.classList.remove('unsaved');
    });

    // 3. Remove Channel
    function attachRemoveListeners() {
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                if (confirm(`Remove channel: ${currentChannels[index]}?`)) {
                    currentChannels.splice(index, 1);
                    renderChannels();
                    saveChannelsBtn.classList.add('unsaved');
                }
            });
        });
    }


    // 4. Copy Verifier Bot
    copyVerifierBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(BOT_USERNAME);
        alert(`✅ Copied: ${BOT_USERNAME}`);
    });

    // 5. Tap to Admin (Mock)
    tapToAdminBtn.addEventListener('click', () => {
        alert("MOCK: This feature would typically redirect you to add the bot as admin.");
    });

    // 6. Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    // --- INITIALIZE ---
    loadSettings();
    renderChannels();
    verifierUsernameInput.value = BOT_USERNAME; // Set bot username on load
});