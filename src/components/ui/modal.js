import gsap from "gsap";

export function setupModal(modal, modalOverlay, modalContent, modalButtons, closeModalButton, onClose) {
    const tl = gsap.timeline({ paused: true });

    const title = modalContent.querySelector('h1');

    modalButtons.forEach(button => {
        button?.addEventListener("click", () => {
            title.innerHTML = button.innerHTML;
            gsap.to(modalContent, { backgroundColor: '#fffce1', duration: 0 });
            tl.timeScale(1).restart();
        });
    });

    const close = () => {
        gsap.to(modalContent, {
            duration: 0.15,
            opacity: 0,
            display: 'none',
            yPercent: 100,
            xPercent: -50,
            ease: 'power2.out',
            onComplete: () => {
                if (onClose) onClose();
            }
        });

        gsap.to(modalOverlay, {
            duration: 0.15,
            opacity: 0,
            display: 'none',
            ease: 'power2.out',
        });
    }

    closeModalButton.addEventListener("click", () => {
        close();
    });

    tl.to(modalOverlay, {
        duration: 0.2,
        opacity: 1,
        display: 'block',
    }).to(modalContent, {
        duration: 0.33,
        opacity: 1,
        display: 'flex',
        startAt: { yPercent: 100, xPercent: -50 },
        yPercent: -50,
        xPercent: -50,
        ease: 'power2.out',
    }).to(title, {
        duration: 0.15,
        opacity: 1,
        y: 0,
        startAt: { y: 20, opacity: 0 },
        stagger: 0.1,
    });

    return { close, open: () => tl.restart() };
}