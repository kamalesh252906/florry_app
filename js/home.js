document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-login-home');
    const signupBtn = document.getElementById('btn-signup-home');
    const browseBtn = document.getElementById('btn-browse-home');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = './pages/login.html';
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = './pages/signup.html';
        });
    }

    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            window.location.href = './pages/landing.html';
        });
    }
});
