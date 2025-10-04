document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('currentBalance');
    const depositForm = document.getElementById('depositForm');
    const depositInput = document.getElementById('depositAmount');
    const historyLog = document.getElementById('historyLog');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn'); // For consistency

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

        if (isNaN(amount) || amount < 60) {
            alert("Deposit must be a minimum of ₹60.");
            return;
        }

        // --- Mock UPI/Payment Gateway Redirection ---
        const upiURL = `purchase.html?plan=Deposit&price=${amount}&redirect=wallet`;
        window.location.href = upiURL;
        
        // Note: The actual credit logic will happen in purchase.js
        // We will need to update purchase.js to handle 'Deposit' plan type.
    });
});