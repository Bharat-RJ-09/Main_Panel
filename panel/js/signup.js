// js/signup.js - FINALIZED WITH MOBILE OTP VERIFICATION

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const usernameInput = document.getElementById("username");
  const usernameMsg = document.getElementById("usernameMsg");
  const mobileInput = document.getElementById("mobile");
  
  // New OTP Elements
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpVerificationSection = document.getElementById("otpVerificationSection");
  const otpInput = document.getElementById("otpInput");
  const otpTimer = document.getElementById("otpTimer");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpStatusMessage = document.getElementById("otpStatusMessage");
  const signupFinalBtn = document.getElementById("signupFinalBtn");

  const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;
  const mobileRegex = /^\d{10}$/;

  // OTP State
  let generatedOtp = null;
  let otpExpires = null;
  let otpTimerInterval = null;
  let isOtpVerified = false;

  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem("nextEarnXUsers") || "[]"); } // Updated key
    catch { return []; }
  };
  const saveUsers = (users) => localStorage.setItem("nextEarnXUsers", JSON.stringify(users));

  // --- OTP TIMER AND SEND LOGIC ---
  function startOtpTimer() {
    clearInterval(otpTimerInterval);
    otpExpires = Date.now() + 60 * 1000; // 60 seconds validity
    resendOtpBtn.disabled = true;
    
    otpTimerInterval = setInterval(() => {
      const diff = Math.max(0, otpExpires - Date.now());
      const sec = Math.ceil(diff / 1000);
      const ss = String(sec % 60).padStart(2, "0");
      otpTimer.textContent = `00:${ss}`;
      
      if (diff <= 0) {
        clearInterval(otpTimerInterval);
        otpStatusMessage.textContent = "OTP expired. Resend or try again.";
        otpStatusMessage.style.color = "red";
        resendOtpBtn.disabled = false;
        generatedOtp = null; // Invalidate OTP
      }
    }, 500);
  }

  function generateAndSendOtp() {
    generatedOtp = Math.floor(100000 + Math.random() * 900000);
    console.log("DEV SIGNUP OTP (for testing):", generatedOtp); // DEV-ONLY
    
    otpVerificationSection.style.display = 'block';
    sendOtpBtn.style.display = 'none';
    otpStatusMessage.textContent = `OTP sent to ${mobileInput.value} (Check console).`;
    otpStatusMessage.style.color = "yellow";
    
    startOtpTimer();
  }
  
  sendOtpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const mobile = mobileInput.value.trim();
      
      if (!mobileRegex.test(mobile)) {
          alert("Please enter a valid 10-digit mobile number.");
          return;
      }
      
      // Check if user with this mobile already exists (Optional but good practice)
      const users = loadUsers();
      if (users.some(u => u.mobile === mobile)) {
          alert("This mobile number is already registered.");
          return;
      }
      
      generateAndSendOtp();
  });

  resendOtpBtn.addEventListener('click', generateAndSendOtp);

  // --- OTP VERIFICATION LOGIC ---
  verifyOtpBtn.addEventListener('click', () => {
      const entered = otpInput.value.trim();
      
      if (!generatedOtp) {
          alert("Please request a new OTP.");
          return;
      }
      
      if (Date.now() > otpExpires) {
          alert("OTP expired. Please request a new OTP.");
          return;
      }
      
      if (Number(entered) === generatedOtp) {
          // Success: Mark verification, disable controls, enable final button
          isOtpVerified = true;
          clearInterval(otpTimerInterval);
          
          otpStatusMessage.textContent = "✅ Mobile number verified!";
          otpStatusMessage.style.color = "limegreen";
          
          otpInput.disabled = true;
          verifyOtpBtn.disabled = true;
          signupFinalBtn.disabled = false; // ENABLE FINAL SIGNUP BUTTON
          
          alert("Mobile verified. You can now complete your registration.");
      } else {
          otpStatusMessage.textContent = "❌ Invalid OTP. Try again.";
          otpStatusMessage.style.color = "red";
      }
  });


  // --- INPUT VALIDATION AND FORM SUBMISSION ---
  usernameInput.addEventListener("input", () => {
    // ... (Existing username validation logic remains the same) ...
    const value = usernameInput.value.trim();
    if (!usernameRegex.test(value)) {
      usernameMsg.textContent = "❌ Username 1-15 chars, only letters, numbers, _ allowed";
      usernameMsg.style.color = "red";
      return;
    }
    const users = loadUsers();
    if (users.some(u => u.username.toLowerCase() === value.toLowerCase())) {
      usernameMsg.textContent = "❌ Username already taken";
      usernameMsg.style.color = "red";
    } else {
      usernameMsg.textContent = "✅ Username available";
      usernameMsg.style.color = "limegreen";
    }
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (!isOtpVerified) {
        alert("CRITICAL: Please verify your mobile number first!");
        return;
    }

    const fullname = document.getElementById("fullname").value.trim();
    const username = usernameInput.value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = mobileInput.value.trim();
    const password = document.getElementById("password").value;

    if (!fullname || !username || !email || !mobile || !password) {
      alert("Please fill all fields!");
      return;
    }
    // Final validations (check that mobile and username passed all previous checks)
    if (!usernameRegex.test(username)) { alert("Invalid username. Follow rules."); return; }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) { alert("Please use a valid Gmail address."); return; }
    if (!mobileRegex.test(mobile)) { alert("Mobile must be 10 digits."); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters."); return; }

    const users = loadUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) { alert("Username already taken."); return; }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { alert("Email already registered."); return; }

    // Save user
    users.push({ fullname, username, email, mobile, password });
    saveUsers(users);

    alert("Account created successfully! Please login.");
    window.location.href = "login.html"; // go to login
  });
});