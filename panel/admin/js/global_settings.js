// admin/js/global_settings.js

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const SETTINGS_KEY = 'nextEarnXGlobalSettings';
    
    // Form Elements
    const generalSettingsForm = document.getElementById('generalSettingsForm');
    const upiIdInput = document.getElementById('upiId');
    const minDepositInput = document.getElementById('minDeposit');
    const priceSettingsForm = document.getElementById('priceSettingsForm');
    const planPriceInputs = document.querySelectorAll('.plan-price');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // Default Settings (Matching your current hardcoded values)
    const DEFAULTS = {
        upiId: "bharat-dass@ibl",
        minDeposit: 60,
        prices: {
            "1 Month": 59,
            "3 Months": 109,
            "6 Months": 159
        }
    };

    // --- 1. SECURITY & LOGOUT ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();
    
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = 'admin_login.html';
        });
    }

    // --- 2. DATA UTILITY (LOAD/SAVE) ---
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            return settings ? { ...DEFAULTS, ...settings } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    }

    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        alert('✅ Settings saved successfully!');
    }

    // --- 3. UI INITIALIZATION ---
    function initializeUI() {
        const settings = loadSettings();
        
        // General Settings
        upiIdInput.value = settings.upiId;
        minDepositInput.value = settings.minDeposit;

        // Price Settings
        planPriceInputs.forEach(input => {
            const plan = input.dataset.plan;
            input.value = settings.prices[plan] || DEFAULTS.prices[plan];
        });
    }
    initializeUI();

    // --- 4. FORM SUBMISSION HANDLERS ---
    
    generalSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = loadSettings();
        
        settings.upiId = upiIdInput.value.trim();
        settings.minDeposit = parseFloat(minDepositInput.value);
        
        saveSettings(settings);
    });

    priceSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = loadSettings();
        
        planPriceInputs.forEach(input => {
            const plan = input.dataset.plan;
            settings.prices[plan] = parseFloat(input.value);
        });
        
        saveSettings(settings);
    });

    // --- 5. REQUIRED: INTEGRATION HINTS ---
    // NOTE: After implementing this, remember to update the User Panel files
    // (purchase.js, subscription.js, wallet.js) to load settings from
    // localStorage.getItem(SETTINGS_KEY) instead of using hardcoded values.
});