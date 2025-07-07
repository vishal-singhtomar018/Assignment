
  (function () {
    'use strict';

    // Bootstrap validation
    var forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  })();

  // Flash messages (dynamic alerts)
  const flashSuccess = sessionStorage.getItem("flashMessage");
  const flashError = sessionStorage.getItem("flashError");

  if (flashSuccess) {
    const div = document.createElement("div");
    div.className = "alert alert-success alert-dismissible fade show";
    div.innerHTML = `${flashSuccess} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    document.body.prepend(div);
    sessionStorage.removeItem("flashMessage");
    setTimeout(() => div.remove(), 3000);
  }

  if (flashError) {
    const div = document.createElement("div");
    div.className = "alert alert-danger alert-dismissible fade show";
    div.innerHTML = `${flashError} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    document.body.prepend(div);
    sessionStorage.removeItem("flashError");
    setTimeout(() => div.remove(), 3000);
  }

  // "Show more"/"Show less" toggles
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.show-more').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const span = this.closest('.note-content');
        const fullText = span.getAttribute('data-full');
        const isExpanded = span.classList.contains('expanded');

        if (!isExpanded) {
          span.innerHTML = fullText + ' <a href="#" class="show-less">Show less</a>';
          span.classList.add('expanded');
        } else {
          const short = fullText.slice(0, 100) + '... <a href="#" class="show-more">Show more</a>';
          span.innerHTML = short;
          span.classList.remove('expanded');
        }

        // Reattach event listener
        span.querySelector('a').addEventListener('click', arguments.callee);
      });
    });
  });

  // Send login OTP
  async function sendLoginOTP() {
    const emailInput = document.getElementById("email");
    const sendButton = event.target;
    const otpSection = document.getElementById("otp-section");
    const email = emailInput.value.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    sendButton.disabled = true;
    sendButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Sending...`;

    try {
      const res = await fetch('/sendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' })
      });

      const data = await res.json();

      if (data.success) {
        sendButton.innerText = "Sent ✔️";
        otpSection.style.display = "block";

        setTimeout(() => {
          sendButton.disabled = false;
          sendButton.innerText = "Resend OTP";
        }, 30000);
      } else {
        sendButton.innerText = "Send OTP";
        sendButton.disabled = false;
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      sendButton.innerText = "Send OTP";
      sendButton.disabled = false;
      alert("Error sending OTP.");
    }
  }

  // Login with OTP
  async function loginWithOTP() {
    const email = document.getElementById("email").value.trim();
    const otp = document.getElementById("otp").value.trim();

    if (!email || !otp) {
      alert("Please enter both email and OTP.");
      return;
    }

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (data.success) {
        const userName = data.user?.name || "User";
        sessionStorage.setItem("flashMessage", `👋 Welcome, ${userName}! You have successfully logged in.`);
        window.location.href = "/dashboard";
      } else {
        sessionStorage.setItem("flashError", `⚠️ ${data.message || "Something went wrong"}`);
        window.location.reload();
      }
    } catch (err) {
      console.error("Error during login:", err);
      alert("An error occurred.");
    }
  }

  // Send signup OTP
  async function sendOTP() {
    const email = document.getElementById("email").value.trim();
    const dob = document.getElementById("dob").value.trim();
    const sendButton = document.getElementById("send-otp-btn");
    const otpSection = document.getElementById("otp-section");

    const emailRegex = /^[a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|in|co|info|io|me|tech)$/i;

    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid and realistic email address.");
      return;
    }

    if (!dob || new Date(dob) >= new Date()) {
      alert("Please enter a valid date of birth (in the past).");
      return;
    }

    sendButton.disabled = true;
    sendButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Sending...`;

    try {
      const res = await fetch('/sendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        sendButton.innerText = "Sent ✔️";
        otpSection.style.display = "block";

        setTimeout(() => {
          sendButton.disabled = false;
          sendButton.innerText = "Resend OTP";
        }, 30000);
      } else {
        sendButton.disabled = false;
        sendButton.innerText = "Send OTP";
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      sendButton.disabled = false;
      sendButton.innerText = "Send OTP";
      alert("Error sending OTP. Please try again.");
    }
  }

  // Signup new user
async function signupUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const dob = document.getElementById("dob").value; // ✅ grab DOB directly

  const emailRegex = /^[a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|in|co|info|io|me|tech)$/i;

  if (!name || !email || !dob || !otp) {
    alert("All fields are required.");
    return;
  }

  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, dob, otp }) // ✅ send dob
    });

    const data = await res.json();

    if (data.success) {
      sessionStorage.setItem("flashMessage", `🎉 Welcome, ${data.user?.name || "Your Account has been Created  "}!`);
      window.location.href = "/dashboard";
    } else {
      sessionStorage.setItem("flashError", data.message || "Signup failed.");
      window.location.reload();
    }
  } catch (err) {
    console.error("Signup error:", err);
    alert("An error occurred during signup.");
  }
}


  document.addEventListener("DOMContentLoaded", function () {
    const otpInput = document.getElementById("otp");
    const toggleBtn = document.getElementById("toggle-otp");
    const icon = document.getElementById("otp-icon");

    toggleBtn.addEventListener("click", function () {
      const type = otpInput.getAttribute("type") === "password" ? "text" : "password";
      otpInput.setAttribute("type", type);
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  });
