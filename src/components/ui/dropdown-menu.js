import gsap from "gsap";

export function setupDropdownMenu(openButton, hoverElement, closeButton, onAction) {

    const svg = openButton.querySelector('svg');
    let timeout;

    // Create timeline once, paused initially
    const tl = gsap.timeline({ paused: true });

    // Define the animation sequence once
    const menuContent = document.querySelector('.dropdown-menu-content');

    const title = menuContent.querySelector('h1');
    const links = menuContent.querySelectorAll('li');
    const buttons = menuContent.querySelectorAll('button');

    tl.to(svg, {
        duration: 0.2,
        opacity: 0,
    })
        .to(menuContent, {
            duration: 0.2,
            height: 'auto',
            padding: '2rem',
            width: 'auto',
            onComplete: () => {
                openButton.style.cursor = 'default';
                // Lock element from interaction
                openButton.style.pointerEvents = 'none';
            },
        })
        .to(title, {
            height: 'auto',
            opacity: 1,
            width: 'auto',
            y: 0,
            startAt: { y: 20 },
        })
        .to(links, {
            opacity: 1,
            y: 0,
            startAt: { y: 20 },
            stagger: 0.1,
        });

    openButton.addEventListener("mouseenter", () => {
        timeout = setTimeout(() => {
            gsap.to(hoverElement, {
                duration: 0.2,
                width: '100%',
                height: '100%',
                backgroundColor: '#fffce1',
                startAt: { width: 0 },
                onStart: () => {
                    svg.style.color = '#1a1a1a';
                },
            });
        }, 120);
    });

    openButton.addEventListener("mouseleave", () => {
        clearTimeout(timeout);
        gsap.to(hoverElement, {
            duration: 0.2,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            onComplete: () => {
                svg.style.color = '#fffce1';
            },
        });
    });

    openButton.addEventListener("click", () => {
        tl.play();
    });


    [closeButton, ...buttons].forEach(button => {
        button.addEventListener("click", () => {
            // Open modal depends on button clicked
            if (button.id !== 'close-dropdown-button' && onAction) {
                const formId = button.id.replace('add-', '') + '-form';
                onAction(formId, button.textContent);
            }

            tl.reverse();

            openButton.style.cursor = 'pointer';
            openButton.style.pointerEvents = 'auto';
        });
    });
}