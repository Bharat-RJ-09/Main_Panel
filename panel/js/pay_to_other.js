// panel/js/pay_to_other.js - Wallet Transfer Logic (Finalized & Robust)

document.addEventListener('DOMContentLoaded', () => {
    const transferForm = document.getElementById('transferForm');
    const recipientMobileInput = document.getElementById('recipientMobile');
    const transferAmountInput = document.getElementById('transferAmount');
    const recipientUsernameMsg = document.getElementById('recipientUsernameMsg');
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); // CRITICAL: Correct ID
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // TRANSFER LIMITS (Business Rule)
    const MAX_DAILY_TRANSFER = 100; 
    const DAILY_LIMIT_KEY = 'nextEarnXDailyTransfer'; 

    let senderUsername = '';
    let recipientUser = null; // Stores the object of the found recipient

    // --- CRITICAL UTILITIES ---
    const USER_STORAGE_KEY = 'nextEarnXUsers';
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }

    // Use username in the key for per-user data
    function getBalance(username) {
        return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00');
    }
    
    function setBalance(username, balance) {
        localStorage.setItem(`nextEarnXBalance_${username}`, balance.toFixed(2));
    }
    
    function getHistory(username) {
        try { return JSON.parse(localStorage.getItem(`nextEarnXHistory_${username}`) || '[]'); }
        catch { return []; }
    }

    function saveHistory(username, history) {
        localStorage.setItem(`nextEarnXHistory_${username}`, JSON.stringify(history));
    }
    
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }

    // --- DAILY LIMIT UTILITIES ---
    function getTodayTransferredAmount(username) {
        const today = new Date().toDateString();
        try {
            const data = JSON.parse(localStorage.getItem(DAILY_LIMIT_KEY) || '{}');
            if (data.date === today && data[username]) {
                return data[username];
            }
            return 0;
        } catch {
            return 0;
        }
    }

    function recordTransfer(username, amount) {
        const today = new Date().toDateString();
        let data;
        try {
            data = JSON.parse(localStorage.getItem(DAILY_LIMIT_KEY) || '{}');
        } catch {
            data = {};
        }

        if (data.date !== today) {
            data = { date: today }; 
        }

        data[username] = (data[username] || 0) + amount;
        localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(data));
    }


    // --- INITIALIZE & UI SYNC ---
    
    function refreshBalanceUI() {
        const currentBalance = getBalance(senderUsername); 
        currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
    }

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : '#e0e0e0';
        logArea.prepend(p);
    }
    
    // --- RECIPIENT VALIDATION LOGIC (Live Search by Mobile) ---
    recipientMobileInput.addEventListener('input', () => {
        const mobile = recipientMobileInput.value.trim();
        const users = loadUsers();
        
        recipientUsernameMsg.textContent = '';
        recipientUser = null;

        if (mobile.length !== 10 || isNaN(mobile)) {
             recipientUsernameMsg.textContent = 'Enter a valid 10-digit number.';
             recipientUsernameMsg.style.color = '#ffcc00';
             return;
        }

        // Find recipient by mobile
        const userFound = users.find(user => user.mobile === mobile);

        if (userFound) {
            if (userFound.username.toLowerCase() === senderUsername.toLowerCase()) {
                recipientUsernameMsg.textContent = "❌ Cannot transfer funds to yourself.";
                recipientUsernameMsg.style.color = 'red';
                return;
            }
            recipientUser = userFound;
            recipientUsernameMsg.textContent = `✅ Sending to: ${userFound.username}`;
            recipientUsernameMsg.style.color = 'limegreen';
        } else {
            recipientUsernameMsg.textContent = "❌ Mobile number not found on NextEarnX.";
            recipientUsernameMsg.style.color = 'red';
        }
    });

    // --- TRANSFER SUBMISSION ---
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(transferAmountInput.value);
        const currentBalance = getBalance(senderUsername);
        const todayTransferred = getTodayTransferredAmount(senderUsername);

        // 1. Validation Checks
        if (!recipientUser) {
            appendLog('Error: Please enter a valid, registered mobile number.', 'error');
            return;
        }
        if (isNaN(amount) || amount < 1) {
            appendLog('Error: Transfer amount must be at least ₹1.', 'error');
            return;
        }
        if (amount > MAX_DAILY_TRANSFER) {
            appendLog(`Error: Transfer amount exceeds the ₹${MAX_DAILY_TRANSFER} limit.`, 'error');
            return;
        }
        if (currentBalance < amount) {
            appendLog(`Error: Insufficient funds. Available: ₹${currentBalance.toFixed(2)}`, 'error');
            return;
        }

        // 2. Daily Limit Check
        const totalAfterTransfer = todayTransferred + amount;
        if (totalAfterTransfer > MAX_DAILY_TRANSFER) {
            appendLog(`Error: Daily transfer limit exceeded. Remaining limit: ₹${(MAX_DAILY_TRANSFER - todayTransferred).toFixed(2)}`, 'error');
            return;
        }

        // 3. Confirmation
        if (!confirm(`Confirm transfer of ₹${amount.toFixed(2)} to ${recipientUser.username}?`)) {
            return;
        }
        
        // 4. Execution: Deduct/Credit & Record
        const newSenderBalance = currentBalance - amount;
        setBalance(senderUsername, newSenderBalance);
        
        const newRecipientBalance = getBalance(recipientUser.username) + amount;
        setBalance(recipientUser.username, newRecipientBalance);

        // 5. Transaction Logging 
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({ date: Date.now(), type: 'debit', amount: amount, txnId: 'TRANSFER_SENT_' + Date.now(), note: `Transfer to ${recipientUser.username}` });
        saveHistory(senderUsername, senderHistory);

        let recipientHistory = getHistory(recipientUser.username);
        recipientHistory.push({ date: Date.now(), type: 'credit', amount: amount, txnId: 'TRANSFER_RECEIVED_' + Date.now(), note: `Received from ${senderUsername}` });
        saveHistory(recipientUser.username, recipientHistory);
        
        // 6. Record Daily Limit
        recordTransfer(senderUsername, amount);


        // 7. Final UI Update
        refreshBalanceUI();
        appendLog(`SUCCESS: ₹${amount.toFixed(2)} transferred to ${recipientUser.username}. New balance: ₹${newSenderBalance.toFixed(2)}`, 'success');
        transferForm.reset();
        recipientUser = null;
        recipientMobileInput.dispatchEvent(new Event('input')); // Clear validation message
    });

    // --- INITIALIZE ---
    getCurrentUserSession(); 
    refreshBalanceUI(); 
});