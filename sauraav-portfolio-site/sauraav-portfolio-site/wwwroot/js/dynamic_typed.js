// Array of words to type
const words = ["software developer.", "image editor.", "video editor.", "designer.", "imagineer.", "artist.", "problem solver.", "analyst.", "creative thinker.", "tutor.", "team player."];

// Typing effect configuration
const config = {
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseBeforeDelete: 1000
};

// State variables
let state = {
    currentWordIndex: 0,
    currentCharIndex: 0,
    isDeleting: false
};

/**
 * Determines the correct article for a word
 * @param {string} word - The word to evaluate
 * @returns {string} - 'a' or 'an'
 */
function getArticle(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstChar = word.charAt(0).toLowerCase();
    return vowels.includes(firstChar) ? 'an' : 'a';
}

/**
 * Main typing effect function
 */
function typeEffect() {
    const currentWord = words[state.currentWordIndex];
    const article = getArticle(currentWord);
    const displayText = `${article} ${currentWord}`;

    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) {
        console.error('Typing element not found');
        return;
    }

    if (state.isDeleting) {
        // Delete characters including the article
        typingElement.textContent = displayText.substring(0, state.currentCharIndex - 1);
        state.currentCharIndex--;

        if (state.currentCharIndex === 0) {
            state.isDeleting = false;
            state.currentWordIndex = (state.currentWordIndex + 1) % words.length;
        }

        setTimeout(typeEffect, config.deletingSpeed);
    } else {
        // Type characters including the article
        typingElement.textContent = displayText.substring(0, state.currentCharIndex + 1);
        state.currentCharIndex++;

        if (state.currentCharIndex === displayText.length) {
            state.isDeleting = true;
            setTimeout(typeEffect, config.pauseBeforeDelete);
            return;
        }

        setTimeout(typeEffect, config.typingSpeed);
    }
}

/**
 * Initialize the typing effect
 */
function initializeTypingEffect() {
    // Reset state
    state = {
        currentWordIndex: 0,
        currentCharIndex: 0,
        isDeleting: false
    };

    // Start the typing effect
    typeEffect();
}

// Start the effect when the document is ready
document.addEventListener('DOMContentLoaded', initializeTypingEffect);

// Export functions for potential reuse
export {
    initializeTypingEffect,
    typeEffect
};