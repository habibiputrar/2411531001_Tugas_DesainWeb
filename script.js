class PlexusEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.maxDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(147, 197, 253, 0.5)';
            this.ctx.fill();
        });
    }
    
    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    const opacity = (1 - distance / this.maxDistance) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx -= Math.cos(angle) * force * 0.2;
                    particle.vy -= Math.sin(angle) * force * 0.2;
                }
            }
            
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawParticles();
        this.connectParticles();
        this.updateParticles();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing...');
    
    const plexusCanvas = document.getElementById('plexus');
    if (plexusCanvas) {
        new PlexusEffect(plexusCanvas);
        console.log('✅ Plexus effect initialized');
    }

    initMobileMenu();
});

// ========== MOBILE MENU TOGGLE ==========
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!mobileToggle || !navLinks) {
        console.error('Mobile menu elements not found!');
        return;
    }
    
    // Toggle menu on button click
    mobileToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        
        // Change icon
        const icon = mobileToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-container') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').className = 'fas fa-bars';
        }
    });
    
    console.log('Mobile menu initialized');
}

// ========== SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// ========== PWA INSTALL ==========
let deferredPrompt;
let installButton;

if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
    window.addEventListener('load', () => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            installButton = document.createElement('button');
            installButton.className = 'btn-primary';
            installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
            installButton.style.display = 'none';
            installButton.style.marginTop = '20px';
            
            heroContent.appendChild(installButton);
            
            installButton.addEventListener('click', async () => {
                if (!deferredPrompt) {
                    alert('PWA sudah terinstall atau browser tidak mendukung instalasi.');
                    return;
                }

                deferredPrompt.prompt();
                
                // Wait for user response
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                
                if (outcome === 'accepted') {
                    console.log('✅ User accepted the install prompt');
                    installButton.style.display = 'none';
                } else {
                    console.log('❌ User dismissed the install prompt');
                }

                deferredPrompt = null;
            });
        }
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;

    if (installButton) {
        installButton.style.display = 'inline-flex';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA was installed successfully');
    deferredPrompt = null;
    if (installButton) {
        installButton.style.display = 'none';
    }
    alert('✅ Aplikasi berhasil diinstall!');
});

window.addEventListener('online', () => {
    console.log('🟢 Back online');
});

window.addEventListener('offline', () => {
    console.log('🔴 Gone offline');
});