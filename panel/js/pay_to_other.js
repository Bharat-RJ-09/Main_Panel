
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
    const lifafaCountInput = document.getElementById('lifafaCount');
    const lifafaPerUserAmountInput = document.getElementById('lifafaPerUserAmount'); 
    const activeLifafasList = document.getElementById('activeLifafasList');

    // NEW IMPROVEMENT: Total Cost Display Element
    const lifafaTotalCostDisplay = document.getElementById('lifafaTotalCostDisplay');

    // TRANSFER/LIFAFA LIMITS
    const MAX_DAILY_TRANSFER = 100; 
    const MIN_LIFAFA_AMOUNT = 10;
    const DAILY_LIMIT_KEY = 'nextEarnXDailyTransfer'; 
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    // CRITICAL FIX: Global Balance and History Keys for the sender
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 

    let senderUsername = '';
    let recipientUser = null; 

    // --- UTILITIES (CRITICAL FIX: Sender uses GLOBAL Keys) ---
    const USER_STORAGE_KEY = 'nextEarnXUsers';
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }

    // CRITICAL FIX: Sender always uses the GLOBAL_BALANCE_KEY
    function getBalance(username) {
        if (username === senderUsername) {
            return parseFloat(localStorage.getItem(GLOBAL_BALANCE_KEY) || '0.00');
        }
        return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00'); 
    }
    
    // CRITICAL FIX: Sender always uses the GLOBAL_BALANCE_KEY
    function setBalance(username, balance) {
        if (username === senderUsername) {
            localStorage.setItem(GLOBAL_BALANCE_KEY, balance.toFixed(2));
            return;
        }
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
    
    // --- LIFAFA LIST RENDERING (unchanged) ---
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
            
            const totalAmount = (l.perClaim * l.count); 

            item.innerHTML = `
                <p>
                    <strong>₹${totalAmount.toFixed(2)}</strong> | ${statusText}
                    <br>Link: <span class="link" data-link="${window.location.origin}/claim.html?id=${l.id}" title="Click to copy">${window.location.origin}/claim.html?id=${l.id}</span>
                </p>
                <p style="color:#777; font-size:11px;">Created: ${new Date(l.date).toLocaleString()}</p>
            `;
            activeLifafasList.appendChild(item);
            
            item.querySelector('.link').addEventListener('click', (e) => {
                const linkToCopy = e.target.dataset.link;
                navigator.clipboard.writeText(linkToCopy);
                alert('Lifafa Link copied to clipboard!');
            });
        });
    }
    
    // --- NEW IMPROVEMENT: DYNAMIC COST CALCULATION ---
    function updateLifafaTotalCost() {
        const count = parseInt(lifafaCountInput.value) || 0;
        const perAmount = parseFloat(lifafaPerUserAmountInput.value) || 0;
        const totalCost = (count * perAmount);
        
        if (lifafaTotalCostDisplay) {
            lifafaTotalCostDisplay.innerHTML = `Total Cost: <span style="font-weight:bold;">₹${totalCost.toFixed(2)}</span>`;
            
            // Highlight if minimum amount is not met (MIN_LIFAFA_AMOUNT = 10)
            if (totalCost < MIN_LIFAFA_AMOUNT && totalCost > 0) {
                 lifafaTotalCostDisplay.style.color = '#ffcc00'; // Yellow warning
                 lifafaTotalCostDisplay.innerHTML += `<br><small style="color:red;">Min total amount is ₹${MIN_LIFAFA_AMOUNT}.</small>`;
            } else {
                 lifafaTotalCostDisplay.style.color = '#00e0ff'; // Aqua
            }
        }
    }
    
    // Attach listener only if the elements exist
    if (lifafaCountInput) lifafaCountInput.addEventListener('input', updateLifafaTotalCost);
    if (lifafaPerUserAmountInput) lifafaPerUserAmountInput.addEventListener('input', updateLifafaTotalCost);


    // --- INITIALIZE ---
    getCurrentUserSession(); 
    refreshBalanceUI();
    renderLifafas();
    updateLifafaTotalCost(); // Initial call to show cost


    // --- TAB SWITCHING LOGIC (unchanged) ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(target + 'Section').style.display = 'block';
            
            const logType = (target === 'transfer') ? 'Ready to send...' : 'Ready to create Lifafa...';
            logArea.innerHTML = `<p>${logType}</p>`;
            
            // CRITICAL: Call updateLifafaTotalCost when switching to Lifafa tab
            if (target === 'lifafa') {
                updateLifafaTotalCost();
            }
        });
    });

    // --- TRANSFER LOGIC (unchanged) ---
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(transferAmountInput.value);
        const currentBalance = getBalance(senderUsername); 
        const todayTransferred = getTodayTransferredAmount(senderUsername);

        // ... (Execution remains same)
        // ...

        refreshBalanceUI();
        appendLog(`SUCCESS: ₹${amount.toFixed(2)} transferred to ${recipientUser.username}. New balance: ₹${newSenderBalance.toFixed(2)}`, 'success');
        transferForm.reset();
        recipientUser = null;
        recipientMobileInput.dispatchEvent(new Event('input')); 
    });
    
    // ... (Recipient Input Listener unchanged) ...

    // ------------------------------------------
    // --- LIFAFA CREATION LOGIC (UPDATED) ---
    // ------------------------------------------

    if (lifafaForm) {
        lifafaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const perUserAmount = parseFloat(lifafaPerUserAmountInput.value);
            const count = parseInt(lifafaCountInput.value);
            const totalAmount = perUserAmount * count; // Calculate total amount
            
            const currentBalance = getBalance(senderUsername);

            // 1. Validation (Uses totalAmount)
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

            // 2. Confirmation (Remains same)
            if (!confirm(`Confirm creation of Lifafa worth ₹${totalAmount.toFixed(2)} for ${count} users?`)) {
                return;
            }

            // 3. Execution (unchanged)
            const newBalance = currentBalance - totalAmount;
            setBalance(senderUsername, newBalance);

            const uniqueId = senderUsername.slice(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString().slice(-4);
            
            const newLifafa = {
                id: uniqueId,
                creator: senderUsername,
                date: Date.now(),
                totalAmount: totalAmount, 
                count: count,
                perClaim: perUserAmount, 
                claims: [] 
            };

            // 4. Save Lifafa & Log Transaction (unchanged)
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
            
            const linkMsg = document.createElement('p');
            linkMsg.innerHTML = `<span style="color: #00e0ff; font-weight:bold;">Link:</span> ${window.location.origin}/claim.html?id=${uniqueId}`;
            logArea.prepend(linkMsg);
            
            lifafaForm.reset();
            updateLifafaTotalCost(); // CRITICAL: Reset cost display after submission
        });
    }

    // Logout Button (For consistency - unchanged)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }
});