// panel/js/subscription.js

document.addEventListener('DOMContentLoaded', ()=>{
    const urlParams = new URLSearchParams(location.search);
    const redirectFeature = urlParams.get('redirect') || null;

    // Utility function to get current wallet balance
    function getBalance() {
        try {
            return parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00');
        } catch(e) { return 0.00; }
    }

    // Utility function to handle subscription activation
    function activateSubscription(planName, planPrice, txnId = 'WALLET_PAY') {
        const planMap = {"1 Month":30,"3 Months":90,"6 Months":180, "1 Week Free Trial": 7};
        const days = planMap[planName] || 30; // 30 days default if not found
        const now = Date.now();
        const expiry = now + days * 24 * 60 * 60 * 1000;
        
        const subscription = {
            plan: planName, 
            price: planPrice, 
            txnId: txnId, 
            purchaseAt: now, 
            expiry: expiry
        };
        localStorage.setItem('subscription', JSON.stringify(subscription));

        // Add transaction to history only for paid plans
        if (planPrice > 0) {
            let history = JSON.parse(localStorage.getItem('nextEarnXHistory') || '[]');
            history.push({
                date: now,
                type: 'debit',
                amount: parseFloat(planPrice),
                txnId: txnId,
                note: `Subscription: ${planName}`
            });
            localStorage.setItem('nextEarnXHistory', JSON.stringify(history));
        }
        
        // Success alert and redirect
        alert(`🎉 Subscription Activated!\nPlan: ${planName}\nValid till: ${new Date(expiry).toLocaleString()}`);
        if(redirectFeature) window.location.href = `index.html?open=${encodeURIComponent(redirectFeature)}`;
        else window.location.href = 'index.html';
    }


    // --- HANDLE PLAN SELECTION AND REDIRECT ---
    const selectButtons = document.querySelectorAll('.select-btn');

    selectButtons.forEach(button=>{
        button.addEventListener('click', (e)=>{
            e.preventDefault(); 
            
            const card = button.closest('.plan-card');
            const planName = card.dataset.plan;
            const priceString = card.dataset.price;
            const planPrice = parseFloat(priceString);
            
            if(isNaN(planPrice)){
                alert("Error: Invalid plan price.");
                return;
            }

            // Highlighting the selected card for visual feedback
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');


            // 1. FREE PLAN LOGIC (Price == 0)
            if (planPrice === 0) {
                activateSubscription(planName, planPrice, 'FREE_TRIAL');
                return;
            }
            
            // 2. PAID PLAN LOGIC (Price > 0)
            const currentBalance = getBalance();

            if (currentBalance >= planPrice) {
                // ENOUGH BALANCE: Deduct from wallet and activate
                if (confirm(`Confirm purchase of ${planName} for ₹${planPrice}? Your current wallet balance is ₹${currentBalance.toFixed(2)}.`)) {
                    
                    const newBalance = currentBalance - planPrice;
                    localStorage.setItem('nextEarnXBalance', newBalance.toFixed(2));
                    
                    activateSubscription(planName, planPrice, 'WALLET_PAY_' + Date.now()); // Unique TXN ID
                }
            } else {
                // INSUFFICIENT BALANCE: Redirect to Wallet page to deposit funds
                alert(`Insufficient Balance: ₹${currentBalance.toFixed(2)}. Please add funds to your wallet to complete the purchase of the ${planName} plan (₹${planPrice}).`);
                
                // --- MODIFIED: Redirect to wallet.html with context ---
                let url = `wallet.html?deposit_for=${encodeURIComponent(planName)}&amount=${planPrice}`;

                window.location.href = url;
            }
        });
    });
    
    // --- REST OF THE LOGIC ---
    
    // Optional: Visual highlight on card click
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Handle Redirect Message (UX)
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage && redirectFeature) {
        statusMessage.textContent = `Subscription required to access: ${decodeURIComponent(redirectFeature)}`;
        statusMessage.style.color = '#00e0ff'; 
    }
    
    // Logout Button Fix (For consistency)
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }
});