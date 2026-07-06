// Types and deletes a rotating list of roles inside .typing-text.
(() => {
    'use strict';

    const WORDS = [
        'software developer.', 'image editor.', 'video editor.', 'designer.',
        'imagineer.', 'artist.', 'problem solver.', 'analyst.',
        'creative thinker.', 'tutor.', 'team player.',
    ];

    const TYPE_MS = 100;
    const DELETE_MS = 50;
    const PAUSE_MS = 1000;

    document.addEventListener('DOMContentLoaded', () => {
        const el = document.querySelector('.typing-text');
        if (!el) return;

        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function article(word) {
            return 'aeiou'.includes(word[0]) ? 'an' : 'a';
        }

        function tick() {
            const word = WORDS[wordIndex];
            const text = `${article(word)} ${word}`;

            charIndex += deleting ? -1 : 1;
            el.textContent = text.substring(0, charIndex);

            if (!deleting && charIndex === text.length) {
                deleting = true;
                setTimeout(tick, PAUSE_MS);
            } else if (deleting && charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % WORDS.length;
                setTimeout(tick, TYPE_MS);
            } else {
                setTimeout(tick, deleting ? DELETE_MS : TYPE_MS);
            }
        }

        tick();
    });
})();
