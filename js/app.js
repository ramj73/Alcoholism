/**
 * app.js — Core navigation, scroll animations, interactions, and particle background
 */

import { NAV_ITEMS } from './data.js';
import { initProteinViewer, loadProteinByGene } from './protein-viewer.js';
import { initGwasLookup } from './gwas-lookup.js';

// ─── Initialization ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initScrollAnimations();
  initTargetCards();
  initParticleCanvas();
  initProteinViewer();
  initGwasLookup();
  initGeneTagClicks();
});

// ─── Theme Toggle (Dark/Light) ─────────────────────────────────────
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Restore saved theme
  const savedTheme = localStorage.getItem('alcoholism-ai-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('alcoholism-ai-theme', next);

    // Update particle colors if canvas exists
    updateParticleTheme(next);
  });
}

// Track current particle color for theme changes
let particleColor = { r: 0, g: 212, b: 255 };

function updateParticleTheme(theme) {
  if (theme === 'light') {
    particleColor = { r: 8, g: 145, b: 178 };
  } else {
    particleColor = { r: 0, g: 212, b: 255 };
  }
}

// ─── Navigation ────────────────────────────────────────────────────
function initNavigation() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // Scroll effect on nav
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // Close mobile menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      hamburger?.classList.remove('active');
    });
  });
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;

  let currentSection = '';
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      currentSection = section.id;
    }
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

// ─── Scroll Animations (IntersectionObserver) ──────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Observe workflow steps with staggered delay
  document.querySelectorAll('.workflow-step').forEach((step, i) => {
    step.style.transitionDelay = `${i * 0.15}s`;
    observer.observe(step);
  });
}

// ─── Target Cards (Expand/Collapse) ───────────────────────────────
function initTargetCards() {
  document.querySelectorAll('.target-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't collapse if clicking a gene tag
      if (e.target.closest('.gene-tag')) return;

      const wasExpanded = card.classList.contains('expanded');
      // Collapse all
      document.querySelectorAll('.target-card').forEach(c => c.classList.remove('expanded'));
      // Toggle clicked
      if (!wasExpanded) card.classList.add('expanded');
    });
  });
}

// ─── Gene Tag Clicks (Navigate to Protein Viewer) ─────────────────
function initGeneTagClicks() {
  document.querySelectorAll('.gene-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const gene = tag.dataset.gene;
      if (gene) {
        loadProteinByGene(gene);
      }
    });
  });
}

// ─── Particle Canvas (Hero Background) ────────────────────────────
function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DISTANCE = 150;

  // Sync particle color with current theme
  const savedTheme = document.documentElement.getAttribute('data-theme');
  if (savedTheme === 'light') {
    particleColor = { r: 8, g: 145, b: 178 };
  }

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
          ctx.strokeStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${p.alpha})`;
      ctx.fill();
    });
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Keep in bounds
      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));
    });
  }

  function animate() {
    updateParticles();
    drawParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Setup
  resize();
  createParticles();
  animate();

  // Handle resize
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  // Pause animation when not visible
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(canvas.parentElement);
}
