// panel/js/wallet.js - Updated for Global Settings

document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('currentBalance');
    const depositForm = document.getElementById('depositForm');
    const depositInput = document.getElementById('depositAmount');
    const historyLog = document.getElementById('historyLog');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- GLOBAL SETTINGS UTILITY ---
    const DEFAULTS = { minDeposit: 60 };
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('nextEarnXGlobalSettings'));
            return settings ? { ...DEFAULTS, ...settings } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    }
    const settings = loadSettings();
    
    // --- UI Update: Min Deposit Label ---
    const depositLabel = document.querySelector('label[for="depositAmount"]');
    if(depositLabel) {
        depositLabel.textContent = `Amount (Min ₹${settings.minDeposit}):`;
    }
    if(depositInput) {
        depositInput.setAttribute('min', settings.minDeposit);
    }
    

    // --- Utility Functions ---
    function getBalance() {
        try {
            return parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00');
        } catch(e) { return 0.00; }
    }

    function saveBalance(balance) {
        localStorage.setItem('nextEarnXBalance', balance.toFixed(2));
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('nextEarnXHistory') || '[]');
        } catch(e) { return []; }
    }

    function saveHistory(history) {
        localStorage.setItem('nextEarnXHistory', JSON.stringify(history));
    }

    function updateBalanceUI() {
        balanceElement.textContent = `₹ ${getBalance().toFixed(2)}`;
    }

    function updateHistoryUI() {
        const history = getHistory().reverse(); // Show newest first
        historyLog.innerHTML = ''; // Clear existing log

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

    // --- Event Handlers ---

    // Initial load
    updateBalanceUI();
    updateHistoryUI();

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
        
        // --- DYNAMIC VALIDATION ---
        if (isNaN(amount) || amount < settings.minDeposit) {
            alert(`Deposit must be a minimum of ₹${settings.minDeposit}.`);
            return;
        }

        // --- Mock UPI/Payment Gateway Redirection ---
        const upiURL = `purchase.html?plan=Deposit&price=${amount}&redirect=wallet`;
        window.location.href = upiURL;
    });
});