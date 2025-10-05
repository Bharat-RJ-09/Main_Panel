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

    // --- NEW: OTP MODAL ELEMENTS ---
    const otpModal = document.getElementById('settingsOtpModal');
    const closeOtpBtn = otpModal ? otpModal.querySelector('#closeOtpBtn') : null;
    const otpInput = otpModal ? otpModal.querySelector('#otpInput') : null;
    const verifyOtpBtn = otpModal ? otpModal.querySelector('#verifyOtpBtn') : null;
    const resendOtpBtn = otpModal ? otpModal.querySelector('#resendOtpBtn') : null;
    const otpTimer = otpModal ? otpModal.querySelector('#otpTimer') : null;

    // --- OTP STATE ---
    let generatedOtp = null;
    let otpExpires = null;
    let otpTimerInterval = null;
    let pendingSaveData = null; // Store data pending for save after OTP verification
    let pendingSaveType = null; // 'general' or 'price'

    // Default Settings
    const DEFAULTS = {
        upiId: "bharat-dass@ibl",
        minDeposit: 60,
        prices: {
            "1 Month": 59,
            "3 Months": 109,
            "6 Months": 159
        }
    };

    // --- 1. SECURITY & LOGOUT (unchanged) ---
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

    // Actual save function, called only after OTP verification
    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        alert('✅ Settings saved successfully!');
    }

    // --- NEW: OTP LOGIC FUNCTIONS ---
    function startOtpTimer() {
        if (!otpTimer || !resendOtpBtn) return;
        clearInterval(otpTimerInterval);
        otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes validity
        resendOtpBtn.disabled = true;
        
        otpTimerInterval = setInterval(() => {
            const diff = Math.max(0, otpExpires - Date.now());
            const sec = Math.ceil(diff / 1000);
            const mm = String(Math.floor(sec / 60)).padStart(2, "0");
            const ss = String(sec % 60).padStart(2, "0");
            otpTimer.textContent = `${mm}:${ss}`;
            
            if (diff <= 0) {
                clearInterval(otpTimerInterval);
                alert("OTP expired. Please resend.");
                resendOtpBtn.disabled = false;
                generatedOtp = null; 
            }
        }, 500);
    }

    function generateAndShowOtp() {
        generatedOtp = Math.floor(100000 + Math.random() * 900000);
        console.log("DEV ADMIN SETTINGS OTP:", generatedOtp); // DEV-ONLY
        
        if (otpModal && otpInput) {
            otpModal.style.display = 'flex';
            otpInput.value = '';
            otpInput.style.borderColor = '#444'; // Reset border color
            startOtpTimer();
        }
    }

    // --- 3. UI INITIALIZATION (unchanged) ---
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

    // --- 4. FORM SUBMISSION HANDLERS (UPDATED WITH OTP) ---
    
    // General Settings Submit
    generalSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = loadSettings();
        
        settings.upiId = upiIdInput.value.trim();
        settings.minDeposit = parseFloat(minDepositInput.value);
        
        pendingSaveData = settings; // Store the data to be saved
        pendingSaveType = 'general';
        generateAndShowOtp(); // Trigger OTP
    });

    // Price Settings Submit
    priceSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = loadSettings();
        const newPrices = {};
        
        planPriceInputs.forEach(input => {
            const plan = input.dataset.plan;
            newPrices[plan] = parseFloat(input.value);
        });

        // Merge prices into settings before saving
        const settingsToSave = { ...settings, prices: newPrices };

        pendingSaveData = settingsToSave; // Store the data to be saved
        pendingSaveType = 'price';
        generateAndShowOtp(); // Trigger OTP
    });

    // --- 5. OTP MODAL EVENT LISTENERS ---
    
    if (closeOtpBtn) {
        closeOtpBtn.addEventListener('click', () => {
            otpModal.style.display = 'none';
            clearInterval(otpTimerInterval);
            pendingSaveData = null;
            pendingSaveType = null;
        });
    }
    
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', generateAndShowOtp);
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
            const entered = otpInput.value.trim();
            
            if (!generatedOtp) {
                alert("Please request a new OTP.");
                return;
            }
            if (Date.now() > otpExpires) {
                alert("OTP expired. Please request a new OTP.");
                return;
            }
            
            if (Number(entered) === generatedOtp) {
                // SUCCESS: Save the pending data and close modal
                saveSettings(pendingSaveData);
                
                // Final UI refresh is crucial here, as inputs might have been changed before save
                initializeUI(); 
                
                otpModal.style.display = 'none';
                clearInterval(otpTimerInterval);
                
                pendingSaveData = null;
                pendingSaveType = null;
            } else {
                alert("❌ Invalid OTP. Try again.");
                otpInput.style.borderColor = 'red';
            }
        });
    }
});