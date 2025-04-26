// Check jQuery availability and compatibility
if (typeof jQuery === 'undefined') {
    console.log("jQuery is not loaded.");
} else if (/^1\.[0-6]\.\d+/.test(jQuery.fn.jquery)) {
    console.log("jQuery version is not compatible with Owl Carousel.");
} else {
    console.log("jQuery version is compatible with Owl Carousel.");
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

    // Cache jQuery selectors
    const $navbar = $('.navbar');
    const $scrollUpBtn = $('.scroll-up-btn');
    const $menuItems = $('.navbar .menu li a');
    const $menuBtn = $('.menu-btn');
    const $menu = $navbar.find('.menu');

    // Scroll event for navbar and scroll-up button visibility
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
