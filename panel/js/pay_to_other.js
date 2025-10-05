// panel/js/pay_to_other.js - Wallet Transfer & Lifafa Logic (Finalized & Robust)

document.addEventListener('DOMContentLoaded', () => {
    const transferForm = document.getElementById('transferForm');
    const recipientMobileInput = document.getElementById('recipientMobile');
    const transferAmountInput = document.getElementById('transferAmount');
    const recipientUsernameMsg = document.getElementById('recipientUsernameMsg');
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // NEW: Lifafa Elements (Rest of Lifafa elements are used later in the file)
    const lifafaForm = document.getElementById('lifafaForm');
    const lifafaCountInput = document.getElementById('lifafaCount'); // Lifafa Count Input
    const lifafaPerUserAmountInput = document.getElementById('lifafaPerUserAmount'); // Per User Amount Input
    const activeLifafasList = document.getElementById('activeLifafasList');

    // TRANSFER/LIFAFA LIMITS
    const MAX_DAILY_TRANSFER = 100; 
    const MIN_LIFAFA_AMOUNT = 10;
    const DAILY_LIMIT_KEY = 'nextEarnXDailyTransfer'; 
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    // CRITICAL FIX: Global Balance and History Keys
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 

    let senderUsername = '';
    let recipientUser = null; 

    // --- UTILITIES (Refactored to handle GLOBAL Keys for sender) ---
    const USER_STORAGE_KEY = 'nextEarnXUsers';
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }

    // CRITICAL FIX: Sender always uses the GLOBAL_BALANCE_KEY
    function getBalance(username) {
        // If checking sender's balance, use the global key. Otherwise, assume recipient check.
        if (username === senderUsername) {
            return parseFloat(localStorage.getItem(GLOBAL_BALANCE_KEY) || '0.00');
        }
        // For recipients, we must use per-user keys to ensure separation (if they exist)
        return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00'); 
    }
    
    // CRITICAL FIX: Sender always uses the GLOBAL_BALANCE_KEY
    function setBalance(username, balance) {
        if (username === senderUsername) {
            localStorage.setItem(GLOBAL_BALANCE_KEY, balance.toFixed(2));
            return;
        }
        // For recipients, use per-user keys
        localStorage.setItem(`nextEarnXBalance_${username}`, balance.toFixed(2));
    }
    
    // CRITICAL FIX: Sender always uses the GLOBAL_HISTORY_KEY
    function getHistory(username) {
        const key = (username === senderUsername) ? GLOBAL_HISTORY_KEY : `nextEarnXHistory_${username}`;
        try { return JSON.parse(localStorage.getItem(key) || '[]'); }
        catch { return []; }
    }

    // CRITICAL FIX: Sender always uses the GLOBAL_HISTORY_KEY
    function saveHistory(username, history) {
        const key = (username === senderUsername) ? GLOBAL_HISTORY_KEY : `nextEarnXHistory_${username}`;
        localStorage.setItem(key, JSON.stringify(history));
    }
    
    // NOTE: loadUsers, loadLifafas, saveLifafas are fine as they are.
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function loadLifafas() {
        try { return JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function saveLifafas(lifafas) {
        localStorage.setItem(LIFAFA_STORAGE_KEY, JSON.stringify(lifafas));
    }
    
    // Utility to get today's transferred amount (for daily limit check)
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
    
    // --- LIFAFA LIST RENDERING ---
    function renderLifafas() {
        const lifafas = loadLifafas().filter(l => l.creator === senderUsername);
        activeLifafasList.innerHTML = '';
        
        if (lifafas.length === 0) {
            activeLifafasList.innerHTML = '<p>No active giveaways.</p>';
            return;
        }

        lifafas.forEach(l => {
            const item = document.createElement('div');
            item.classList.add('lifafa-item');
            
            const claimedCount = l.claims.length;
            const statusText = (claimedCount === l.count) ? 'CLOSED' : `${claimedCount}/${l.count} Claimed`;
            
            // CRITICAL FIX: Lifafa per-user amount calculation
            const totalAmount = l.perClaim * l.count;

            item.innerHTML = `
                <p>
                    <strong>₹${totalAmount.toFixed(2)}</strong> | ${statusText}
                    <br>Link: <span class="link" data-link="${window.location.origin}/claim.html?id=${l.id}" title="Click to copy">${window.location.origin}/claim.html?id=${l.id}</span>
                </p>
                <p style="color:#777; font-size:11px;">Created: ${new Date(l.date).toLocaleString()}</p>
            `;
            activeLifafasList.appendChild(item);
            
            // Attach copy listener
            item.querySelector('.link').addEventListener('click', (e) => {
                const linkToCopy = e.target.dataset.link;
                navigator.clipboard.writeText(linkToCopy);
                alert('Lifafa Link copied to clipboard!');
            });
        });
    }

    // --- INITIALIZE & TAB SWITCHING LOGIC (UNCHANGED) ---
    getCurrentUserSession(); 
    refreshBalanceUI();
    renderLifafas();

    // Tab Switching Logic (Fine)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(target + 'Section').style.display = 'block';
            const logType = (target === 'transfer') ? 'Ready to send...' : 'Ready to create Lifafa...';
            logArea.innerHTML = `<p>${logType}</p>`;
        });
    });


    // ------------------------------------------
    // --- TRANSFER LOGIC ---
    // ------------------------------------------

    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(transferAmountInput.value);
        const currentBalance = getBalance(senderUsername);
        const todayTransferred = getTodayTransferredAmount(senderUsername);

        // Validation and Limit Checks
        if (!recipientUser) { appendLog('Error: Please enter a valid, registered mobile number.', 'error'); return; }
        if (isNaN(amount) || amount < 1) { appendLog('Error: Transfer amount must be at least ₹1.', 'error'); return; }
        if (amount > MAX_DAILY_TRANSFER) { appendLog(`Error: Transfer amount exceeds the ₹${MAX_DAILY_TRANSFER} limit.`, 'error'); return; }
        if (currentBalance < amount) { appendLog(`Error: Insufficient funds. Available: ₹${currentBalance.toFixed(2)}`, 'error'); return; }
        
        const totalAfterTransfer = todayTransferred + amount;
        if (totalAfterTransfer > MAX_DAILY_TRANSFER) { appendLog(`Error: Daily transfer limit exceeded. Remaining limit: ₹${(MAX_DAILY_TRANSFER - todayTransferred).toFixed(2)}`, 'error'); return; }

        if (!confirm(`Confirm transfer of ₹${amount.toFixed(2)} to ${recipientUser.username}?`)) return;
        
        // Execution (Uses fixed getBalance/setBalance logic)
        const newSenderBalance = currentBalance - amount;
        setBalance(senderUsername, newSenderBalance);
        const newRecipientBalance = getBalance(recipientUser.username) + amount;
        setBalance(recipientUser.username, newRecipientBalance);

        // Logging (Uses fixed getHistory/saveHistory logic)
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({ date: Date.now(), type: 'debit', amount: amount, txnId: 'TRANSFER_SENT_' + Date.now(), note: `Transfer to ${recipientUser.username}` });
        saveHistory(senderUsername, senderHistory);

        let recipientHistory = getHistory(recipientUser.username);
        recipientHistory.push({ date: Date.now(), type: 'credit', amount: amount, txnId: 'TRANSFER_RECEIVED_' + Date.now(), note: `Received from ${senderUsername}` });
        saveHistory(recipientUser.username, recipientHistory);
        
        recordTransfer(senderUsername, amount);

        refreshBalanceUI();
        appendLog(`SUCCESS: ₹${amount.toFixed(2)} transferred to ${recipientUser.username}. New balance: ₹${newSenderBalance.toFixed(2)}`, 'success');
        transferForm.reset();
        recipientUser = null;
        recipientMobileInput.dispatchEvent(new Event('input')); 
    });
    
    // Recipient Input Listener (UNCHANGED)
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
            recipientUsernameMsg.textContent = "❌ Mobile number not found on NextEarnX.";
            recipientUsernameMsg.style.color = 'red';
        }
    });

    // ------------------------------------------
    // --- LIFAFA CREATION LOGIC (UPDATED) ---
    // ------------------------------------------

    lifafaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // CRITICAL FIX: Total amount is calculated from per-user amount * count
        const perUserAmount = parseFloat(lifafaPerUserAmountInput.value);
        const count = parseInt(lifafaCountInput.value);
        const totalAmount = perUserAmount * count; // Calculate total amount
        
        const currentBalance = getBalance(senderUsername);

        // 1. Validation
        if (isNaN(perUserAmount) || perUserAmount < 0.01) {
            appendLog(`Error: Per user amount must be at least ₹0.01.`, 'error');
            return;
        }
        if (isNaN(count) || count < 2) {
            appendLog('Error: Minimum claims/users is 2.', 'error');
            return;
        }
        if (totalAmount < MIN_LIFAFA_AMOUNT) {
             appendLog(`Error: Minimum Lifafa total amount is ₹${MIN_LIFAFA_AMOUNT}.`, 'error');
             return;
        }
        if (currentBalance < totalAmount) {
            appendLog(`Error: Insufficient balance. Available: ₹${currentBalance.toFixed(2)}. Total Cost: ₹${totalAmount.toFixed(2)}`, 'error');
            return;
        }

        // 2. Confirmation
        if (!confirm(`Confirm creation of Lifafa worth ₹${totalAmount.toFixed(2)} for ${count} users?`)) {
            return;
        }

        // 3. Execution: Deduct and Create Lifafa Object
        const newBalance = currentBalance - totalAmount;
        setBalance(senderUsername, newBalance);

        const uniqueId = senderUsername.slice(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString().slice(-4);
        
        const newLifafa = {
            id: uniqueId,
            creator: senderUsername,
            date: Date.now(),
            totalAmount: totalAmount, // Save total amount
            count: count,
            perClaim: perUserAmount, // Save per user amount
            claims: [] // Array of {username, date, amount}
        };

        // 4. Save Lifafa & Log Transaction
        let lifafas = loadLifafas();
        lifafas.push(newLifafa);
        saveLifafas(lifafas);
        
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({ date: Date.now(), type: 'debit', amount: totalAmount, txnId: 'LIFAFA_CREATED_' + uniqueId, note: `Created Lifafa for ${count} users` });
        saveHistory(senderUsername, senderHistory);


        // 5. Final UI Update
        refreshBalanceUI();
        renderLifafas();
        appendLog(`SUCCESS: Lifafa created! Share link with ID: ${uniqueId}`, 'success');
        
        // Display the link for immediate copying
        const linkMsg = document.createElement('p');
        linkMsg.innerHTML = `<span style="color: #00e0ff; font-weight:bold;">Link:</span> ${window.location.origin}/claim.html?id=${uniqueId}`;
        logArea.prepend(linkMsg);
        
        lifafaForm.reset();
    });

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