// panel/js/affiliate.js - Affiliate Panel Logic

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const totalEarningsDisplay = document.getElementById('totalEarnings');
    const referralCountDisplay = document.getElementById('referralCount');
    const referralLinkInput = document.getElementById('referralLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const withdrawalForm = document.getElementById('withdrawalForm');
    const withdrawAmountInput = document.getElementById('withdrawAmount');
    const upiAddressInput = document.getElementById('upiAddress');
    const logoutBtn = document.getElementById('logoutBtn');

    // MOCK DATA KEYS
    const EARNINGS_KEY = 'nextEarnXAffiliateEarnings';
    const REFERRAL_KEY = 'nextEarnXReferralCount';
    
    let currentUsername = '';

    // --- UTILITIES ---
    function getCurrentUsername() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            currentUsername = user ? user.username : '';
            return currentUsername;
        } catch { return ''; }
    }
    getCurrentUsername(); // Initialize username
    
    function loadEarnings() {
        return parseFloat(localStorage.getItem(EARNINGS_KEY) || '0.00');
    }
    
    function saveEarnings(amount) {
        localStorage.setItem(EARNINGS_KEY, amount.toFixed(2));
    }

    function loadReferralCount() {
        // Mock count based on a simple integer
        return parseInt(localStorage.getItem(REFERRAL_KEY) || '0'); 
    }
    
    function updateUI() {
        const earnings = loadEarnings();
        const count = loadReferralCount();
        
        totalEarningsDisplay.textContent = `₹ ${earnings.toFixed(2)}`;
        referralCountDisplay.textContent = `${count} users referred.`;

        // Generate mock referral link (User Panel URL + username)
        const referralLink = `${window.location.origin}/panel/signup.html?ref=${currentUsername}`;
        referralLinkInput.value = referralLink;
    }

    // --- EVENT HANDLERS ---
    
    // Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }

    // Copy Link
    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(referralLinkInput.value);
        alert('Referral Link copied to clipboard!');
    });

    // Withdrawal Form Submission (MOCK LOGIC)
    withdrawalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(withdrawAmountInput.value);
        const upiAddress = upiAddressInput.value.trim();
        const earnings = loadEarnings();
        const MIN_WITHDRAW = 50;

        // Validation
        if (isNaN(amount) || amount < MIN_WITHDRAW) {
            alert(`Minimum withdrawal amount is ₹${MIN_WITHDRAW}.`);
            return;
        }
        if (earnings < amount) {
            alert(`Insufficient earnings. Available: ₹${earnings.toFixed(2)}.`);
            return;
        }
        if (!upiAddress) {
            alert('Please enter a valid UPI address.');
            return;
        }

        if (confirm(`Confirm withdrawal of ₹${amount.toFixed(2)} to UPI: ${upiAddress}?`)) {
            
            // MOCK: Simulate bank processing delay
            const newEarnings = earnings - amount;
            saveEarnings(newEarnings);

            // Mock: Add a pending transaction to history (Not fully implemented here, just alert)
            
            alert(`✅ Withdrawal Request Submitted!\n₹${amount.toFixed(2)} will be processed to ${upiAddress} within 24 hours. Your remaining commission: ₹${newEarnings.toFixed(2)}.`);
            
            withdrawalForm.reset();
            updateUI(); // Refresh UI immediately
        }
    });

    // --- INITIALIZE ---
    updateUI(); 
});