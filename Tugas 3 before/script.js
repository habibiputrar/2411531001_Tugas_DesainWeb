document.addEventListener('DOMContentLoaded', function() {
    // Plexus Background Animation
    class PlexusBackground {
        constructor(canvas) {
            if (!canvas) return;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.maxParticles = 100;
            this.maxDistance = 150;
            this.mouseX = 0;
            this.mouseY = 0;
            this.isLightTheme = false;
            
            this.init();
            this.bindEvents();
            this.animate();
        }
        
        init() {
            this.resize();
            this.createParticles();
        }
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        
        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.maxParticles; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1
                });
            }
        }
        
        bindEvents() {
            window.addEventListener('resize', () => this.resize());
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
        }
        
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update particles
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Boundary check
                if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
                
                // Mouse interaction
                const dx = this.mouseX - particle.x;
                const dy = this.mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    particle.x -= dx * 0.001;
                    particle.y -= dy * 0.001;
                }
            });
            
            // Draw particles
            this.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = this.isLightTheme 
                    ? 'rgba(59, 130, 246, 0.6)' 
                    : 'rgba(147, 197, 253, 0.6)';
                this.ctx.fill();
            });
            
            // Draw connections
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.maxDistance) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        const opacity = (1 - distance / this.maxDistance) * 0.3;
                        this.ctx.strokeStyle = this.isLightTheme 
                            ? `rgba(59, 130, 246, ${opacity})` 
                            : `rgba(147, 197, 253, ${opacity})`;
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(() => this.animate());
        }
    }
    
    // Initialize Plexus Background
    const plexusCanvas = document.getElementById('plexus');
    const plexus = new PlexusBackground(plexusCanvas);
    
    // Set theme to dark by default
    document.body.setAttribute('data-theme', 'dark');
    if (plexus) {
        plexus.isLightTheme = false;
    }
    
    // Smooth Scrolling for on-page links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only prevent default for hash links on the same page
            if (href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all designated elements
    document.querySelectorAll('.project-card, .certificate-card, .about-grid').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Error handling for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const parent = this.parentElement;
            if (!parent.querySelector('.fallback-icon')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback-icon';
                fallback.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:rgba(147,197,253,0.7);font-size:3em;';
                fallback.innerHTML = '<i class="fas fa-image"></i>';
                parent.appendChild(fallback);
            }
        });
    });

    // Disable right-click on all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', e => {
            e.preventDefault();
        });
    });
});