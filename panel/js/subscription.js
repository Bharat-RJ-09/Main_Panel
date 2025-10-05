// panel/js/subscription.js - Finalized Logic with Robust One-Time Free Trial Check

document.addEventListener('DOMContentLoaded', ()=>{
    const urlParams = new URLSearchParams(location.search);
    const redirectFeature = urlParams.get('redirect') || null;

    // --- USER UTILITIES (For Free Trial Flag) ---
    const USER_STORAGE_KEY = 'nextEarnXUsers';
    const CURRENT_USER_KEY = 'nextEarnXCurrentUser';

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        } catch { return null; }
    }
    
    function saveCurrentUser(user) {
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
    }

    function updateMainUserList(updatedUser) {
        let allUsers;
        try {
            allUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
        } catch {
            allUsers = [];
        }
        
        const index = allUsers.findIndex(u => u.username === updatedUser.username);
        if (index !== -1) {
            allUsers[index] = updatedUser;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(allUsers));
        }
    }

    // --- GLOBAL SETTINGS UTILITY (Remains the same) ---
    const DEFAULTS = { 
        prices: {"1 Month": 59,"3 Months": 109,"6 Months": 159}
    };
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('nextEarnXGlobalSettings'));
            return settings ? { ...DEFAULTS, ...settings } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    }
    const settings = loadSettings();
    

    // --- UI Update: Dynamic Prices (Remains the same) ---
    function updatePlanPricesUI() {
        const planCards = document.querySelectorAll('.plan-card');
        planCards.forEach(card => {
            const planName = card.dataset.plan;
            const newPrice = settings.prices[planName];
            
            if (newPrice !== undefined && planName !== "1 Week Free Trial") {
                const priceElement = card.querySelector('.price');
                if (priceElement) priceElement.textContent = `₹${newPrice}`;

                const originalPriceElement = card.querySelector('.original-price');
                if (originalPriceElement) {
                    const defaultOriginal = planName === "1 Month" ? 99 : planName === "3 Months" ? 179 : 269;
                    const discount = Math.round(((defaultOriginal - newPrice) / defaultOriginal) * 100);
                    const saveTag = card.querySelector('.save-tag');
                    if (saveTag) saveTag.textContent = `Save ${discount}%`;
                }
                card.dataset.price = newPrice;
            }
        });
    }
    updatePlanPricesUI();
    
    // --- CRITICAL FIX: HIDE FREE TRIAL IF ALREADY TAKEN ---
    function hideFreeTrialIfTaken() {
        const user = getCurrentUser();
        
        // We check for the flag only. If the key exists and is true, it's been taken.
        if (user && user.hasTakenFreeTrial === true) { 
            const freeCard = document.querySelector('.plan-card.free');
            if (freeCard) {
                // Disable visuals and pointer events
                freeCard.style.opacity = '0.4';
                freeCard.style.pointerEvents = 'none';
                freeCard.style.boxShadow = 'none';
                
                // Update text to clearly indicate status
                const saveTag = freeCard.querySelector('.save-tag');
                if (saveTag) saveTag.textContent = 'Trial Used';
                const selectBtn = freeCard.querySelector('.select-btn');
                if(selectBtn) selectBtn.textContent = 'Trial Taken';
                
                // Remove the special 'popular' class if it was somehow added
                freeCard.classList.remove('popular');
            }
            
            const statusMessage = document.getElementById('statusMessage');
            if(statusMessage && !redirectFeature) {
                 statusMessage.innerHTML += '<br><small style="color:#ffcc00;">Note: Free trial has already been used on this account.</small>';
            }
        }
    }
    hideFreeTrialIfTaken(); // Call this immediately on load
    // --- END CRITICAL FIX ---


    // Utility function to get current wallet balance
    function getBalance() {
        try {
            return parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00');
        } catch(e) { return 0.00; }
    }

    // Utility function to handle subscription activation
    function activateSubscription(planName, planPrice, txnId = 'WALLET_PAY') {
        const planMap = {"1 Month":30,"3 Months":90,"6 Months":180, "1 Week Free Trial": 7};
        const days = planMap[planName] || 30; 
        const now = Date.now();
        const expiry = now + days * 24 * 60 * 60 * 1000;
        
        const subscription = {
            plan: planName, 
            price: planPrice, 
            txnId: txnId, 
            purchaseAt: now, 
            expiry: expiry
        };
        localStorage.setItem('subscription', JSON.stringify(subscription));

        if (planPrice > 0) {
            let history = JSON.parse(localStorage.getItem('nextEarnXHistory') || '[]');
            history.push({
                date: now,
                type: 'debit',
                amount: parseFloat(planPrice),
                txnId: txnId,
                note: `Subscription: ${planName}`
            });
            localStorage.setItem('nextEarnXHistory', JSON.stringify(history));
        }
        
        // --- CRITICAL: SET FREE TRIAL FLAG HERE ---
        if (planName === "1 Week Free Trial") {
            const user = getCurrentUser();
            if (user) {
                user.hasTakenFreeTrial = true;
                saveCurrentUser(user); 
                updateMainUserList(user); 
            }
        }
        
        alert(`🎉 Subscription Activated!\nPlan: ${planName}\nValid till: ${new Date(expiry).toLocaleString()}`);
        if(redirectFeature) window.location.href = `index.html?open=${encodeURIComponent(redirectFeature)}`;
        else window.location.href = 'index.html';
    }


    // --- HANDLE PLAN SELECTION AND REDIRECT ---
    const selectButtons = document.querySelectorAll('.select-btn');

    selectButtons.forEach(button=>{
        button.addEventListener('click', (e)=>{
            e.preventDefault(); 
            
            const card = button.closest('.plan-card');
            const planName = card.dataset.plan;
            const priceString = card.dataset.price;
            const planPrice = parseFloat(priceString);
            
            const user = getCurrentUser();
            
            // Re-check for already taken trial before proceeding
            if (planPrice === 0 && user && user.hasTakenFreeTrial === true) {
                 alert('Error: Free trial has already been used on this account.');
                 return; // Block activation
            }
            
            if(isNaN(planPrice)){
                alert("Error: Invalid plan price.");
                return;
            }

            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            // 1. FREE PLAN LOGIC (Price == 0)
            if (planPrice === 0) {
                activateSubscription(planName, planPrice, 'FREE_TRIAL');
                return;
            }
            
            // 2. PAID PLAN LOGIC (Price > 0)
            const currentBalance = getBalance();

            if (currentBalance >= planPrice) {
                // ENOUGH BALANCE: Deduct from wallet and activate
                if (confirm(`Confirm purchase of ${planName} for ₹${planPrice}? Your current wallet balance is ₹${currentBalance.toFixed(2)}.`)) {
                    
                    const newBalance = currentBalance - planPrice;
                    localStorage.setItem('nextEarnXBalance', newBalance.toFixed(2));
                    
                    activateSubscription(planName, planPrice, 'WALLET_PAY_' + Date.now()); 
                }
            } else {
                // INSUFFICIENT BALANCE: Redirect to Wallet page to deposit funds
                alert(`Insufficient Balance: ₹${currentBalance.toFixed(2)}. Please add funds to your wallet to complete the purchase of the ${planName} plan (₹${planPrice}).`);
                
                window.location.href = 'wallet.html';
            }
        });
    });
    
    // --- REST OF THE LOGIC ---
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Handle Redirect Message (UX)
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage && redirectFeature) {
        statusMessage.textContent = `Subscription required to access: ${decodeURIComponent(redirectFeature)}`;
        statusMessage.style.color = '#00e0ff'; 
    }
    
    // Logout Button Fix (For consistency)
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem(CURRENT_USER_KEY);
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }
});