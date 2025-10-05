// admin/js/transaction_audit.js

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_SESSION_KEY = 'nextEarnXAdminSession';
    const HISTORY_STORAGE_KEY = 'nextEarnXHistory';
    const txnTableBody = document.getElementById('txnTableBody');
    const txnSearchInput = document.getElementById('txnSearchInput');
    const txnTypeFilter = document.getElementById('txnTypeFilter');
    const searchBtn = document.getElementById('searchBtn');
    const txnCountElement = document.getElementById('txnCount');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // --- 1. SECURITY CHECK ---
    function checkAdminSession() {
        if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
            alert('Access Denied. Please log in.');
            window.location.href = 'admin_login.html';
        }
    }
    checkAdminSession();
    
    // --- LOGOUT HANDLER (For consistency) ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = 'admin_login.html';
        });
    }

    // --- 2. DATA UTILITY ---
    function loadHistory() {
        try {
            // History is stored as an array of objects
            return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    }

    // --- 3. RENDERING ---
    function renderTxnTable(history) {
        txnTableBody.innerHTML = ''; // Clear table
        
        if (history.length === 0) {
            txnTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No transactions recorded.</td></tr>';
            txnCountElement.textContent = '0 transactions displayed.';
            return;
        }

        // Sort by date (newest first)
        const sortedHistory = history.sort((a, b) => b.date - a.date);

        sortedHistory.forEach((tx) => {
            const row = txnTableBody.insertRow();
            const txnDate = new Date(tx.date).toLocaleString();
            const statusClass = `txn-${tx.type}`;

            row.classList.add(statusClass);

            row.innerHTML = `
                <td>${txnDate}</td>
                <td>${tx.type.toUpperCase()}</td>
                <td>₹${tx.amount.toFixed(2)}</td>
                <td>${tx.txnId || 'N/A'}</td>
                <td>${tx.note}</td>
            `;
        });
        txnCountElement.textContent = `${history.length} transactions displayed. Total recorded: ${loadHistory().length}`;
    }

    // --- 4. FILTERING/SEARCH ---
    function filterAndSearchTxns() {
        const allHistory = loadHistory();
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
                (tx.note && tx.note.toLowerCase().includes(query))
            );
        }
        
        renderTxnTable(filteredTxns);
    }

    searchBtn.addEventListener('click', filterAndSearchTxns);
    txnSearchInput.addEventListener('keyup', filterAndSearchTxns);
    txnTypeFilter.addEventListener('change', filterAndSearchTxns);

    // --- INITIALIZE ---
    renderTxnTable(loadHistory());
});