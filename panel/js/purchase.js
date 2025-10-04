// purchase.js
document.addEventListener('DOMContentLoaded', ()=>{
    
    // panel/js/purchase.js ke DOMContentLoaded block ke andar add karein

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

// ... (Rest of your purchase.js code)

    const params = {};
    location.search.slice(1).split('&').forEach(pair=>{
        if(!pair) return;
        const [k,v] = pair.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v||'');
    });

    const planName = params.plan || 'N/A';
    const planPrice = params.price || '0';
    const redirectFeature = params.redirect || null;

    document.getElementById('planInfo').innerText = `Plan: ${planName} | Amount: ₹${planPrice}`;

    const upiID = "bharat-dass@ibl";
    const upiURL = `upi://pay?pa=${upiID}&pn=InstantPanel&am=${planPrice}&cu=INR`;

   // panel/js/purchase.js ke DOMContentLoaded block ke andar

    // UPI URL generation remains the same...

    // Ensure the QR code generator uses high-contrast colors (Black on White) for scanning reliability
    new QRCode(document.getElementById("qrcode"),{
        text: upiURL, 
        width: 200, 
        height: 200, 
        colorDark: "#000000", // Pure Black for the code blocks (best for scanning)
        colorLight: "#FFFFFF", // Pure White for the background patch (best for scanning)
        correctLevel: QRCode.CorrectLevel.H
    });

// ... (Rest of the purchase.js code)

    document.getElementById('txnConfirmBtn').addEventListener('click',()=>{
        const txnId = document.getElementById('txnId').value.trim();
        const validTxn = /^[a-zA-Z0-9]{8,}$/;
        if(!txnId){ alert("Enter Transaction ID"); return; }
        if(!validTxn.test(txnId)){ alert("Invalid Transaction ID"); return; }

        const planMap = {"1 Month":30,"3 Months":90,"6 Months":180};
        const days = planMap[planName] || 30;
        const now = Date.now();
        const expiry = now + days*24*60*60*1000;

        const subscription = {plan:planName, price:planPrice, txnId, purchaseAt:now, expiry};
        localStorage.setItem('subscription', JSON.stringify(subscription));

        alert(`🎉 Subscription Activated!\nPlan: ${planName}\nAmount: ₹${planPrice}\nTXN ID: ${txnId}\nValid till: ${new Date(expiry).toLocaleString()}`);

        if(redirectFeature) window.location.href = `index.html?open=${encodeURIComponent(redirectFeature)}`;
        else window.location.href = 'index.html';
    });

    // Inside purchase.js, replace the entire document.getElementById('txnConfirmBtn').addEventListener block

    document.getElementById('txnConfirmBtn').addEventListener('click',()=>{
        const txnId = document.getElementById('txnId').value.trim();
        const validTxn = /^[a-zA-Z0-9]{8,}$/;
        if(!txnId){ alert("Enter Transaction ID"); return; }
        if(!validTxn.test(txnId)){ alert("Invalid Transaction ID"); return; }

        // --- CORE LOGIC: Handle Deposit vs. Subscription ---
        
        if (planName === 'Deposit') {
            // Logic for Wallet Deposit
            let balance = parseFloat(localStorage.getItem('nextEarnXBalance') || '0.00');
            balance += parseFloat(planPrice);
            localStorage.setItem('nextEarnXBalance', balance.toFixed(2));

            let history = JSON.parse(localStorage.getItem('nextEarnXHistory') || '[]');
            history.push({
                date: Date.now(),
                type: 'credit',
                amount: parseFloat(planPrice),
                txnId: txnId,
                note: 'Wallet Deposit via UPI'
            });
            localStorage.setItem('nextEarnXHistory', JSON.stringify(history));

            alert(`✅ Deposit Successful!\nAmount: ₹${planPrice}\nNew Balance: ₹${balance.toFixed(2)}`);
            window.location.href = 'wallet.html'; // Redirect back to wallet
            return;
        }

        // Logic for Subscription (Original Code)
        const planMap = {"1 Month":30,"3 Months":90,"6 Months":180};
        const days = planMap[planName] || 30;
        const now = Date.now();
        const expiry = now + days*24*60*60*1000;

        const subscription = {plan:planName, price:planPrice, txnId, purchaseAt:now, expiry};
        localStorage.setItem('subscription', JSON.stringify(subscription));

        alert(`🎉 Subscription Activated!\nPlan: ${planName}\nAmount: ₹${planPrice}\nTXN ID: ${txnId}\nValid till: ${new Date(expiry).toLocaleString()}`);

        if(redirectFeature) window.location.href = `index.html?open=${encodeURIComponent(redirectFeature)}`;
        else window.location.href = 'index.html';
    });
});
