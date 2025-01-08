class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9998';

        document.body.appendChild(this.canvas);

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Add click listener to cyber buttons
        document.querySelectorAll('.cyber-button').forEach(button => {
            button.addEventListener('click', (e) => this.createParticleExplosion(e.clientX, e.clientY));
        });

        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        return {
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1,
            color: Math.random() < 0.5 ? '#46c8ff' : '#ff9900',
            size: Math.random() * 3 + 1
        };
    }

    createParticleExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push(this.createParticle(x, y));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            this.ctx.fill();

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});