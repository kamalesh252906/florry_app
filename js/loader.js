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
        <div class="loader-progress" id="loader-progress"></div>
    `;

    // Inject styles if manually needed (though we'll link them in HTML)
    // Here we just inject the HTML
    const injectLoader = () => {
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', loaderHTML);
            startProgress();
        } else {
            setTimeout(injectLoader, 10);x
        }
    };

    let progressInterval;
    const startProgress = () => {
        const progressBar = document.getElementById('loader-progress');
        if (!progressBar) return;

        let progress = 0;
        progressBar.style.width = '0%';
        progressBar.style.opacity = '1';

        clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 95) {
                progress = 95;
                clearInterval(progressInterval);
            }
            if (progressBar) progressBar.style.width = progress + '%';
        }, 150);
    };

    const finishProgress = () => {
        const progressBar = document.getElementById('loader-progress');
        const loader = document.getElementById('page-loader');

        clearInterval(progressInterval);
        if (progressBar) {
            progressBar.style.width = '100%';

            setTimeout(() => {
                if (loader) loader.classList.add('hide');
                if (progressBar) progressBar.classList.add('fade');
            }, 300);
        } else if (loader) {
            loader.classList.add('hide');
        }
    };

    // Initial injection
    injectLoader();

    // Hide on load
    window.addEventListener('load', finishProgress);

    // Show on navigation away
    window.addEventListener('beforeunload', () => {
        const loader = document.getElementById('page-loader');
        const progressBar = document.getElementById('loader-progress');

        if (loader) {
            loader.classList.remove('hide');
        }
        if (progressBar) {
            progressBar.classList.remove('fade');
            progressBar.style.width = '0%';
            progressBar.style.opacity = '1';
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
})();
