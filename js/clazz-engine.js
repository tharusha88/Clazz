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
  
  document.getElementById('heroTagline').textContent = teacher.tagline;
  document.getElementById('heroSubhead').textContent = `Structured curriculum for aspiring achievers. Conducted at ${teacher.contact.location}.`;
  
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
