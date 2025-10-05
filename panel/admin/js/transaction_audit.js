// admin/js/transaction_audit.js - FINALIZED WITH ALL-USER HISTORY AUDIT

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; // Deposits & Sender Debits
    const USER_STORAGE_KEY = 'nextEarnXUsers'; // To get list of all users
    
    const txnTableBody = document.getElementById('txnTableBody');
    const txnSearchInput = document.getElementById('txnSearchInput');
    const txnTypeFilter = document.getElementById('txnTypeFilter');
    const searchBtn = document.getElementById('searchBtn');
    const txnCountElement = document.getElementById('txnCount');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // --- 1. SECURITY CHECK (unchanged) ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();
    
    // --- LOGOUT HANDLER (unchanged) ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = 'admin_login.html';
        });
    }

    // --- 2. DATA UTILITY (CRITICAL FIX: Merging All Histories) ---
    
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function loadAllHistory() {
        let allTransactions = [];
        const allUsers = loadUsers();
        
        // 1. Fetch Global History (Contains all deposits and senders' transfers)
        try {
            const globalHistory = JSON.parse(localStorage.getItem(GLOBAL_HISTORY_KEY) || "[]");
            allTransactions.push(...globalHistory);
        } catch {}

        // 2. Fetch Per-User History (Contains recipients' transfers, claims, etc.)
        allUsers.forEach(user => {
            try {
                // Key format is nextEarnXHistory_USERNAME
                const userHistory = JSON.parse(localStorage.getItem(`nextEarnXHistory_${user.username}`) || "[]");
                
                // Add a source field for better auditing
                const taggedHistory = userHistory.map(tx => ({...tx, sourceUser: user.username}));
                allTransactions.push(...taggedHistory);
            } catch {}
        });
        
        // Remove duplicates if any (simple approach: sort and filter unique txnId/date combination is hard; skip for now)
        // Since we fetch from disjoint keys, duplicates are unlikely unless there's a bug in transaction creation.
        
        return allTransactions;
    }

    // --- 3. RENDERING (Updated to show source) ---
    function renderTxnTable(history) {
        txnTableBody.innerHTML = ''; 
        
        if (history.length === 0) {
            txnTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No transactions recorded.</td></tr>';
            txnCountElement.textContent = '0 transactions displayed.';
            return;
        }

        // Sort by date (newest first)
        const sortedHistory = history.sort((a, b) => b.date - a.date);
        
        // Use Set to ensure unique display (simple de-duplication)
        const uniqueTxnSet = new Set();
        const finalHistory = [];

        sortedHistory.forEach(tx => {
             // Create a unique key for deduplication (TXN ID + TYPE + AMOUNT)
             const uniqueKey = `${tx.txnId}_${tx.type}_${tx.amount.toFixed(2)}`;
             if (!uniqueTxnSet.has(uniqueKey)) {
                 uniqueTxnSet.add(uniqueKey);
                 finalHistory.push(tx);
             }
        });
        

        finalHistory.forEach((tx) => {
            const row = txnTableBody.insertRow();
            const txnDate = new Date(tx.date).toLocaleString();
            const statusClass = `txn-${tx.type}`;
            
            // Determine the user associated with this entry
            const sourceUser = tx.sourceUser ? `(User: ${tx.sourceUser})` : '';

            row.classList.add(statusClass);

            row.innerHTML = `
                <td>${txnDate}</td>
                <td>${tx.type.toUpperCase()}</td>
                <td>₹${tx.amount.toFixed(2)}</td>
                <td>${tx.txnId || 'N/A'}</td>
                <td>${tx.note} ${sourceUser}</td>
            `;
        });
        txnCountElement.textContent = `${finalHistory.length} unique transactions displayed. Total transactions found: ${finalHistory.length}`;
    }

    // --- 4. FILTERING/SEARCH (Updated to use loadAllHistory) ---
    function filterAndSearchTxns() {
        const allHistory = loadAllHistory(); // Loads complete data
        const query = txnSearchInput.value.toLowerCase();
        const typeFilter = txnTypeFilter.value;
        
        let filteredTxns = allHistory;

        // Apply Type Filter
        if (typeFilter !== 'all') {
            filteredTxns = filteredTxns.filter(tx => tx.type === typeFilter);
        }

        // Apply Search Query
        if (query) {
            filteredTxns = filteredTxns.filter(tx => 
                (tx.txnId && tx.txnId.toLowerCase().includes(query)) ||
                (tx.note && tx.note.toLowerCase().includes(query)) ||
                (tx.sourceUser && tx.sourceUser.toLowerCase().includes(query))
            );
        }
        
        renderTxnTable(filteredTxns);
    }

    searchBtn.addEventListener('click', filterAndSearchTxns);
    txnSearchInput.addEventListener('keyup', filterAndSearchTxns);
    txnTypeFilter.addEventListener('change', filterAndSearchTxns);

    // --- INITIALIZE ---
    renderTxnTable(loadAllHistory());
});