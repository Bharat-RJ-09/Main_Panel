// panel/js/pay_to_other.js - Wallet Transfer & Lifafa Logic (Finalized & Robust)

document.addEventListener('DOMContentLoaded', () => {
    const transferForm = document.getElementById('transferForm');
    const recipientMobileInput = document.getElementById('recipientMobile');
    const transferAmountInput = document.getElementById('transferAmount');
    const recipientUsernameMsg = document.getElementById('recipientUsernameMsg');
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // NEW: Lifafa Elements
    const lifafaForm = document.getElementById('lifafaForm');
    const lifafaTotalAmountInput = document.getElementById('lifafaTotalAmount');
    const lifafaCountInput = document.getElementById('lifafaCount');
    const activeLifafasList = document.getElementById('activeLifafasList');

    // NEW: Tab Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const transferSection = document.getElementById('transferSection');
    const lifafaSection = document.getElementById('lifafaSection');

    // TRANSFER/LIFAFA LIMITS
    const MAX_DAILY_TRANSFER = 100; 
    const MIN_LIFAFA_AMOUNT = 10;
    const DAILY_LIMIT_KEY = 'nextEarnXDailyTransfer'; 
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 

    let senderUsername = '';
    let recipientUser = null; 

    // --- UTILITIES (Refactored to handle Lifafa Data) ---
    const USER_STORAGE_KEY = 'nextEarnXUsers';
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }

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
    
    function loadLifafas() {
        try { return JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function saveLifafas(lifafas) {
        localStorage.setItem(LIFAFA_STORAGE_KEY, JSON.stringify(lifafas));
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
            
            item.innerHTML = `
                <p>
                    <strong>₹${l.totalAmount.toFixed(2)}</strong> | ${statusText}
                    <br>Link: <span class="link" data-link="${l.id}" title="Click to copy">${window.location.origin}/claim.html?id=${l.id}</span>
                </p>
                <p style="color:#777; font-size:11px;">Created: ${new Date(l.date).toLocaleString()}</p>
            `;
            activeLifafasList.appendChild(item);
            
            // Attach copy listener
            item.querySelector('.link').addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.target.dataset.link);
                alert('Lifafa Link copied to clipboard!');
            });
        });
    }

    // --- INITIALIZE ---
    getCurrentUserSession(); 
    refreshBalanceUI();
    renderLifafas();


    // --- TAB SWITCHING LOGIC ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            
            // Remove active class from all buttons and sections
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
            
            // Add active class to the clicked button and display target section
            btn.classList.add('active');
            document.getElementById(target + 'Section').style.display = 'block';
            
            // Update log area for context
            const logType = (target === 'transfer') ? 'Ready to send...' : 'Ready to create Lifafa...';
            logArea.innerHTML = `<p>${logType}</p>`;
        });
    });


    // ------------------------------------------
    // --- TRANSFER LOGIC (Remains the same) ---
    // ------------------------------------------

    // ... (All existing validation and transfer submission logic) ...
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(transferAmountInput.value);
        const currentBalance = getBalance(senderUsername);
        const todayTransferred = getTodayTransferredAmount(senderUsername);

        // ... (Validation and Limit Checks) ...
        if (!recipientUser) { appendLog('Error: Please enter a valid, registered mobile number.', 'error'); return; }
        if (isNaN(amount) || amount < 1) { appendLog('Error: Transfer amount must be at least ₹1.', 'error'); return; }
        if (amount > MAX_DAILY_TRANSFER) { appendLog(`Error: Transfer amount exceeds the ₹${MAX_DAILY_TRANSFER} limit.`, 'error'); return; }
        if (currentBalance < amount) { appendLog(`Error: Insufficient funds. Available: ₹${currentBalance.toFixed(2)}`, 'error'); return; }
        
        const totalAfterTransfer = todayTransferred + amount;
        if (totalAfterTransfer > MAX_DAILY_TRANSFER) { appendLog(`Error: Daily transfer limit exceeded. Remaining limit: ₹${(MAX_DAILY_TRANSFER - todayTransferred).toFixed(2)}`, 'error'); return; }

        if (!confirm(`Confirm transfer of ₹${amount.toFixed(2)} to ${recipientUser.username}?`)) return;
        
        // Execution
        const newSenderBalance = currentBalance - amount;
        setBalance(senderUsername, newSenderBalance);
        const newRecipientBalance = getBalance(recipientUser.username) + amount;
        setBalance(recipientUser.username, newRecipientBalance);

        // Logging
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
    
    // ... (Recipient Input Listener remains the same) ...

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
    // --- NEW: LIFAFA CREATION LOGIC ---
    // ------------------------------------------

    lifafaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const totalAmount = parseFloat(lifafaTotalAmountInput.value);
        const count = parseInt(lifafaCountInput.value);
        const currentBalance = getBalance(senderUsername);

        // 1. Validation
        if (isNaN(totalAmount) || totalAmount < MIN_LIFAFA_AMOUNT) {
            appendLog(`Error: Minimum Lifafa amount is ₹${MIN_LIFAFA_AMOUNT}.`, 'error');
            return;
        }
        if (isNaN(count) || count < 2) {
            appendLog('Error: Minimum claims/users is 2.', 'error');
            return;
        }
        if (currentBalance < totalAmount) {
            appendLog(`Error: Insufficient balance. Available: ₹${currentBalance.toFixed(2)}.`, 'error');
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
            totalAmount: totalAmount,
            count: count,
            perClaim: totalAmount / count,
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

    // --- INITIALIZE (Final call) ---
    getCurrentUserSession(); 
    refreshBalanceUI();
    renderLifafas();

    // Logout Button and Initial Setup
    // ... (Logout logic already set up in the beginning)
});