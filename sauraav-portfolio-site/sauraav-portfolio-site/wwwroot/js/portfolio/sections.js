// Section behaviour: typed intro text, scroll buttons, reveal-on-scroll, skill bars,
// the project preview and the mobile project carousel dots.
(function () {
  'use strict';

  const device = window.portfolioDevice || {};
  const reducedMotion = Boolean(device.reducedMotion);

  // ---- Typed intro -----------------------------------------------------------
  const typingElement = document.querySelector('.typing-text');
  if (typingElement) {
    const words = ['software developer.', 'image editor.', 'video editor.', 'designer.', 'imagineer.', 'artist.', 'problem solver.', 'analyst.', 'creative thinker.', 'tutor.', 'team player.'];
    const withArticle = (word) => `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`;

    if (reducedMotion) {
      typingElement.textContent = withArticle(words[0]);
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const typeStep = () => {
        if (document.hidden) {
          window.setTimeout(typeStep, 500);
          return;
        }
        const text = withArticle(words[wordIndex]);
        charIndex += deleting ? -1 : 1;
        typingElement.textContent = text.slice(0, charIndex);

        let delay = deleting ? 50 : 100;
        if (!deleting && charIndex === text.length) {
          deleting = true;
          delay = 1000;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
        window.setTimeout(typeStep, delay);
      };
      typeStep();
    }
  }

  // ---- Scroll buttons ----------------------------------------------------------
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-scroll-to]');
    if (!button) return;
    const target = document.getElementById(button.dataset.scrollTo);
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });

  // ---- Reveal on scroll ----------------------------------------------------------
  const revealTargets = document.querySelectorAll('.reveal');
  const supportsObserver = 'IntersectionObserver' in window;

  function reveal(element) {
    element.classList.add('visible');
    element.querySelectorAll('.summary-text p').forEach((p) => p.classList.add('visible'));

    const progress = element.querySelector('.skill-progress');
    if (progress) {
      const level = Number(progress.dataset.level) || 0;
      progress.style.width = `${Math.min(100, (level / 10) * 100)}%`;
    }
  }

  if (!supportsObserver || reducedMotion) {
    revealTargets.forEach(reveal);
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = entry.target.parentElement?.children;
        const index = siblings ? Array.prototype.indexOf.call(siblings, entry.target) : 0;
        // Small stagger inside a group, capped so late items never feel stuck.
        entry.target.style.transitionDelay = `${Math.min(index, 6) * 60}ms`;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px 40px 0px' });

    revealTargets.forEach((target) => observer.observe(target));
  }

  // ---- Project preview -----------------------------------------------------------
  const projectItems = document.querySelectorAll('.project-item');
  const previewImage = document.querySelector('.project-image');
  const previewVideo = document.querySelector('.project-video');
  const previewOverlay = document.querySelector('.project-overlay');
  const previewDescription = document.querySelector('.project-description');

  function showProject(item) {
    if (!previewImage || !previewVideo) return;
    const media = item.dataset.media || '';
    const isVideo = /\.(mp4|webm)(\?|$)/i.test(media);

    previewDescription.textContent = item.dataset.description || '';
    previewOverlay.style.opacity = '1';

    if (isVideo) {
      previewImage.hidden = true;
      previewImage.removeAttribute('src');
      if (previewVideo.getAttribute('src') !== media) {
        previewVideo.src = media;
        previewVideo.load();
      }
      previewVideo.hidden = false;
      previewVideo.style.opacity = '1';
      if (device.coarsePointer) {
        previewVideo.controls = true;
      } else {
        previewVideo.play().catch(() => { /* autoplay blocked; the user can tap to play */ });
      }
    } else {
      previewVideo.pause();
      previewVideo.hidden = true;
      previewVideo.removeAttribute('src');
      if (media) {
        previewImage.src = media;
        previewImage.hidden = false;
        previewImage.style.opacity = '1';
      } else {
        previewImage.hidden = true;
      }
    }

    projectItems.forEach((other) => other.classList.toggle('active', other === item));
  }

  if (projectItems.length) {
    const coarse = device.coarsePointer;
    projectItems.forEach((item) => {
      if (!coarse) item.addEventListener('mouseenter', () => showProject(item));
      item.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        showProject(item);
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showProject(item);
        }
      });
    });

    // Horizontal carousel dots on small screens.
    if (window.innerWidth <= 768) {
      const list = document.querySelector('.projects-list');
      const container = document.querySelector('.projects-container');
      const indicator = document.createElement('div');
      indicator.className = 'scroll-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      projectItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = index === 0 ? 'scroll-dot active' : 'scroll-dot';
        indicator.appendChild(dot);
      });
      container.appendChild(indicator);

      let ticking = false;
      list.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          ticking = false;
          const itemWidth = projectItems[0].offsetWidth || 1;
          const active = Math.round(list.scrollLeft / itemWidth);
          indicator.childNodes.forEach((dot, index) => dot.classList.toggle('active', index === active));
          if (projectItems[active]) showProject(projectItems[active]);
        });
      }, { passive: true });

      showProject(projectItems[0]);
    }
  }
})();
