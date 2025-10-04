// panel/js/subscription.js

document.addEventListener('DOMContentLoaded', ()=>{
    const urlParams = new URLSearchParams(location.search);
    const redirectFeature = urlParams.get('redirect') || null;

    // --- 1. HANDLE PLAN SELECTION AND REDIRECT ---
    const selectButtons = document.querySelectorAll('.select-btn');

    selectButtons.forEach(button=>{
        button.addEventListener('click', (e)=>{
            e.preventDefault(); 
            
            // Get data directly from the parent plan card (the easiest way to get the data-attributes)
            const card = button.closest('.plan-card');
            const planName = card.dataset.plan;
            const planPrice = card.dataset.price;
            
            if(!planName || !planPrice){
                alert("Error: Could not retrieve plan details.");
                return;
            }

            // Highlighting the selected card for visual feedback
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            // Redirect to purchase.html with parameters
            let url = `purchase.html?plan=${encodeURIComponent(planName)}&price=${encodeURIComponent(planPrice)}`;
            if(redirectFeature) url += `&redirect=${encodeURIComponent(redirectFeature)}`;
            
            // Final redirection
            window.location.href = url;
        });
    });
    
    // --- 2. OPTIONAL: VISUAL HIGHLIGHT ON CARD CLICK ---
    // This allows the user to click the whole card, not just the button, to highlight it.
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // --- 3. HANDLE REDIRECT MESSAGE (UX) ---
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage && redirectFeature) {
        // Show message like "Subscription required to access: Instant Panel"
        statusMessage.textContent = `Subscription required to access: ${decodeURIComponent(redirectFeature)}`;
        statusMessage.style.color = '#00e0ff'; 
    }
    
    // --- 4. LOGOUT BUTTON FIX (FOR CONSISTENCY) ---
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