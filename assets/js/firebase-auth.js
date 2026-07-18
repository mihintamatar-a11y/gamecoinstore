import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9Tt3ZyVKr5pv1I2BNyMpE0PD8_q7vitM",
  authDomain: "gamecoinstore.firebaseapp.com",
  projectId: "gamecoinstore",
  storageBucket: "gamecoinstore.firebasestorage.app",
  messagingSenderId: "901249184966",
  appId: "1:901249184966:web:8de955ee50c35048ef13c7",
  measurementId: "G-PBQKGTKMDK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ── helpers ── */
function showAlert(icon, title, text) {
  return Swal.fire({ icon, title, text, background: "#1e1538", color: "#ece8ff",
    confirmButtonColor: "#f5c842" });
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner-border spinner-border-sm me-2"></span>Please wait…'
    : btn.dataset.label;
}

/* ── update navbar sign-in button ── */
function updateNavAuth(user) {
  const btns = document.querySelectorAll('a[href="login.html"].btn');
  btns.forEach(btn => {
    if (user) {
      btn.textContent = "Sign Out";
      btn.href = "#";
      btn.onclick = (e) => { e.preventDefault(); signOut(auth).then(() => location.reload()); };
    } else {
      btn.textContent = "Sign In";
      btn.href = "login.html";
      btn.onclick = null;
    }
  });
}

onAuthStateChanged(auth, updateNavAuth);

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
const loginForm = document.querySelector("#loginForm form");
if (loginForm) {
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.dataset.label = submitBtn.innerHTML;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('#login_email').value.trim();
    const password = loginForm.querySelector('#password').value;
    setLoading(submitBtn, true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await showAlert("success", "Welcome back!", "You are now signed in.");
      window.location.href = "index-2.html";
    } catch (err) {
      setLoading(submitBtn, false);
      const msg = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Try again.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Please try again later."
      }[err.code] || err.message;
      showAlert("error", "Login Failed", msg);
    }
  });

  /* Google login */
  const googleBtn = document.querySelector('a.btn-danger');
  if (googleBtn) {
    googleBtn.href = "#";
    googleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          lastLogin: serverTimestamp()
        }, { merge: true });
        await showAlert("success", "Welcome!", `Signed in as ${user.displayName}`);
        window.location.href = "index-2.html";
      } catch (err) {
        if (err.code !== "auth/popup-closed-by-user") {
          showAlert("error", "Google Sign-In Failed", err.message);
        }
      }
    });
  }
}

/* ══════════════════════════════════════
   REGISTER
══════════════════════════════════════ */
const registerForm = document.querySelector("#registerForm form");
if (registerForm) {
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  submitBtn.dataset.label = submitBtn.innerHTML;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name     = registerForm.querySelector('#name').value.trim();
    const email    = registerForm.querySelector('#email').value.trim();
    const phone    = registerForm.querySelector('#phone').value.trim();
    const dob      = registerForm.querySelector('#date_of_birth').value;
    const password = registerForm.querySelector('#password').value;
    const confirm  = registerForm.querySelector('#confirm_password').value;

    if (password !== confirm) {
      return showAlert("error", "Password Mismatch", "Passwords do not match.");
    }
    if (password.length < 6) {
      return showAlert("error", "Weak Password", "Password must be at least 6 characters.");
    }

    setLoading(submitBtn, true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, phone, dob,
        createdAt: serverTimestamp()
      });
      await showAlert("success", "Account Created!", "Welcome to GameCoin Store.");
      window.location.href = "index-2.html";
    } catch (err) {
      setLoading(submitBtn, false);
      const msg = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters."
      }[err.code] || err.message;
      showAlert("error", "Registration Failed", msg);
    }
  });
}

/* Google sign-up button on register page */
const googleRegisterBtn = document.querySelector("#googleRegisterBtn");
if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        createdAt: serverTimestamp()
      }, { merge: true });
      await showAlert("success", "Account Created!", `Welcome, ${user.displayName}!`);
      window.location.href = "index-2.html";
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        showAlert("error", "Google Sign-Up Failed", err.message);
      }
    }
  });
}

/* ══════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════ */
const forgotForm = document.querySelector("#forgotPassword form");
if (forgotForm) {
  const submitBtn = forgotForm.querySelector('button[type="submit"]');
  submitBtn.dataset.label = submitBtn.innerHTML;

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = forgotForm.querySelector('input[type="email"]').value.trim();
    setLoading(submitBtn, true);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(submitBtn, false);
      showAlert("success", "Email Sent!", `A password reset link has been sent to ${email}. Check your inbox.`);
      forgotForm.reset();
    } catch (err) {
      setLoading(submitBtn, false);
      const msg = {
        "auth/user-not-found": "No account found with this email.",
        "auth/invalid-email": "Please enter a valid email address."
      }[err.code] || err.message;
      showAlert("error", "Failed", msg);
    }
  });
}
