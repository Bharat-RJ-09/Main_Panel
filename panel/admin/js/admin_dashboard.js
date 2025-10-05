// admin/js/admin_dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // --- SECURITY CHECK ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }

    // --- DATA UTILITIES ---
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem("nextEarnXUsers") || "[]"); }
        catch { return []; }
    }
    
    function loadHistory() {
        try { return JSON.parse(localStorage.getItem("nextEarnXHistory") || "[]"); }
        catch { return []; }
    }

    // --- STATS CALCULATION ---
    function calculateStats() {
        const users = loadUsers();
        const history = loadHistory();
        
        const totalUsers = users.length;
        
        let activeSubs = 0;
        let totalRevenue = 0;

        // Calculate active subscriptions (This check is not perfectly reliable without looking at individual user's sub)
        // For a mock count, we'll check how many users have a subscription entry.
        // NOTE: This needs to be improved in user manager later. For now, it's a simple mock.
        activeSubs = users.filter(user => user.hasSubscription).length; 

        // Calculate total revenue from 'credit' transactions in history
        history.forEach(tx => {
            if (tx.type === 'credit') {
                totalRevenue += tx.amount;
            }
        });

        // Calculate revenue from subscription debits (for a rough total spent by users)
        const totalSubscriptionDebit = history.filter(tx => tx.note.startsWith('Subscription:')).reduce((sum, tx) => sum + tx.amount, 0);
        
        // --- DISPLAY STATS ---
        document.getElementById('totalUsers').textContent = totalUsers;
        // Mocked active subs based on a simple check
        document.getElementById('activeSubs').textContent = activeSubs; 
        // Showing subscription revenue as mock revenue
        document.getElementById('totalRevenue').textContent = `₹${totalSubscriptionDebit.toFixed(2)}`; 
    }

    // --- EVENT HANDLERS ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = 'admin_login.html';
        });
    }

    // --- INITIALIZE ---
    checkAdminSession();
    calculateStats();
});