// panel/js/instant_panel.js - CORE SERVICE LOGIC with Dynamic Pricing

document.addEventListener('DOMContentLoaded', () => {
    const serviceForm = document.getElementById('serviceForm');
    const targetInput = document.getElementById('targetInput');
    const quantityInput = document.getElementById('quantity');
    const logArea = document.getElementById('logArea');
    const balanceDisplay = document.getElementById('balanceDisplay'); 
    const statusMsg = document.querySelector('.status-msg');

    // --- GLOBAL SETTINGS UTILITY ---
    const DEFAULT_SERVICE_PRICE = 5.00; // Fallback price
    const DEFAULTS = { instantPanelPrice: DEFAULT_SERVICE_PRICE };
    
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('nextEarnXGlobalSettings'));
            return settings ? { ...DEFAULTS, ...settings } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    }
    const settings = loadSettings();
    const PRICE_PER_UNIT = settings.instantPanelPrice || DEFAULT_SERVICE_PRICE;
    
    // --- UTILITIES (getBalance, saveBalance, etc. remain the same) ---
    
    function getBalance() {
        try { return parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00'); }
        catch { return 0.00; }
    }
    
    function saveBalance(balance) {
        localStorage.setItem('nextEarnXBalance', balance.toFixed(2));
    }

    function getHistory() {
        try { return JSON.parse(localStorage.getItem('nextEarnXHistory') || '[]'); }
        catch { return []; }
    }

    function saveHistory(history) {
        localStorage.setItem('nextEarnXHistory', JSON.stringify(history));
    }
    
    function updateBalanceUI() {
        if (balanceDisplay) {
            balanceDisplay.textContent = `₹${getBalance().toFixed(2)}`;
        }
    }

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : type === 'loading' ? '#00e0ff' : '#e0e0e0';
        logArea.prepend(p);
    }
    
    // --- INITIALIZE ---
    updateBalanceUI();

    // Logout Button (For consistency)
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn){
        logoutBtn.addEventListener('click', ()=>{
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }


    // --- SERVICE EXECUTION LOGIC ---

    serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const target = targetInput.value.trim();
        const quantity = parseInt(quantityInput.value);
        const unitPrice = PRICE_PER_UNIT; // Use dynamic price
        const totalCost = quantity * unitPrice;

        if (!target || quantity < 1 || isNaN(quantity)) { 
            appendLog('Error: Invalid target or quantity.', 'error'); 
            return; 
        }

        const currentBalance = getBalance();

        if (currentBalance < totalCost) {
            appendLog(`Error: Insufficient balance. Cost: ₹${totalCost.toFixed(2)}, Available: ₹${currentBalance.toFixed(2)}.`, 'error');
            alert('Insufficient Balance. Please add funds to your wallet.');
            return;
        }

        // Deduct balance and update UI
        const newBalance = currentBalance - totalCost;
        saveBalance(newBalance);
        updateBalanceUI(); 

        // Record transaction (DEBIT)
        let history = getHistory();
        history.push({
            date: Date.now(),
            type: 'debit',
            amount: totalCost,
            txnId: 'SERVICE_TXN_' + Date.now(),
            note: `Instant Panel Service: ${quantity} units for ${target}`
        });
        saveHistory(history);


        appendLog(`Processing ${quantity} units for ${target}. Cost: ₹${totalCost.toFixed(2)}.`, 'loading');
        
        // Simulate service delay
        setTimeout(() => {
            appendLog(`Success: Order placed! TXN Cost: ₹${totalCost.toFixed(2)}`, 'success');
            appendLog(`New Balance: ₹${newBalance.toFixed(2)}`, 'success');

            targetInput.value = ''; // Clear form
            quantityInput.value = '10'; // Reset quantity
            
            quantityInput.dispatchEvent(new Event('input')); // Update cost display
            
        }, 3000); // 3 second delay
    });

    // --- DISPLAY COST ON QUANTITY CHANGE (Better UX) ---
    quantityInput.addEventListener('input', () => {
        const quantity = parseInt(quantityInput.value) || 0;
        const totalCost = quantity * PRICE_PER_UNIT; // Use dynamic price
        
        if(statusMsg) {
             statusMsg.innerHTML = `Cost: <span style="color: #ff0077;">₹${PRICE_PER_UNIT.toFixed(2)}</span> per unit | Total Est: <span style="color: #00e0ff;">₹${totalCost.toFixed(2)}</span>`;
        }
    });

    // Trigger initial cost display
    quantityInput.dispatchEvent(new Event('input'));
});