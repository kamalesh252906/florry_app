/**
 * Florry Page Loader
 * Handles loading transitions and progress bar for all pages.
 */
(function () {
    // Prevent multiple injections
    if (document.getElementById('page-loader')) return;

    // Create loader HTML
    const loaderHTML = `
        <div class="page-loader" id="page-loader">
            <div class="loader-content">
                <div class="loader-flower">🌸</div>
                <div class="loader-text">Florry</div>
            </div>
        </div>
    `;

    // Inject styles if manually needed (though we'll link them in HTML)
    // Here we just inject the HTML
    const injectLoader = () => {
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', loaderHTML);
        } else {
            setTimeout(injectLoader, 10);
        }
    };

    const startProgress = () => {
        // Progress bar removed
    };

    const finishProgress = () => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hide');
            }, 300);
        }
    };

    // Initial injection
    injectLoader();

    // Hide on load and when restored from bfcache
    window.addEventListener('load', finishProgress);
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            finishProgress();
        }
    });

    // Show on navigation away
    window.addEventListener('beforeunload', () => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.remove('hide');
        }
    });

    // Handle single-page-like transitions if any, and intercept links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link &&
            link.href &&
            !link.href.startsWith('javascript:') &&
            !link.href.includes('#') &&
            !link.target &&
            link.hostname === window.location.hostname &&
            !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) {

            // For a smoother feel, we show it here
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.classList.remove('hide');
                startProgress();
            }
        }
    });

    // Show on form submissions
    document.addEventListener('submit', (e) => {
        const loader = document.getElementById('page-loader');
        if (loader && !e.defaultPrevented) {
            loader.classList.remove('hide');
            startProgress();
        }
    });

    // --- Toast Notifications ---
    const notifications = {
        show: (message, type = 'success', duration = 4000) => {
            let container = document.getElementById('notification-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'notification-container';
                container.className = 'notification-container';
                document.body.appendChild(container);
            }

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;

            let icon = '🔔';
            if (type === 'success') icon = '✅';
            if (type === 'error') icon = '❌';
            if (type === 'warning') icon = '⚠️';
            if (type === 'info') icon = 'ℹ️';

            notification.innerHTML = `
                <div class="notification-icon">${icon}</div>
                <div class="notification-message">${message}</div>
                <div class="notification-close">✕</div>
            `;

            container.appendChild(notification);

            // Animate in
            setTimeout(() => notification.classList.add('show'), 10);

            // Auto remove
            const timer = setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 400);
            }, duration);

            // Manual close
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    clearTimeout(timer);
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 400);
                };
            }
        },
        success: (msg) => notifications.show(msg, 'success'),
        error: (msg) => notifications.show(msg, 'error'),
        info: (msg) => notifications.show(msg, 'info'),
        warning: (msg) => notifications.show(msg, 'warning'),
        confirm: (message, title = 'Confirm Action') => {
            return new Promise((resolve) => {
                let overlay = document.getElementById('modal-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'modal-overlay';
                    overlay.className = 'modal-overlay';
                    document.body.appendChild(overlay);
                }

                overlay.innerHTML = `
                    <div class="confirm-modal">
                        <h3>${title}</h3>
                        <p>${message}</p>
                        <div class="modal-btns">
                            <button class="modal-btn btn-cancel">Cancel</button>
                            <button class="modal-btn btn-ok">OK</button>
                        </div>
                    </div>
                `;

                setTimeout(() => overlay.classList.add('show'), 10);

                const cleanup = (result) => {
                    overlay.classList.remove('show');
                    setTimeout(() => {
                        overlay.innerHTML = '';
                        resolve(result);
                    }, 300);
                };

                overlay.querySelector('.btn-ok').onclick = () => cleanup(true);
                overlay.querySelector('.btn-cancel').onclick = () => cleanup(false);
                overlay.onclick = (e) => {
                    if (e.target === overlay) cleanup(false);
                };
            });
        }
    };

    // Expose to window
    window.showNotification = notifications.show;
    window.florryNotify = notifications;
})();

