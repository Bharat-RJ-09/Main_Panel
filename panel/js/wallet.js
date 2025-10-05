// panel/js/wallet.js - FINALIZED WITH PER-USER BALANCE

document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('currentBalance');
    const depositForm = document.getElementById('depositForm');
    const depositInput = document.getElementById('depositAmount');
    const historyLog = document.getElementById('historyLog');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- USER/BALANCE UTILITIES ---
    let currentUsername = '';

    function getCurrentUsername() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            currentUsername = user ? user.username : '';
            return currentUsername;
        } catch { return ''; }
    }
    
    // NOTE: All financial data now uses the unique per-user key
    function getBalance() {
        const username = getCurrentUsername();
        try {
            // Use username in the key
            return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00'); 
        } catch(e) { return 0.00; }
    }

    function saveBalance(balance) {
        const username = getCurrentUsername();
        localStorage.setItem(`nextEarnXBalance_${username}`, balance.toFixed(2));
    }

    function getHistory() {
        const username = getCurrentUsername();
        try {
            return JSON.parse(localStorage.getItem(`nextEarnXHistory_${username}`) || '[]');
        } catch(e) { return []; }
    }

    function saveHistory(history) {
        const username = getCurrentUsername();
        localStorage.setItem(`nextEarnXHistory_${username}`, JSON.stringify(history));
    }
    
    // --- UI Logic ---
    function updateBalanceUI() {
        balanceElement.textContent = `₹ ${getBalance().toFixed(2)}`;
    }

    function updateHistoryUI() {
        const history = getHistory().reverse(); 
        historyLog.innerHTML = ''; 

        if (history.length === 0) {
            historyLog.innerHTML = '<p>No recent transactions.</p>';
            return;
        }

        history.forEach(tx => {
            const item = document.createElement('div');
            item.classList.add('transaction-item');
            const statusClass = tx.type === 'credit' ? 'status-credit' : 'status-debit';
            item.innerHTML = `
                <span class="${statusClass}">${tx.type.toUpperCase()}: ₹${tx.amount.toFixed(2)}</span>
                <span style="float:right; color:#777;">${new Date(tx.date).toLocaleString()}</span>
                <p style="margin: 5px 0 0; color:#bbb;">${tx.note}</p>
            `;
            historyLog.appendChild(item);
        });
    }
    
    // --- INITIALIZE ---
    getCurrentUsername(); // Initialize username
    updateBalanceUI();
    updateHistoryUI();

    // --- Global Settings Load (Remains the same) ---
    const DEFAULTS = { minDeposit: 60 };
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('nextEarnXGlobalSettings'));
            return settings ? { ...DEFAULTS, ...settings } : DEFAULTS;
        } catch { return DEFAULTS; }
    }
    const settings = loadSettings();
    
    // Update Min Deposit Label
    const depositLabel = document.querySelector('label[for="depositAmount"]');
    if(depositLabel) {
        depositLabel.textContent = `Amount (Min ₹${settings.minDeposit}):`;
    }
    if(depositInput) {
        depositInput.setAttribute('min', settings.minDeposit);
    }
    
    // Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    // Refresh Button
    refreshBtn.addEventListener('click', updateBalanceUI);

    // Deposit Form Submission (Mock Logic)
    depositForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(depositInput.value);
        
        if (isNaN(amount) || amount < settings.minDeposit) {
            alert(`Deposit must be a minimum of ₹${settings.minDeposit}.`);
            return;
        }

        const upiURL = `purchase.html?plan=Deposit&price=${amount}&redirect=wallet`;
        window.location.href = upiURL;
    });
});