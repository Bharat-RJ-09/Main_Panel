// panel/js/make_lifafa.js - Dedicated Lifafa Creation Logic (UPDATED FOR GLOBAL TELEGRAM)

document.addEventListener('DOMContentLoaded', () => {
    
    const SETTINGS_KEY = 'nextEarnXGlobalSettings'; // Define settings key
    
    // UI Elements
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentChannelCountDisplay = document.getElementById('currentChannelCount'); // ADDED
    
    // Lifafa Form Elements (Normal Lifafa is the default for submission)
    const normalLifafaForm = document.getElementById('normalLifafaForm');
    const lifafaCountInput = document.getElementById('lifafaCount_Normal'); 
    const lifafaPerUserAmountInput = document.getElementById('lifafaPerUserAmount_Normal');
    const activeLifafasList = document.getElementById('activeLifafasList');

    // LIFAFA LIMITS
    const MIN_LIFAFA_AMOUNT = 10;
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    // CRITICAL: Global Balance and History Keys
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 
    const USER_STORAGE_KEY = 'nextEarnXUsers';

    let senderUsername = '';
    let globalSettings = {}; // ADDED Global Settings container

    // --- UTILITIES ---
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }
    
    // ADDED: Load Global Settings
    function loadGlobalSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            globalSettings = settings || {};
        } catch {
            globalSettings = {};
        }
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
    
    function loadLifafas() {
        try { return JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function saveLifafas(lifafas) {
        localStorage.setItem(LIFAFA_STORAGE_KEY, JSON.stringify(lifafas));
    }
    
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
    
    // ADDED: Update Telegram Channel Status on UI
    function updateTelegramStatusUI() {
        const channels = globalSettings.telegramChannels || [];
        const count = channels.length;
        
        if (currentChannelCountDisplay) {
            if (count > 0) {
                 currentChannelCountDisplay.textContent = `(Currently ${count} channel(s) are required globally)`;
                 currentChannelCountDisplay.style.color = '#aaffaa';
            } else {
                 currentChannelCountDisplay.textContent = `(No channels required yet. Click 'Manage Channels' to add.)`;
                 currentChannelCountDisplay.style.color = '#ffcc00';
            }
        }
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

    // --- INITIALIZE & TAB SWITCHING LOGIC ---
    getCurrentUserSession(); 
    loadGlobalSettings(); // CALL HERE
    refreshBalanceUI();
    renderLifafas();
    updateTelegramStatusUI(); // CALL HERE

    // --- ACCORDION TOGGLE LOGIC ---
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            
            if (content) {
                header.classList.toggle('active');
                
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            }
        });
    });

    // Mock Check Button Listener (Special Users)
    document.querySelector('#specialUsersContent .check-btn')?.addEventListener('click', () => {
        const users = document.getElementById('lifafaSpecialUsers_Normal').value.trim();
        if (users) {
            alert(`MOCK: Checking ${users.split(/[,*.\s\n]+/).filter(Boolean).length} numbers. Validation is pending.`);
        } else {
            alert('Enter mobile numbers first!');
        }
    });

    // Secondary Tab Switching Logic (Lifafa Types)
    document.querySelectorAll('.lifafa-tab-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.lifafaType;
            document.querySelectorAll('.lifafa-tab-secondary').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.lifafa-form-new').forEach(f => f.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(`${type.toLowerCase()}LifafaForm`).style.display = 'block';
            logArea.innerHTML = `<p>Ready to create ${type} Lifafa...</p>`;
            
            e.stopPropagation(); 
        });
    });

    // ------------------------------------------
    // --- LIFAFA CREATION LOGIC (NORMAL) ---
    // ------------------------------------------

    if (normalLifafaForm) {
        normalLifafaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const perUserAmount = parseFloat(document.getElementById('lifafaPerUserAmount_Normal').value);
            const count = parseInt(document.getElementById('lifafaCount_Normal').value);
            const title = document.getElementById('lifafaTitle_Normal').value.trim();
            const comment = document.getElementById('paymentComment_Normal').value.trim();
            const redirectLink = document.getElementById('redirectLink_Normal').value.trim();
            
            // FETCHING ADVANCED FIELDS
            const accessCode = document.getElementById('lifafaAccessCode_Normal').value.trim();
            const specialUsers = document.getElementById('lifafaSpecialUsers_Normal').value.trim();
            
            const requiredChannels = globalSettings.telegramChannels || []; // Use GLOBAL channels

            const youtubeLink = document.getElementById('lifafaYoutubeLink_Normal')?.value.trim();
            const referCount = parseInt(document.getElementById('lifafaReferCount_Normal')?.value) || 0;
            
            const totalAmount = perUserAmount * count; 
            const currentBalance = getBalance(senderUsername);

            // 1. Validation
            if (!title) { appendLog('Error: Lifafa Title is required.', 'error'); return; }
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
                type: 'Normal',
                title: title,
                comment: comment,
                redirectLink: redirectLink,
                accessCode: accessCode || null,
                specialUsers: specialUsers ? specialUsers.split(/[,*.\s\n]+/).filter(Boolean) : [],
                requirements: {
                    channels: requiredChannels, // Save the list of global required channels
                    youtube: youtubeLink || null,
                    referrals: referCount > 0 ? referCount : null,
                },
                totalAmount: totalAmount, 
                count: count,
                perClaim: perUserAmount, 
                claims: [] 
            };

            // 4. Save Lifafa & Log Transaction
            let lifafas = loadLifafas();
            lifafas.push(newLifafa);
            saveLifafas(lifafas);
            
            let senderHistory = getHistory(senderUsername);
            senderHistory.push({ date: Date.now(), type: 'debit', amount: totalAmount, txnId: 'LIFAFA_CREATED_' + uniqueId, note: `Created Normal Lifafa: ${title}` });
            saveHistory(senderUsername, senderHistory);


            // 5. Final UI Update
            refreshBalanceUI();
            renderLifafas();
            appendLog(`SUCCESS: Lifafa created! Share link with ID: ${uniqueId}`, 'success');
            
            const linkMsg = document.createElement('p');
            linkMsg.innerHTML = `<span style="color: #00e0ff; font-weight:bold;">Link:</span> ${window.location.origin}/claim.html?id=${uniqueId}`;
            logArea.prepend(linkMsg);
            
            normalLifafaForm.reset();
        });
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
});