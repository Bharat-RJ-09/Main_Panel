document.addEventListener('DOMContentLoaded', () => {
    const serviceForm = document.getElementById('serviceForm');
    const targetInput = document.getElementById('targetInput');
    const quantityInput = document.getElementById('quantity');
    const logArea = document.getElementById('logArea');

    // Basic logout logic (reused from index.js for quick setup)
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn){
        logoutBtn.addEventListener('click', ()=>{
            localStorage.removeItem('session');
            alert("Logged out");
            window.location.href = 'login.html';
        });
    }

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : '#e0e0e0';
        logArea.prepend(p);
    }

    serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const target = targetInput.value.trim();
        const quantity = parseInt(quantityInput.value);

        if (!target || quantity < 1) {
            appendLog('Error: Invalid target or quantity.', 'error');
            return;
        }

        appendLog(`Executing Instant Panel Service: Target ${target} with Quantity ${quantity}...`, 'info');
        
        // --- THIS IS WHERE ACTUAL API CALLS WILL GO (Frontend Simulation) ---

        // Simulate a delay for the service execution
        setTimeout(() => {
            appendLog(`Success: ${quantity} units processed for target ${target}!`, 'success');
            // Reset form or update wallet balance here
        }, 2000);
    });
});