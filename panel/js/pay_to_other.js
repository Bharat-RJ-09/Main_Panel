// panel/js/pay_to_other.js - Wallet Transfer Logic

document.addEventListener('DOMContentLoaded', () => {
    const transferForm = document.getElementById('transferForm');
    const recipientUsernameInput = document.getElementById('recipientUsername');
    const transferAmountInput = document.getElementById('transferAmount');
    const usernameCheckMsg = document.getElementById('usernameCheckMsg');
    const currentBalanceDisplay = document.getElementById('currentBalance');
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    
    let isRecipientValid = false;
    let senderUsername = '';

    // --- UTILITIES ---
    const USER_STORAGE_KEY = 'nextEarnXUsers';

    function getBalance(username) {
        return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00');
    }
    
    function setBalance(username, balance) {
        localStorage.setItem(`nextEarnXBalance_${username}`, balance.toFixed(2));
    }

    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }

    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; // Set sender username globally
            return user;
        } catch { return null; }
    }
    
    function getHistory(username) {
        try { return JSON.parse(localStorage.getItem(`nextEarnXHistory_${username}`) || '[]'); }
        catch { return []; }
    }

    function saveHistory(username, history) {
        localStorage.setItem(`nextEarnXHistory_${username}`, JSON.stringify(history));
    }

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : '#e0e0e0';
        logArea.prepend(p);
    }
    
    function refreshBalanceUI() {
        const currentBalance = getBalance(senderUsername);
        currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
    }

    // --- INITIALIZE & SECURITY ---
    getCurrentUserSession();
    refreshBalanceUI();

    // Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    // --- RECIPIENT VALIDATION LOGIC ---
    recipientUsernameInput.addEventListener('input', () => {
        const username = recipientUsernameInput.value.trim();
        const users = loadUsers();
        
        usernameCheckMsg.textContent = '';
        isRecipientValid = false;

        if (username.length < 3) return; // Wait for minimum chars

        if (username.toLowerCase() === senderUsername.toLowerCase()) {
            usernameCheckMsg.textContent = "❌ Cannot transfer funds to yourself.";
            usernameCheckMsg.style.color = 'red';
            return;
        }

        const recipientExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

        if (recipientExists) {
            usernameCheckMsg.textContent = "✅ User found and ready for transfer.";
            usernameCheckMsg.style.color = 'limegreen';
            isRecipientValid = true;
        } else {
            usernameCheckMsg.textContent = "❌ User not found on NextEarnX.";
            usernameCheckMsg.style.color = 'red';
        }
    });

    // --- TRANSFER SUBMISSION ---
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const recipientUsername = recipientUsernameInput.value.trim();
        const amount = parseFloat(transferAmountInput.value);
        const senderBalance = getBalance(senderUsername);

        // 1. Basic Validation
        if (!isRecipientValid) {
            appendLog('Error: Please enter a valid, existing recipient username.', 'error');
            return;
        }
        if (isNaN(amount) || amount < 1) {
            appendLog('Error: Transfer amount must be at least ₹1.', 'error');
            return;
        }
        if (senderBalance < amount) {
            appendLog(`Error: Insufficient funds. Available: ₹${senderBalance.toFixed(2)}`, 'error');
            alert('Insufficient balance for transfer.');
            return;
        }

        // 2. Confirmation
        if (!confirm(`Confirm transfer of ₹${amount.toFixed(2)} to ${recipientUsername}?`)) {
            return;
        }
        
        // 3. Execution: Deduct from Sender
        const newSenderBalance = senderBalance - amount;
        setBalance(senderUsername, newSenderBalance);

        // 4. Execution: Credit to Recipient (NOTE: We assume the user's initial balance is 0 if not set)
        const recipientBalance = getBalance(recipientUsername);
        const newRecipientBalance = recipientBalance + amount;
        setBalance(recipientUsername, newRecipientBalance);

        // 5. Transaction Logging (Sender DEBIT)
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({
            date: Date.now(),
            type: 'debit',
            amount: amount,
            txnId: 'TRANSFER_SENT_' + Date.now(),
            note: `Transfer to ${recipientUsername}`
        });
        saveHistory(senderUsername, senderHistory);

        // 6. Transaction Logging (Recipient CREDIT)
        let recipientHistory = getHistory(recipientUsername);
        recipientHistory.push({
            date: Date.now(),
            type: 'credit',
            amount: amount,
            txnId: 'TRANSFER_RECEIVED_' + Date.now(),
            note: `Received from ${senderUsername}`
        });
        saveHistory(recipientUsername, recipientHistory);


        // 7. Final UI Update
        refreshBalanceUI();
        appendLog(`SUCCESS: ₹${amount.toFixed(2)} transferred to ${recipientUsername}. New balance: ₹${newSenderBalance.toFixed(2)}`, 'success');
        transferForm.reset();
        recipientUsernameInput.value = '';
        usernameCheckMsg.textContent = '';
        isRecipientValid = false;
        
        // Ensure recipient username check re-runs immediately after reset for clean slate
        recipientUsernameInput.dispatchEvent(new Event('input')); 
    });
});