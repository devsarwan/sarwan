// Check jQuery availability and compatibility
if (typeof jQuery === 'undefined') {
    console.log("jQuery is not loaded");
} else if (/^1\.[0-6]\.\d+/.test(jQuery.fn.jquery)) {
    console.log("jQuery version is not compatible with Owl Carousel");
} else {
    console.log("jQuery version is compatible with Owl Carousel");
}

$(document).ready(function () {
    // Typing animation options
    const typingOptions = {
        strings: [
            "student",
            "software developer",
            "web designer",
            "tech enthusiast",
            "problem solver",
            "frontend engineer",
            "UI/UX lover",
            "JavaScript ninja",
            "lifelong learner",
            "code artist"
        ],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    };

    // Cache frequently used jQuery selectors
    const $navbar = $('.navbar');
    const $scrollUpBtn = $('.scroll-up-btn');
    const $menuItems = $('.navbar .menu li a');
    const $menuBtn = $('.menu-btn');
    const $menu = $navbar.find('.menu');

    // Scroll event for navbar and scroll-up button
    $(window).scroll(function () {
        const scrollY = $(this).scrollTop();
        $navbar.toggleClass("sticky", scrollY > 20);
        $scrollUpBtn.toggleClass("show", scrollY > 500);
    });













    // Scroll-up button click
    $scrollUpBtn.click(function () {
        $('html').animate({ scrollTop: 0 }, 'fast').css("scrollBehavior", "auto");




















    });














    // Smooth scroll on menu item click
    $menuItems.click(function () {
        $('html').css("scrollBehavior", "smooth");










    });

    // Toggle mobile menu
    $menuBtn.click(function () {
        $menu.toggleClass("active");
        $(this).find('i').toggleClass("active");

    });







    // Initialize typing animations
    new Typed(".typing", typingOptions);
    new Typed(".typing-2", typingOptions);

    // Owl Carousel initialization
    $('.carousel').owlCarousel({
        margin: 20,
        loop: true,
        autoplayTimeout: 2000,
        autoplayHoverPause: true,
        responsive: {
            0: { items: 1, nav: false },
            600: { items: 2, nav: false },
            1000: { items: 3, nav: false }
        }




    });
});

// ===== Register Service Worker for PWA Features =====
(function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.error('Service Worker not supported in this browser. PWA features will not work.');
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('New Service Worker found:', newWorker);

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New content available. Activating new Service Worker...');
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch(error => console.error('Service Worker registration failed:', error));
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
})();

// ===== Handle "Retry" Button on Offline Page =====
document.addEventListener('DOMContentLoaded', () => {
    const retryButton = document.getElementById('retryButton');
    if (!retryButton) return;

    retryButton.addEventListener('click', () => {
        // Show reconnecting message or spinner
        const reconnectMessage = document.getElementById('reconnectMessage');
        if (reconnectMessage) reconnectMessage.style.display = 'flex';

        // Skip waiting for the Service Worker if possible, then reload
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
        }

        setTimeout(() => {
            location.reload(); // Reload the page after a short delay
        }, 1000);
    });
});
