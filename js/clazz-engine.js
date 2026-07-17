/* Clazz Core Template Rendering Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get query parameter for teacher selection
  const urlParams = new URLSearchParams(window.location.search);
  let teacherKey = urlParams.get('t') || urlParams.get('teacher');
  
  // Fallback to filename-based routing if no query param is found
  if (!teacherKey) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('ruwan')) {
      teacherKey = "ruwan";
    } else if (path.includes('oshan')) {
      teacherKey = "oshan";
    } else if (path.includes('tharanga')) {
      teacherKey = "tharanga";
    }
  }

  // Fallback default
  if (!teacherKey || (teacherKey !== 'custom' && !window.CLAZZ_TEACHERS[teacherKey])) {
    teacherKey = "oshan"; 
  }
  
  let teacher;
  if (teacherKey === 'custom') {
    try {
      teacher = JSON.parse(localStorage.getItem('clazz_custom_preview'));
    } catch (e) {
      console.error("Failed to parse custom preview data:", e);
    }
  }
  
  if (!teacher) {
    teacher = window.CLAZZ_TEACHERS[teacherKey];
  }
  
  // Expose colors globally for canvas widgets
  window.themeAccentColor = teacher.accentColor || '#8b5cf6';
  
  // 2. Setup Page Title & Theme Class
  document.title = `${teacher.name} | ${teacher.subject} Mastery`;
  document.body.className = `theme-${teacher.theme}`;
  
  // Load respective theme stylesheet dynamically (extra protection)
  const themeLink = document.createElement('link');
  themeLink.rel = 'stylesheet';
  themeLink.href = `css/theme-${teacher.theme}.css`;
  document.head.appendChild(themeLink);

  // 3. Render HTML Core Structure Dynamically
  renderHeader(teacher);
  renderHero(teacher);
  renderStats(teacher);
  renderAbout(teacher);
  renderOfferings(teacher);
  renderYouTubeShowcase(teacher);
  renderWidgets(teacher);
  renderSyllabus(teacher);
  renderTimetable(teacher);
  renderTestimonials(teacher);
  renderLMSBox(teacher);
  renderContact(teacher);
  renderFooter(teacher);
  
  // 4. Setup Micro-interactions & Cursors
  setupCustomCursor();
  setupScrollAnimations();
  setupPreloader();
  
  // 5. Special Background Elements based on Theme
  setupThemeBgCanvas(teacher.theme);
  
  if (teacher.theme === 'neon') {
    setupFloatingSymbols(['+', '−', '×', '÷', '=', '√x', 'π', 'θ', 'Σ', 'Δ', 'x²', 'y³']);
  } else if (teacher.theme === 'chalk') {
    setupFloatingSymbols(['1+1=2', 'a²+b²=c²', 'y=mx+c', 'E=mc²', 'f(x)', '∫dx', 'sinθ', 'log(x)']);
  }
});

/* Render Header / Navbar */
function renderHeader(teacher) {
  const brandName = document.getElementById('navBrandName');
  if (brandName) {
    brandName.textContent = teacher.name;
    document.getElementById('navBrandSubject').textContent = teacher.subject;
  }
  
  const lmsBtn = document.getElementById('navLmsBtn');
  if (lmsBtn && teacher.contact.lms) {
    lmsBtn.href = teacher.contact.lms;
  } else if (lmsBtn) {
    lmsBtn.style.display = 'none';
  }
}

/* Render Hero Section */
function renderHero(teacher) {
  document.getElementById('heroEyebrow').textContent = `${teacher.subject} • ${teacher.subheading}`;
  
  const title = document.getElementById('heroTitle');
  title.innerHTML = teacher.name;
  
  // Add glitch effect attributes if cyberpunk theme
  if (teacher.theme === 'cyber') {
    title.className += ' glitch';
    title.setAttribute('data-text', teacher.name);
  }
  
  const taglineEl = document.getElementById('heroTagline');
  if (teacher.theme === 'terminal') {
    taglineEl.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    taglineEl.appendChild(cursor);
    runTerminalTypewriter(taglineEl, teacher.tagline, cursor);
  } else {
    taglineEl.textContent = teacher.tagline;
  }
  document.getElementById('heroSubhead').textContent = `Structured curriculum for G.C.E. Advanced and Ordinary Level. Conducted at ${teacher.contact.location}.`;
  
  const heroBtnLms = document.getElementById('heroBtnLms');
  if (heroBtnLms && teacher.contact.lms) {
    heroBtnLms.href = teacher.contact.lms;
  } else if (heroBtnLms) {
    heroBtnLms.style.display = 'none';
  }
  
  // Hero Image
  const heroImg = document.getElementById('heroPortrait');
  if (heroImg && teacher.heroPhoto) {
    heroImg.src = teacher.heroPhoto;
    heroImg.alt = `${teacher.name} Portrait`;
  }
}

/* Render Stats Section */
function renderStats(teacher) {
  const container = document.getElementById('statsContainer');
  if (!container || !teacher.stats) return;
  
  container.innerHTML = teacher.stats.map((stat, i) => `
    ${i > 0 ? '<div class="stat-divider" style="width: 1px; background: rgba(255,255,255,0.08); align-self: stretch;"></div>' : ''}
    <div class="stat-card" style="text-align: center; flex: 1;">
      <h2 class="stat-num" data-val="${stat.val}" data-suffix="${stat.suffix}">0</h2>
      <p class="stat-label" style="text-transform: uppercase; font-size: 0.8rem; opacity: 0.7; margin-top: 0.3rem;">${stat.label}</p>
    </div>
  `).join('');
  
  // Stat counters transition
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(container);
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const valStr = counter.getAttribute('data-val');
    const suffix = counter.getAttribute('data-suffix');
    const target = parseFloat(valStr);
    
    if (isNaN(target)) {
      counter.textContent = valStr + suffix;
      return;
    }
    
    let count = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      count = Math.floor(easeProgress * target);
      counter.textContent = count + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target + suffix;
      }
    }
    
    requestAnimationFrame(update);
  });
}

/* Render About Section */
function renderAbout(teacher) {
  if (!teacher.about) return;
  
  document.getElementById('aboutTitle').textContent = teacher.about.title;
  document.getElementById('aboutSubtitle').textContent = teacher.about.subtitle;
  document.getElementById('aboutBio').textContent = teacher.about.bio;
  
  const aboutImg = document.getElementById('aboutPortrait');
  if (aboutImg) {
    aboutImg.src = teacher.about.photo;
    aboutImg.alt = `${teacher.name} Profile`;
  }
}

/* Render Course Offerings */
function renderOfferings(teacher) {
  const container = document.getElementById('offeringsGrid');
  if (!container || !teacher.offerings) return;
  
  container.innerHTML = teacher.offerings.map(offering => `
    <div class="glass-card flex-center" style="flex-direction: column; text-align: center; gap: 1rem;">
      <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
        <svg style="width: 24px; height: 24px; color: var(--secondary-color);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      </div>
      <div style="font-family: var(--font-head); font-size: 0.8rem; letter-spacing: 2px; color: var(--secondary-color); font-weight: bold;">${offering.type}</div>
      <h3 style="font-family: var(--font-head); font-size: 1.5rem;">${offering.title}</h3>
      <p style="font-size: 0.9rem; opacity: 0.8; line-height: 1.6;">${offering.desc}</p>
      <span class="btn btn-sm btn-outline" style="pointer-events: none; margin-top: 0.5rem;">${offering.badge}</span>
    </div>
  `).join('');
}

/* Render Interactive Widgets */
function renderWidgets(teacher) {
  const widgetBox = document.getElementById('widgetWrapper');
  if (!widgetBox || !teacher.widgets) return;
  
  widgetBox.innerHTML = ''; // clear
  
  teacher.widgets.forEach(wType => {
    const div = document.createElement('div');
    div.id = `widget-${wType}`;
    widgetBox.appendChild(div);
    
    if (wType === 'graph-sketcher') {
      CLAZZ_WIDGETS.initGraphSketcher(div.id);
    } else if (wType === 'mcq-flashcards') {
      CLAZZ_WIDGETS.initFlashcards(div.id);
    } else if (wType === 'physics-simulator') {
      CLAZZ_WIDGETS.initPhysicsSimulator(div.id);
    }
  });
}

/* Render Syllabus Accordion */
function renderSyllabus(teacher) {
  const container = document.getElementById('syllabusAccordion');
  if (!container || !teacher.syllabus) return;
  
  container.innerHTML = teacher.syllabus.map((unit, i) => `
    <div class="glass-card" style="padding: 1.2rem; border-radius: 8px; margin-bottom: 0.8rem; cursor: pointer; transition: var(--transition-fast);" onclick="toggleSyllabus(this)">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4 style="font-family: var(--font-head); font-size: 1.05rem; font-weight: 600;">${unit.topic}</h4>
        <div class="accordion-arrow" style="transition: var(--transition-fast); transform: rotate(0deg);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
      <div class="accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; opacity: 0;">
        <div style="padding-top: 1rem; font-size: 0.9rem; opacity: 0.8; line-height: 1.6; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 0.8rem;">
          ${unit.desc}
        </div>
      </div>
    </div>
  `).join('');
}

window.toggleSyllabus = function(element) {
  const content = element.querySelector('.accordion-content');
  const arrow = element.querySelector('.accordion-arrow');
  
  if (content.style.maxHeight && content.style.maxHeight !== '0px') {
    content.style.maxHeight = '0px';
    content.style.opacity = '0';
    arrow.style.transform = 'rotate(0deg)';
  } else {
    // Close other items
    document.querySelectorAll('.accordion-content').forEach(c => {
      c.style.maxHeight = '0px';
      c.style.opacity = '0';
    });
    document.querySelectorAll('.accordion-arrow').forEach(a => {
      a.style.transform = 'rotate(0deg)';
    });
    
    content.style.maxHeight = content.scrollHeight + 'px';
    content.style.opacity = '1';
    arrow.style.transform = 'rotate(180deg)';
  }
};

/* Render Timetable */
function renderTimetable(teacher) {
  const container = document.getElementById('timetableRows');
  if (!container || !teacher.timetable) return;
  
  container.innerHTML = teacher.timetable.map(row => `
    <div class="tt-row" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem; min-width: 200px;">
        <div class="tt-dot"></div>
        <div class="tt-grade">${row.grade}</div>
      </div>
      <div style="font-family: var(--font-head); font-weight: 500; min-width: 120px;">${row.day.toUpperCase()}</div>
      <div class="tt-time" style="font-family: var(--font-head);">${row.time}</div>
      <div style="opacity: 0.8; font-size: 0.9rem;">${row.location}</div>
      <div style="font-family: var(--font-head); font-size: 0.85rem; font-weight: bold; color: var(--secondary-color);">${row.mode}</div>
      <span class="tt-status">${row.status}</span>
    </div>
  `).join('');
}

/* Render Testimonials */
function renderTestimonials(teacher) {
  const container = document.getElementById('testimonialGrid');
  if (!container) return;
  
  if (!teacher.testimonials || teacher.testimonials.length === 0) {
    document.getElementById('testimonialsSection').style.display = 'none';
    return;
  }
  
  container.innerHTML = teacher.testimonials.map(item => `
    <div class="glass-card" style="padding: 2rem; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
      <p style="font-style: italic; font-size: 0.95rem; line-height: 1.8; opacity: 0.9; margin-bottom: 1.5rem;">"${item.quote}"</p>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff;">
          ${item.name.charAt(0)}
        </div>
        <div>
          <h4 style="font-size: 0.9rem; font-weight: bold; color: #fff;">${item.name}</h4>
          <span style="font-size: 0.75rem; opacity: 0.7; color: var(--secondary-color); font-weight: bold;">${item.grade}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* Render LMS Portal Box */
function renderLMSBox(teacher) {
  const lmsSection = document.getElementById('lmsSection');
  if (!lmsSection) return;
  
  if (!teacher.contact.lms) {
    lmsSection.style.display = 'none';
    return;
  }
  
  const lmsCard = lmsSection.querySelector('.lms-card');
  if (lmsCard && teacher.theme === 'neon') {
    lmsCard.className += ' lms-box-neon';
  }
  
  const lmsBtn = document.getElementById('lmsPortalBtn');
  if (lmsBtn) lmsBtn.href = teacher.contact.lms;
}

/* Render Optional YouTube Video Showcase */
function renderYouTubeShowcase(teacher) {
  const section = document.getElementById('youtubeSection');
  const grid = document.getElementById('youtubeGrid');
  if (!section || !grid) return;
  
  if (!teacher.youtube || teacher.youtube.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  grid.innerHTML = teacher.youtube.map(videoUrl => {
    // Extract video ID from youtube URL
    let videoId = "";
    if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('watch?v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtube.com/embed/')) {
      videoId = videoUrl.split('embed/')[1].split('?')[0];
    }
    
    return `
      <div class="glass-card" style="padding: 1rem; border-radius: 12px; display: flex; flex-direction: column; gap: 0.8rem;">
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;">
          </iframe>
        </div>
      </div>
    `;
  }).join('');
}

/* Render Contact & WhatsApp Form Builder */
function renderContact(teacher) {
  const phoneLinks = document.querySelectorAll('.contact-phone-link');
  phoneLinks.forEach(link => {
    link.href = `tel:${teacher.contact.phone}`;
    link.textContent = teacher.contact.phone;
  });
  
  const waLinks = document.querySelectorAll('.contact-wa-link');
  waLinks.forEach(link => {
    link.href = `https://wa.me/${teacher.contact.whatsapp}`;
  });
  
  const locationText = document.getElementById('contactLocationText');
  if (locationText) {
    locationText.textContent = teacher.contact.location;
  }
  
  // Set up quick registration action
  const regForm = document.getElementById('quickRegForm');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const sName = document.getElementById('regName').value.trim();
      const sGrade = document.getElementById('regGrade').value;
      const sSchool = document.getElementById('regSchool').value.trim();
      const sMobile = document.getElementById('regPhone').value.trim();
      
      if (!sName || !sMobile) {
        alert('Please fill in the Name and Phone Number fields!');
        return;
      }
      
      // Build WhatsApp registry text
      const text = `Hi Sir, I'm registering for class.\n\n*Student Name:* ${sName}\n*Grade/Target:* ${sGrade}\n*School:* ${sSchool}\n*Contact Mobile:* ${sMobile}\n\nJoin request from Clazz Landing Page.`;
      const encodedText = encodeURIComponent(text);
      const waURL = `https://wa.me/${teacher.contact.whatsapp}?text=${encodedText}`;
      
      window.open(waURL, '_blank');
    });
  }
}

/* Render Footer */
function renderFooter(teacher) {
  document.getElementById('footerWordmark').textContent = teacher.name;
  document.getElementById('footerTagline').textContent = teacher.tagline;
  document.getElementById('footerCopyright').innerHTML = `&copy; 2026 ${teacher.name} Academy. All rights reserved.`;
}

/* Setup Custom Cursor */
function setupCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // ignore touchscreen
  
  // Add cursor elements to body
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('custom-cursor');
  
  let posX = 0, posY = 0;
  let mouseX = 0, mouseY = 0;
  
  // Position dot instantly, lag ring slightly for dynamic fluid effect
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });
  
  function updateRing() {
    // Linear interpolation
    posX += (mouseX - posX) * 0.15;
    posY += (mouseY - posY) * 0.15;
    ring.style.left = posX + 'px';
    ring.style.top = posY + 'px';
    requestAnimationFrame(updateRing);
  }
  requestAnimationFrame(updateRing);
  
  // Hover effect states
  const interactables = document.querySelectorAll('a, button, input, select, textarea, .glass-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

/* Floating symbols particle spawner */
function setupFloatingSymbols(symbols) {
  const container = document.createElement('div');
  container.className = 'math-symbols-container';
  document.body.appendChild(container);
  
  const symbolCount = 20;
  
  for (let i = 0; i < symbolCount; i++) {
    const symbol = document.createElement('div');
    symbol.className = 'math-symbol-item';
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Random sizes, positions and delays
    const size = Math.random() * 20 + 16; // 16px to 36px
    symbol.style.fontSize = `${size}px`;
    symbol.style.left = `${Math.random() * 100}%`;
    symbol.style.animationDuration = `${Math.random() * 15 + 15}s`; // 15s to 30s
    symbol.style.animationDelay = `${Math.random() * -30}s`; // instant offset
    symbol.style.opacity = Math.random() * 0.3 + 0.05;
    
    container.appendChild(symbol);
  }
}

/* Setup Scroll Reveal Animations */
function setupScrollAnimations() {
  const sections = document.querySelectorAll('section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  sections.forEach(sec => {
    sec.style.opacity = '0';
    sec.style.transform = 'translateY(30px)';
    sec.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(sec);
  });
}

/* Hide Preloader */
function setupPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 600);
  }
}

/* High-Performance Canvas Theme Background Particle Engine */
function setupThemeBgCanvas(theme) {
  const canvas = document.createElement('canvas');
  canvas.id = 'themeBgCanvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '-20';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  
  // Interactive inputs for molecules rotation speed boost
  let mouse = { x: 0, y: 0, speed: 0 };
  let lastMouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    const dx = mouse.x - lastMouse.x;
    const dy = mouse.y - lastMouse.y;
    mouse.speed = Math.min(Math.sqrt(dx*dx + dy*dy), 40);
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  });

  let scrollSpeed = 0;
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastScroll;
    scrollSpeed = Math.min(Math.abs(dy), 50);
    lastScroll = window.scrollY;
  });
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particleCount = theme === 'neon' ? 45 : (theme === 'cyber' ? 50 : (theme === 'lux' ? 20 : (theme === 'minimal' ? 12 : (theme === 'terminal' ? 40 : (theme === 'prism' ? 15 : (theme === 'heritage' ? 8 : (theme === 'smart-kids' ? 22 : (theme === 'pastel' ? 10 : 35))))))));
  
  // Set up particles (only if the theme uses them)
  if (theme !== 'calm-scholar') {
    for (let i = 0; i < particleCount; i++) {
      const p = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (theme === 'cyber' ? 1.2 : (theme === 'minimal' ? 0.25 : (theme === 'smart-kids' ? 2.2 : 0.6))),
        vy: (Math.random() - 0.5) * (theme === 'cyber' ? 1.2 : (theme === 'minimal' ? 0.25 : (theme === 'smart-kids' ? 2.2 : 0.6))) - (theme === 'chalk' ? 0.15 : 0),
        radius: theme === 'lux' ? Math.random() * 20 + 6 : (theme === 'minimal' ? Math.random() * 2 + 0.8 : (theme === 'pastel' ? Math.random() * 35 + 25 : Math.random() * 3.5 + 1.2)),
        color: getParticleColor(theme),
        alpha: Math.random() * 0.45 + 0.1
      };
      
      // Theme-specific configurations
      if (theme === 'prism') {
        p.type = ['h2o', 'benzene', 'co2'][Math.floor(Math.random() * 3)];
        p.rotation = Math.random() * Math.PI * 2;
        p.rotSpeed = (Math.random() - 0.5) * 0.006;
        p.vx = (Math.random() - 0.5) * 0.4;
        p.vy = (Math.random() - 0.5) * 0.4;
        p.color = Math.random() > 0.5 ? '#06b6d4' : '#ec4899'; // Cyan / Pink
      } else if (theme === 'heritage') {
        p.radius = Math.random() * 15 + 5;
        p.maxRadius = Math.random() * 70 + 35;
        p.growSpeed = Math.random() * 0.1 + 0.04;
        p.vx = 0;
        p.vy = 0;
        p.alpha = Math.random() * 0.25 + 0.08;
        p.color = '#450a0a'; // Sepia Ink stain
      } else if (theme === 'terminal') {
        p.vx = 0;
        p.vy = Math.random() * 1.2 + 0.4; // downward rain
        p.char = ['0', '1', ';', '{', '}', '[', ']', '<', '>', '/', '_', '$', '?', '+'][Math.floor(Math.random() * 14)];
        p.color = Math.random() > 0.35 ? '#10b981' : '#f59e0b';
        p.size = Math.random() * 5 + 10;
      } else if (theme === 'smart-kids') {
        p.radius = Math.random() * 12 + 6;
        p.color = ['#FFD166', '#118AB2', '#FF6B6B', '#06D6A0'][Math.floor(Math.random() * 4)];
        p.alpha = Math.random() * 0.35 + 0.25;
      } else if (theme === 'pastel') {
        p.color = ['#A0C4FF', '#BDB2FF', '#FFADAD', '#FDFFB6'][Math.floor(Math.random() * 4)];
        p.alpha = Math.random() * 0.14 + 0.04;
      }
      
      particles.push(p);
    }
  }

  function getParticleColor(theme) {
    if (theme === 'neon') {
      return Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4';
    } else if (theme === 'cyber') {
      return Math.random() > 0.5 ? '#00ffa3' : '#00e5ff';
    } else if (theme === 'lux') {
      return '#b45309';
    } else if (theme === 'minimal') {
      return '#cbd5e1';
    } else {
      return '#ffffff';
    }
  }

  // Draw Rotating Molecular Structure
  function drawMolecule(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    ctx.lineWidth = 1.5;
    
    if (p.type === 'h2o') {
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, 12);
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-12, 12, 3.5, 0, Math.PI * 2);
      ctx.arc(12, 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'co2') {
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-15, -2); ctx.lineTo(15, -2);
      ctx.moveTo(-15, 2); ctx.lineTo(15, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-15, 0, 4.5, 0, Math.PI * 2);
      ctx.arc(15, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = Math.cos(angle) * 15;
        const hy = Math.sin(angle) * 15;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.setLineDash([2, 2.5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Calm Scholar organic sine waves
    if (theme === 'calm-scholar') {
      ctx.lineWidth = 2.5;
      const time = Date.now() * 0.0006;
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 214, 160, ${0.055 - w * 0.015})`;
        const freq = 0.002 + w * 0.0008;
        const amp = 40 - w * 10;
        const phase = time * (1.0 + w * 0.25);
        
        for (let x = 0; x < canvas.width; x += 15) {
          const y = canvas.height * 0.5 + Math.sin(x * freq + phase) * amp + Math.cos(x * 0.0008 + phase) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // Draw Plexus connections for Neon and Cyber
    if (theme === 'neon' || theme === 'cyber') {
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 125) {
            const alpha = (1 - dist / 125) * 0.14;
            ctx.strokeStyle = theme === 'neon' ? `rgba(6, 182, 212, ${alpha})` : `rgba(0, 255, 163, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw and update particles
    particles.forEach(p => {
      if (theme === 'prism') {
        p.rotation += p.rotSpeed + (mouse.speed * 0.0006) + (scrollSpeed * 0.001);
        drawMolecule(p);
        p.x += p.vx;
        p.y += p.vy;
      } else if (theme === 'heritage') {
        p.radius += p.growSpeed;
        p.alpha -= 0.0004;
        
        const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(69, 10, 10, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(69, 10, 10, ${p.alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(69, 10, 10, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.radius = Math.random() * 10 + 4;
          p.alpha = Math.random() * 0.22 + 0.08;
        }
      } else if (theme === 'terminal') {
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px monospace`;
        ctx.globalAlpha = p.alpha;
        ctx.fillText(p.char, p.x, p.y);
        ctx.globalAlpha = 1.0;
        
        p.y += p.vy;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
          p.char = ['0', '1', ';', '{', '}', '[', ']', '<', '>', '/', '_', '$', '?', '+'][Math.floor(Math.random() * 14)];
        }
      } else if (theme === 'smart-kids') {
        // Energetic bouncing bubbles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounce off walls
        if (p.x - p.radius < 0 || p.x + p.radius > canvas.width) p.vx *= -1;
        if (p.y - p.radius < 0 || p.y + p.radius > canvas.height) p.vy *= -1;
      } else if (theme === 'pastel') {
        // Soft pastel blurred balloons
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 30;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        
        p.x += p.vx;
        p.y += p.vy;
      } else {
        // Default dots (Neon, Cyber, Lux, Chalk, Minimal)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        if (theme === 'lux') {
          ctx.fillStyle = `rgba(180, 83, 9, ${p.alpha * 0.25})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#b45309';
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        
        p.x += p.vx;
        p.y += p.vy;
      }

      // Bounds wrapping (except heritage, terminal, and bouncing kids)
      if (theme !== 'heritage' && theme !== 'terminal' && theme !== 'smart-kids' && theme !== 'calm-scholar') {
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
    });

    animationId = requestAnimationFrame(step);
  }

  step();
  
  // Clean up
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
  });
}

/* Synthwave Terminal Typewriter Animator */
function runTerminalTypewriter(element, text, cursorElement) {
  let i = 0;
  const speed = 65;
  
  function type() {
    if (i < text.length) {
      const char = text.charAt(i);
      const textNode = document.createTextNode(char);
      element.insertBefore(textNode, cursorElement);
      i++;
      setTimeout(type, speed);
    }
  }
  
  setTimeout(type, 400);
}
