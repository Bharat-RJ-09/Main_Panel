// panel/js/pay_to_other.js - Wallet Transfer Logic (Cleaned & Redesigned)

document.addEventListener('DOMContentLoaded', () => {
    const transferForm = document.getElementById('transferForm');
    const recipientMobileInput = document.getElementById('recipientMobile');
    const transferAmountInput = document.getElementById('transferAmount');
    const paymentCommentInput = document.getElementById('paymentComment'); // ADDED Comment Input
    const recipientUsernameMsg = document.getElementById('recipientUsernameMsg');
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    const recentCheckBtn = document.getElementById('recentCheckBtn'); // NEW
    const recentDropdown = document.getElementById('recentDropdown'); // NEW
    
    // TRANSFER LIMITS
    const MAX_DAILY_TRANSFER = 100; 
    const DAILY_LIMIT_KEY = 'nextEarnXDailyTransfer'; 
    
    // CRITICAL FIX: Global Balance and History Keys
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 
    const USER_STORAGE_KEY = 'nextEarnXUsers';

    let senderUsername = '';
    let recipientUser = null; 

    // --- UTILITIES ---
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }

    function getBalance(username) {
        if (username === senderUsername) {
            return parseFloat(localStorage.getItem(GLOBAL_BALANCE_KEY) || '0.00');
        }
        return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00'); 
    }
    
    function setBalance(username, balance) {
        if (username === senderUsername) {
            localStorage.setItem(GLOBAL_BALANCE_KEY, balance.toFixed(2));
            return;
        }
        localStorage.setItem(`nextEarnXBalance_${username}`, balance.toFixed(2));
    }
    
    function getHistory(username) {
        const key = (username === senderUsername) ? GLOBAL_HISTORY_KEY : `nextEarnXHistory_${username}`;
        try { return JSON.parse(localStorage.getItem(key) || '[]'); }
        catch { return []; }
    }

    function saveHistory(username, history) {
        const key = (username === senderUsername) ? GLOBAL_HISTORY_KEY : `nextEarnXHistory_${username}`;
        localStorage.setItem(key, JSON.stringify(history));
    }
    
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function getTodayTransferredAmount(username) {
        const todayKey = `${DAILY_LIMIT_KEY}_${username}_${new Date().toDateString()}`;
        return parseFloat(localStorage.getItem(todayKey) || '0.00');
    }

    function recordTransfer(username, amount) {
        const todayKey = `${DAILY_LIMIT_KEY}_${username}_${new Date().toDateString()}`;
        const current = getTodayTransferredAmount(username);
        localStorage.setItem(todayKey, (current + amount).toFixed(2));
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
    
    getCurrentUserSession(); 
    refreshBalanceUI();

    // Tab Switching Logic (Single / Bulk)
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.transfer-tab-content').forEach(s => s.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(target + 'Content').style.display = 'block';
            
            logArea.innerHTML = `<p>Ready for ${target} transfer...</p>`;
        });
    });

    // Recent Check Dropdown Toggle
    recentCheckBtn.addEventListener('click', () => {
        recentDropdown.style.display = recentDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside (Mock)
    window.addEventListener('click', (e) => {
        if (!recentCheckBtn.contains(e.target) && !recentDropdown.contains(e.target)) {
            recentDropdown.style.display = 'none';
        }
    });


    // ------------------------------------------
    // --- TRANSFER LOGIC ---
    // ------------------------------------------

    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(transferAmountInput.value);
        const comment = paymentCommentInput.value.trim() || 'Wallet Transfer'; // Use comment or default
        const currentBalance = getBalance(senderUsername);
        const todayTransferred = getTodayTransferredAmount(senderUsername);

        // Validation and Limit Checks
        if (!recipientUser) { appendLog('Error: Please enter a valid, registered mobile number.', 'error'); return; }
        if (isNaN(amount) || amount < 1) { appendLog('Error: Transfer amount must be at least ₹1.', 'error'); return; }
        if (amount > MAX_DAILY_TRANSFER) { appendLog(`Error: Transfer amount exceeds the ₹${MAX_DAILY_TRANSFER} limit.`, 'error'); return; }
        if (currentBalance < amount) { appendLog(`Error: Insufficient funds. Available: ₹${currentBalance.toFixed(2)}`, 'error'); return; }
        
        const totalAfterTransfer = todayTransferred + amount;
        if (totalAfterTransfer > MAX_DAILY_TRANSFER) { appendLog(`Error: Daily transfer limit exceeded. Remaining limit: ₹${(MAX_DAILY_TRANSFER - todayTransferred).toFixed(2)}`, 'error'); return; }

        if (!confirm(`Confirm transfer of ₹${amount.toFixed(2)} to ${recipientUser.username}? Comment: ${comment}`)) return;
        
        // Execution
        const newSenderBalance = currentBalance - amount;
        setBalance(senderUsername, newSenderBalance);
        const newRecipientBalance = getBalance(recipientUser.username) + amount;
        setBalance(recipientUser.username, newRecipientBalance);

        // Logging
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({ date: Date.now(), type: 'debit', amount: amount, txnId: 'TRANSFER_SENT_' + Date.now(), note: `${comment} (To ${recipientUser.username})` });
        saveHistory(senderUsername, senderHistory);

        let recipientHistory = getHistory(recipientUser.username);
        recipientHistory.push({ date: Date.now(), type: 'credit', amount: amount, txnId: 'TRANSFER_RECEIVED_' + Date.now(), note: `${comment} (From ${senderUsername})` });
        saveHistory(recipientUser.username, recipientHistory);
        
        recordTransfer(senderUsername, amount);

        refreshBalanceUI();
        appendLog(`SUCCESS: ₹${amount.toFixed(2)} transferred to ${recipientUser.username}. New balance: ₹${newSenderBalance.toFixed(2)}`, 'success');
        transferForm.reset();
        recipientUser = null;
        recipientMobileInput.dispatchEvent(new Event('input')); 
    });
    
    // Recipient Input Listener 
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
            recipientUsernameMsg.textContent = "❌ User not found on NextEarnX.";
            recipientUsernameMsg.style.color = 'red';
        }
    });

    // --- BULK TRANSFER MOCK LOGIC ---
    const bulkTransferForm = document.getElementById('bulkTransferForm');
    const bulkHistoryBtn = document.getElementById('bulkHistoryBtn');

    if (bulkTransferForm) {
        bulkTransferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const numbersText = document.getElementById('bulkRecipientNumbers').value.trim();
            const amount = parseFloat(document.getElementById('bulkTransferAmount').value);
            const comment = document.getElementById('bulkPaymentComment').value.trim();
            
            // Basic number parsing (using the same logic as Lifafa special users)
            const recipientNumbers = numbersText.split(/[,. \s\n]+/).filter(Boolean);
            
            if (recipientNumbers.length === 0) {
                appendLog('Error: Please enter at least one mobile number for bulk transfer.', 'error');
                return;
            }
            if (isNaN(amount) || amount < 1) {
                appendLog('Error: Transfer amount must be at least ₹1.', 'error');
                return;
            }

            const totalCost = amount * recipientNumbers.length;
            const currentBalance = getBalance(senderUsername);

            if (currentBalance < totalCost) {
                appendLog(`Error: Insufficient balance. Total cost for ${recipientNumbers.length} users is ₹${totalCost.toFixed(2)}.`, 'error');
                alert('Insufficient Balance for Bulk Transfer.');
                return;
            }
            
            if (confirm(`Confirm bulk transfer of ₹${amount.toFixed(2)} to ${recipientNumbers.length} users? Total Cost: ₹${totalCost.toFixed(2)}`)) {
                 appendLog(`MOCK: Processing bulk transfer of ₹${amount.toFixed(2)} to ${recipientNumbers.length} users.`, 'loading');
                 
                 // MOCK DEDUCTION (Actual transfer logic would iterate and log individual transactions)
                 const newBalance = currentBalance - totalCost;
                 setBalance(senderUsername, newBalance);
                 refreshBalanceUI();

                 setTimeout(() => {
                     appendLog(`SUCCESS: Bulk transfer initiated for ${recipientNumbers.length} users.`, 'success');
                     bulkTransferForm.reset();
                 }, 2500);
            }
        });
    }
    
    if (bulkHistoryBtn) {
        bulkHistoryBtn.addEventListener('click', () => {
            alert('MOCK: Bulk transfer history feature under development.');
        });
    }
    // --- END BULK MOCK LOGIC ---

    // Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }
});