// admin/js/admin_dashboard.js - FINALIZED WITH ROBUST STATS CALCULATION

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const USER_STORAGE_KEY = 'nextEarnXUsers';
    // CRITICAL FIX: Global History Key ko define karein, jahan deposits store hote hain
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // --- 1. SECURITY CHECK (Must run first) ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();

    // --- DATA UTILITIES ---
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    // NEW UTILITY: Function to load GLOBAL history (The actual source of deposits)
    function loadGlobalHistory() {
        try { 
            return JSON.parse(localStorage.getItem(GLOBAL_HISTORY_KEY) || "[]"); 
        }
        catch { return []; }
    }
    
    // --- STATS CALCULATION (CRITICAL FIX) ---
    function calculateStats() {
        const allUsers = loadUsers();
        // CRITICAL FIX: Saare transactions global history se load karein
        const globalHistory = loadGlobalHistory(); 
        
        const totalUsers = allUsers.length;
        let totalRevenue = 0; // Will sum up all deposits
        let activeSubsCount = 0; 

        
        // 1. Calculate Active Subscriptions (Iterate through users)
        allUsers.forEach(user => {
            // Check for Active Subscription (Based on data saved by Admin User Manager)
            if (user.plan && user.expiry && Date.now() < user.expiry) {
                 activeSubsCount++;
            }
        });
        
        // 2. Calculate Revenue from Deposits (Check global transactions)
        globalHistory.forEach(tx => {
            // Only count 'credit' type transactions which are deposits (Subscription payments are 'debit' in user's history, but don't have a deposit note here)
            // The Deposit transaction created in purchase.js has the note 'Wallet Deposit via UPI'
            if (tx.type === 'credit' && tx.note.includes('Wallet Deposit via UPI')) {
                totalRevenue += tx.amount;
            }
        });
        
        // --- DISPLAY STATS ---
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeSubs').textContent = activeSubsCount; 
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`; 
    }

    // --- EVENT HANDLERS ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = 'admin_login.html';
        });
    }

    // --- INITIALIZE ---
    calculateStats();
});