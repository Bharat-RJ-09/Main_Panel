// panel/js/purchase.js - Updated for Global Settings

document.addEventListener('DOMContentLoaded', ()=>{
    const params = {};
    location.search.slice(1).split('&').forEach(pair=>{
        if(!pair) return;
        const [k,v] = pair.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v||'');
    });

    const planName = params.plan || 'N/A';
    const planPrice = params.price || '0';
    const redirectFeature = params.redirect || null;
    
    // --- GLOBAL SETTINGS UTILITY ---
    const DEFAULTS = {
        upiId: "bharat-dass@ibl",
        prices: {"1 Month": 59,"3 Months": 109,"6 Months": 159}
    };
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('nextEarnXGlobalSettings'));
            return settings ? { ...DEFAULTS, ...settings } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    }
    const settings = loadSettings();
    
    // --- LOGOUT HANDLER (For consistency) ---
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    document.getElementById('planInfo').innerText = `Plan: ${planName} | Amount: ₹${planPrice}`;

    // --- DYNAMIC UPI ID ---
    const upiID = settings.upiId;
    const upiURL = `upi://pay?pa=${upiID}&pn=NextEarnX&am=${planPrice}&cu=INR`;

    new QRCode(document.getElementById("qrcode"),{
        text: upiURL, width:200, height:200, colorDark:"#000000", colorLight:"#FFFFFF", correctLevel:QRCode.CorrectLevel.H
    });

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
            window.location.href = 'wallet.html';
            return;
        }

        // Logic for Subscription 
        const planMap = {"1 Month":30,"3 Months":90,"6 Months":180, "1 Week Free Trial": 7};
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