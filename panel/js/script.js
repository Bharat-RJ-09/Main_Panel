// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const userLoginInput = document.getElementById("userLogin");

  // Password Toggle Logic (Remains same)
  const togglePasswordBtn = document.getElementById("togglePassword");

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const currentType = passwordInput.getAttribute("type");
      if (currentType === "password") {
        passwordInput.setAttribute("type", "text");
        togglePasswordBtn.textContent = "🔒"; // Changed from 👁 to 🔒 for toggled state
      } else {
        passwordInput.setAttribute("type", "password");
        togglePasswordBtn.textContent = "👁"; // Changed from 🔒 to 👁 for default state
      }
    });
  }

  // OTP modal elements
  const otpModal = document.getElementById("otpModal");
  const otpInput = document.getElementById("otpInput");
  const otpMessage = document.getElementById("otpMessage");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const showOtpDev = document.getElementById("showOtpDev");
  const otpTimer = document.getElementById("otpTimer");
  const closeOtpBtn = document.getElementById("closeOtpBtn");

  let generatedOtp = null;
  let otpExpires = null;
  let otpTimerInterval = null;
  let currentUser = null;

  // CRITICAL FIX: Use the correct user list key: nextEarnXUsers
  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem("nextEarnXUsers") || "[]"); }
    catch { return []; }
  };

  function findUserByLogin(login) {
    const users = loadUsers();
    if (login.includes("@")) {
      return users.find(u => u.email.toLowerCase() === login.toLowerCase());
    } else {
      return users.find(u => u.username.toLowerCase() === login.toLowerCase());
    }
  }

  function startOtpTimer() {
    clearInterval(otpTimerInterval);
    otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpTimerInterval = setInterval(() => {
      const diff = Math.max(0, otpExpires - Date.now());
      const sec = Math.ceil(diff / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      otpTimer.textContent = `${mm}:${ss}`;
      if (diff <= 0) {
        clearInterval(otpTimerInterval);
        otpMessage.textContent = "⏳ OTP expired. Please resend.";
      }
    }, 500);
  }

  function openOtpModal(email) {
    otpModal.style.display = "flex";
    otpMessage.textContent = `OTP sent to ${email}`;
    otpInput.value = "";
    startOtpTimer();
  }

  function generateAndShowOtp(email) {
    generatedOtp = Math.floor(100000 + Math.random() * 900000);
    otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    console.log("DEV OTP (for testing):", generatedOtp); // dev-only
    openOtpModal(email);
  }

  // Login form submit -> validate credentials -> generate OTP
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const loginVal = userLoginInput.value.trim();
    const password = passwordInput.value;

    if (!loginVal || !password) { alert("Please fill all fields!"); return; }

    const user = findUserByLogin(loginVal);
    if (!user) { alert("User not found. Please sign up."); return; }
    if (user.password !== password) { alert("Incorrect password."); return; }

    currentUser = user;
    generateAndShowOtp(user.email);
  });

  // Verify OTP
  verifyOtpBtn.addEventListener("click", () => {
    const entered = otpInput.value.trim();
    if (!entered) { alert("Enter OTP"); return; }
    if (!generatedOtp) { alert("No OTP generated. Please resend."); return; }
    if (Date.now() > otpExpires) { alert("OTP expired. Please resend."); return; }
    if (Number(entered) === generatedOtp) {
      // CRITICAL FIX: Use the correct session key: nextEarnXCurrentUser
      localStorage.setItem("nextEarnXCurrentUser", JSON.stringify(currentUser));
      // NOTE: We also keep the 'session' key for compatibility with other files (index.js, pay_to_other.js)
      localStorage.setItem("session", JSON.stringify({ username: currentUser.username, loginAt: Date.now(), expiry: Date.now() + 24*60*60*1000 }));
      
      alert("✅ Login successful!");
      // close modal and redirect
      otpModal.style.display = "none";
      window.location.href = "index.html";
    } else {
      alert("❌ Invalid OTP. Try again.");
    }
  });

  // Resend OTP
  resendOtpBtn.addEventListener("click", () => {
    if (!currentUser) { alert("Session lost. Please login again."); return; }
    generateAndShowOtp(currentUser.email);
  });

  // Dev: show OTP (only for testing; remove for production)
  showOtpDev.addEventListener("click", () => {
    if (generatedOtp) alert("DEV OTP: " + generatedOtp);
    else alert("No OTP currently generated.");
  });

  // Close OTP modal
  closeOtpBtn.addEventListener("click", () => {
    otpModal.style.display = "none";
    clearInterval(otpTimerInterval);
  });
  
  // CRITICAL FIX: Remove the redundant simple login code at the end of the file.
});