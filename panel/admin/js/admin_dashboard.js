// admin/js/admin_dashboard.js - FINALIZED WITH ROBUST STATS CALCULATION

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const USER_STORAGE_KEY = 'nextEarnXUsers';
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
    
    // Function to load per-user history
    function loadUserHistory(username) {
        try { 
            // CRITICAL FIX: Use the per-user history key
            return JSON.parse(localStorage.getItem(`nextEarnXHistory_${username}`) || "[]"); 
        }
        catch { return []; }
    }
    
    // Function to check global subscription status
    function isSubscriptionActive(subscription) {
        if (!subscription) return false;
        return Date.now() < subscription.expiry;
    }

    // --- STATS CALCULATION (CRITICAL FIX) ---
    function calculateStats() {
        const allUsers = loadUsers();
        
        const totalUsers = allUsers.length;
        let totalRevenue = 0; // Will sum up all deposits
        let activeSubsCount = 0; 

        
        allUsers.forEach(user => {
            const username = user.username;
            const history = loadUserHistory(username);

            // 1. Calculate Revenue from Deposits (Credit transactions)
            history.forEach(tx => {
                // Check for 'credit' type transactions (Deposits/Lifafa Claims Received)
                if (tx.type === 'credit') {
                    // Only count money coming INTO the system (Deposits via UPI)
                    if (tx.note.includes('Deposit via UPI')) {
                         totalRevenue += tx.amount;
                    }
                    // NOTE: Lifafa claims received are revenue for the user, not the admin/system, so we only count Deposits.
                }
            });
            
            // 2. Check for Active Subscription (Based on Admin Panel Edit feature)
            if (user.plan && user.expiry && Date.now() < user.expiry) {
                 activeSubsCount++;
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