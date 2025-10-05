// panel/js/pay_to_other.js - Wallet Transfer & Lifafa Logic (Finalized with Clean Form)

document.addEventListener('DOMContentLoaded', () => {
    // --- BASIC ELEMENTS ---
    const transferForm = document.getElementById('transferForm');
    const recipientMobileInput = document.getElementById('recipientMobile');
    const transferAmountInput = document.getElementById('transferAmount');
    const recipientUsernameMsg = document.getElementById('recipientUsernameMsg');
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // --- NEW LIFAFA ELEMENTS (Updated IDs/Fields) ---
    const lifafaForm = document.getElementById('lifafaForm');
    const lifafaTitleInput = document.getElementById('lifafaTitle'); 
    const lifafaCountInput = document.getElementById('lifafaCount');
    const lifafaPerUserAmountInput = document.getElementById('lifafaPerUserAmount'); 
    const paymentCommentInput = document.getElementById('paymentComment'); 
    const redirectLinkInput = document.getElementById('redirectLink'); 
    const activeLifafasList = document.getElementById('activeLifafasList');

    // --- SLIDER ELEMENTS (UI only, no functional JS needed yet) ---
    const percentageSlider = document.getElementById('percentageSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');

    // --- TAB/ACCORDION ELEMENTS ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const transferSection = document.getElementById('transferSection');
    const lifafaSection = document.getElementById('lifafaSection');

    // --- CONSTANTS ---
    const MAX_DAILY_TRANSFER = 100; 
    const MIN_LIFAFA_AMOUNT = 10; // Total minimum, based on totalAmount
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    let senderUsername = '';
    let recipientUser = null; 

    // --- UTILITIES (CRUD Core) ---
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
        try { return JSON.parse(localStorage.getItem('nextEarnXUsers') || "[]"); }
        catch { return []; }
    }
    function loadLifafas() {
        try { return JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    function saveLifafas(lifafas) {
        localStorage.setItem(LIFAFA_STORAGE_KEY, JSON.stringify(lifafas));
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
            const claimsLeft = l.count - claimedCount;
            const statusText = (claimsLeft <= 0) ? `<span class="claimed">CLOSED</span>` : `${claimedCount}/${l.count} Claimed`;
            
            item.innerHTML = `
                <p>
                    <strong>${l.title || 'Untitled Lifafa'}</strong> | ${statusText}
                    <br>Link: <span class="link" data-link="${window.location.origin}/claim.html?id=${l.id}" title="Click to copy">${l.id}</span>
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

    // --- INITIALIZE & UI SYNC ---
    function refreshBalanceUI() {
        const currentBalance = getBalance(senderUsername); 
        currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
    }
    getCurrentUserSession(); 
    refreshBalanceUI(); 
    renderLifafas();

    // Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }


    // --- TAB SWITCHING LOGIC ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(target + 'Section').style.display = 'block';
            
            const logType = (target === 'transfer') ? 'Ready to send...' : 'Ready to create Lifafa...';
            logArea.innerHTML = `<p>${logType}</p>`;
        });
    });

    // --- TRANSFER LOGIC (Remains the same) ---
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(transferAmountInput.value);
        const currentBalance = getBalance(senderUsername);
        const todayTransferred = getTodayTransferredAmount(senderUsername);
        
        // Validation Checks
        if (!recipientUser) { appendLog('Error: Please enter a valid, registered mobile number.', 'error'); return; }
        if (isNaN(amount) || amount < 1) { appendLog('Error: Transfer amount must be at least ₹1.', 'error'); return; }
        if (amount > MAX_DAILY_TRANSFER) { appendLog(`Error: Transfer amount exceeds the ₹${MAX_DAILY_TRANSFER} limit.`, 'error'); return; }
        if (currentBalance < amount) { appendLog(`Error: Insufficient funds. Available: ₹${currentBalance.toFixed(2)}.`, 'error'); return; }
        
        const totalAfterTransfer = todayTransferred + amount;
        if (totalAfterTransfer > MAX_DAILY_TRANSFER) { appendLog(`Error: Daily transfer limit exceeded. Remaining limit: ₹${(MAX_DAILY_TRANSFER - todayTransferred).toFixed(2)}`, 'error'); return; }

        if (!confirm(`Confirm transfer of ₹${amount.toFixed(2)} to ${recipientUser.username}?`)) return;
        
        // Execution
        const newSenderBalance = currentBalance - amount;
        setBalance(senderUsername, newSenderBalance);
        
        const newRecipientBalance = getBalance(recipientUser.username) + amount;
        setBalance(recipientUser.username, newRecipientBalance);
        
        // Logging & Final Update
        appendLog(`SUCCESS: ₹${amount.toFixed(2)} transferred to ${recipientUser.username}.`, 'success');
        refreshBalanceUI();
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
    // --- LIFAFA CREATION LOGIC (Using new fields) ---
    // ------------------------------------------

    lifafaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const totalUsers = parseInt(lifafaCountInput.value);
        const perUserAmount = parseFloat(lifafaPerUserAmountInput.value);
        
        const totalAmount = totalUsers * perUserAmount; // CRITICAL: Total amount calculation
        const currentBalance = getBalance(senderUsername);

        // 1. Validation
        if (isNaN(totalUsers) || totalUsers < 2) { appendLog('Error: Total Users must be at least 2.', 'error'); return; }
        if (isNaN(perUserAmount) || perUserAmount <= 0.01) { appendLog('Error: Per User Amount must be greater than ₹0.01.', 'error'); return; }
        if (totalAmount < MIN_LIFAFA_AMOUNT) { appendLog(`Error: Total Lifafa amount must be at least ₹${MIN_LIFAFA_AMOUNT}.`, 'error'); return; }
        if (currentBalance < totalAmount) { appendLog(`Error: Insufficient balance. Available: ₹${currentBalance.toFixed(2)}.`, 'error'); return; }
        
        // 2. Confirmation
        if (!confirm(`Confirm creation of Lifafa worth TOTAL ₹${totalAmount.toFixed(2)} for ${totalUsers} users?`)) return;

        // 3. Execution: Deduct and Create Lifafa Object
        const newBalance = currentBalance - totalAmount;
        setBalance(senderUsername, newBalance);

        // Generate ID
        const uniqueId = 'LX' + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString().slice(-4);
        
        const newLifafa = {
            id: uniqueId,
            creator: senderUsername,
            date: Date.now(),
            title: lifafaTitleInput.value.trim() || 'Untitled Giveaway',
            comment: paymentCommentInput.value.trim(),
            redirect: redirectLinkInput.value.trim(),
            accessCode: null, // Removed access code logic for simplicity
            totalAmount: totalAmount,
            count: totalUsers,
            perClaim: perUserAmount,
            claims: [] 
        };

        // 4. Save Lifafa & Log Transaction
        let lifafas = loadLifafas();
        lifafas.push(newLifafa);
        saveLifafas(lifafas);
        
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({ date: Date.now(), type: 'debit', amount: totalAmount, txnId: 'LIFAFA_CREATED_' + uniqueId, note: `Created Lifafa: ${newLifafa.title}` });
        saveHistory(senderUsername, senderHistory);


        // 5. Final UI Update
        refreshBalanceUI();
        renderLifafas();
        appendLog(`SUCCESS: Lifafa "${newLifafa.title}" created! ID: ${uniqueId}`, 'success');
        
        lifafaForm.reset();
        
        // Display the claim link in the log
        const linkMsg = document.createElement('p');
        linkMsg.innerHTML = `<span style="color: #00e0ff; font-weight:bold;">Link:</span> ${window.location.origin}/claim.html?id=${uniqueId}`;
        logArea.prepend(linkMsg);
    });
});