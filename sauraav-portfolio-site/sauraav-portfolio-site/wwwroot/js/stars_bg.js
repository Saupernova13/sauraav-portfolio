class Starfield {
    constructor(containerId, options) {
        this.options = options;
        this.container = document.getElementById(containerId);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.mouseX = 0;
        this.mouseY = 0;
        this.stars = [];
        this.words = [];
        this.frameInterval = 1000 / this.options.fps;
        this.lastTime = 0;

        this.starsContainer = document.createElement('div');
        this.starsContainer.className = 'stars';
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor';

        this.container.appendChild(this.starsContainer);
        this.container.appendChild(this.cursor);

        this.init();
    }

    init() {
        for (let i = 0; i < this.options.starCount; i++) {
            this.stars.push(new Star(this));
        }

        for (let i = 0; i < this.options.words.length; i++) {
            this.words.push(new Word(this, i));
        }

        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        this.animate(0);
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.cursor.style.left = `${this.mouseX}px`;
        this.cursor.style.top = `${this.mouseY}px`;
    }

    handleResize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.stars.forEach(star => star.resetPosition());
        this.words.forEach(word => word.resetPosition());
    }

    animate(currentTime) {
        requestAnimationFrame(this.animate.bind(this));

        const deltaTime = currentTime - this.lastTime;
        if (deltaTime < this.frameInterval) return;

        this.lastTime = currentTime - (deltaTime % this.frameInterval);
        this.stars.forEach(star => star.update());
        this.words.forEach(word => word.update());
    }
}

class Star {
    constructor(starfield) {
        this.starfield = starfield;
        this.element = document.createElement('div');
        this.element.className = 'star';

        this.size = Math.random() * 2 + 0.5;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.opacity = Math.random() * 0.8 + 0.2;

        this.resetPosition();
        this.starfield.starsContainer.appendChild(this.element);
    }

    resetPosition() {
        this.x = Math.random() * this.starfield.width;
        this.y = Math.random() * this.starfield.height;
        this.vx = (Math.random() - 0.5) * this.starfield.options.baseMovementSpeed;
        this.vy = (Math.random() - 0.5) * this.starfield.options.baseMovementSpeed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = this.starfield.width;
        if (this.x > this.starfield.width) this.x = 0;
        if (this.y < 0) this.y = this.starfield.height;
        if (this.y > this.starfield.height) this.y = 0;

        const dx = this.starfield.mouseX - this.x;
        const dy = this.starfield.mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.starfield.options.mouseForceRadius) {
            const force = (this.starfield.options.mouseForceRadius - distance) *
                this.starfield.options.mouseForceStrength;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 0.1;
            this.y -= Math.sin(angle) * force * 0.1;
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

class Word {
    constructor(starfield, wordIndex) {
        this.starfield = starfield;
        this.element = document.createElement('div');
        this.element.className = 'floating-word';
        this.element.textContent = this.starfield.options.words[wordIndex];

        this.size = Math.random() * 12 + 12;
        this.element.style.fontSize = `${this.size}px`;

        this.width = 0;
        this.height = 0;
        this.starfield.starsContainer.appendChild(this.element);

        const rect = this.element.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.findSafePosition();
    }

    findSafePosition(attempts = 50) {
        let found = false;
        let attempt = 0;

        while (!found && attempt < attempts) {
            this.x = Math.random() * (this.starfield.width - this.width);
            this.y = Math.random() * (this.starfield.height - this.height);

            if (!this.checkCollision()) {
                found = true;
            }
            attempt++;
        }

        this.vx = (Math.random() - 0.5) * this.starfield.options.baseMovementSpeed * 0.5;
        this.vy = (Math.random() - 0.5) * this.starfield.options.baseMovementSpeed * 0.5;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    checkCollision() {
        return this.starfield.words.some(otherWord => {
            if (otherWord === this) return false;

            const padding = 20;

            return !(this.x + this.width + padding < otherWord.x ||
                this.x > otherWord.x + otherWord.width + padding ||
                this.y + this.height + padding < otherWord.y ||
                this.y > otherWord.y + otherWord.height + padding);
        });
    }

    resetPosition() {
        this.findSafePosition();
    }

    update() {
        const oldX = this.x;
        const oldY = this.y;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -this.width) {
            this.x = this.starfield.width;
            this.y = Math.random() * (this.starfield.height - this.height);
        }
        if (this.x > this.starfield.width) {
            this.x = -this.width;
            this.y = Math.random() * (this.starfield.height - this.height);
        }
        if (this.y < -this.height) {
            this.y = this.starfield.height;
            this.x = Math.random() * (this.starfield.width - this.width);
        }
        if (this.y > this.starfield.height) {
            this.y = -this.height;
            this.x = Math.random() * (this.starfield.width - this.width);
        }

        const dx = this.starfield.mouseX - (this.x + this.width / 2);
        const dy = this.starfield.mouseY - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.starfield.options.mouseForceRadius) {
            const force = (this.starfield.options.mouseForceRadius - distance) *
                this.starfield.options.mouseForceStrength;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 0.1;
            this.y -= Math.sin(angle) * force * 0.1;
        }

        if (this.checkCollision()) {
            this.x = oldX;
            this.y = oldY;
            this.vx = (Math.random() - 0.5) * this.starfield.options.baseMovementSpeed * 0.5;
            this.vy = (Math.random() - 0.5) * this.starfield.options.baseMovementSpeed * 0.5;
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function () {
    const myStarfield = new Starfield('myStarfield', {
        starCount: 200,
        mouseForceRadius: 150,
        mouseForceStrength: 1,
        baseMovementSpeed: 1,
        fps: 60,
        words: [
        ]
    });
});

//words: [
//    'C#',
//    '.NET',
//    'Unity',
//    'Godot',
//    'Kotlin',
//    'Java',
//    'Delphi',
//    'Linux',
//    'SQL',
//    'NoSQL',
//    'Azure',
//    'Firebase',
//    'MongoDB',
//    'JavaScript',
//    'HTML',
//    'CSS',
//    'GenAI',
//    'ChatGPT',
//    'Claude',
//    'Llama 3',
//    'Blender',
//    'Photoshop',
//    '3D Modelling',
//    'Video Editing',
//    'LaTeX'
//]