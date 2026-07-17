/* Clazz Hub & Customizer Control Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Set up Teacher Filters
  setupTeacherFilters();
  
  // 2. Set up Creator Form Event Listeners
  setupCreatorForm();
  
  // 3. Bind Teacher Card Action Buttons
  setupTeacherCardActions();

  // 4. Initialize Custom Select Theme Dropdown
  initCustomSelect();
});

/* Hub directory filters */
function setupTeacherFilters() {
  const tabs = document.querySelectorAll('.hub-filter-tab');
  const cards = document.querySelectorAll('.teacher-hub-card');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active tab style
      tabs.forEach(t => t.classList.remove('active', 'btn-primary'));
      tabs.forEach(t => t.classList.add('btn-outline'));
      
      tab.classList.remove('btn-outline');
      tab.classList.add('active', 'btn-primary');
      
      const filter = tab.getAttribute('data-filter');
      
      cards.forEach(card => {
        const subject = card.getAttribute('data-subject').toLowerCase();
        if (filter === 'all' || subject === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* Creator Form sync */
function setupCreatorForm() {
  const form = document.getElementById('hubCreatorForm');
  const iframe = document.getElementById('previewIframe');
  if (!form || !iframe) return;
  
  const inputs = form.querySelectorAll('input, select, textarea');
  
  // Update preview on inputs change
  inputs.forEach(input => {
    input.addEventListener('input', debounce(updatePreview, 600));
  });
  
  // Initial build and preview compile
  updatePreview();
}

function updatePreview() {
  const iframe = document.getElementById('previewIframe');
  if (!iframe) return;
  
  // Gather values from form
  const name = document.getElementById('creName').value.trim() || "Mr. Custom Teacher";
  const subject = document.getElementById('creSub').value.trim() || "Mathematics";
  const tagline = document.getElementById('creTag').value.trim() || "අපේ සොඳුරු පංතිය";
  const theme = document.getElementById('creTheme').value;
  const phone = document.getElementById('crePhone').value.trim() || "0703964107";
  const location = document.getElementById('creLoc').value.trim() || "Sudarshi - Weyangoda";
  const lms = document.getElementById('creLms').value.trim() || "";
  const heroPhoto = document.getElementById('creHeroPhoto').value.trim() || "assets/oshan-sir-suit.jpg";
  const aboutPhoto = document.getElementById('creAboutPhoto').value.trim() || "assets/oshan-sir-stool.jpg";
  
  // Gather check box widgets
  const widgets = [];
  if (document.getElementById('wGraph').checked) widgets.push('graph-sketcher');
  if (document.getElementById('wMCQ').checked) widgets.push('mcq-flashcards');
  if (document.getElementById('wPhysics').checked) widgets.push('physics-simulator');

  // Map theme colors
  let accent = '#8b5cf6';
  let secondary = '#06b6d4';
  
  if (theme === 'chalk') {
    accent = '#00e5ff';
    secondary = '#ffea00';
  } else if (theme === 'cyber') {
    accent = '#00ffa3';
    secondary = '#00e5ff';
  } else if (theme === 'lux') {
    accent = '#b45309';
    secondary = '#0b192f';
  } else if (theme === 'minimal') {
    accent = '#111111';
    secondary = '#888888';
  } else if (theme === 'terminal') {
    accent = '#f59e0b';
    secondary = '#10b981';
  } else if (theme === 'prism') {
    accent = '#06b6d4';
    secondary = '#ec4899';
  } else if (theme === 'heritage') {
    accent = '#b45309';
    secondary = '#450a0a';
  } else if (theme === 'smart-kids') {
    accent = '#FFD166';
    secondary = '#118AB2';
  } else if (theme === 'calm-scholar') {
    accent = '#06D6A0';
    secondary = '#1e293b';
  } else if (theme === 'pastel') {
    accent = '#BDB2FF';
    secondary = '#A0C4FF';
  }

  // Compile JSON configuration
  const customConfig = {
    name: name,
    subject: subject,
    subheading: `${subject} Class`,
    tagline: tagline,
    theme: theme,
    accentColor: accent,
    secondaryColor: secondary,
    contact: {
      phone: phone,
      whatsapp: '94' + phone.replace(/^0/, ''),
      location: location,
      lms: lms
    },
    stats: [
      { val: "10", suffix: "+", label: "Years Experience" },
      { val: "2000", suffix: "+", label: "Students Taught" },
      { val: "100", suffix: "%", label: "Pass Rate" }
    ],
    about: {
      title: "Interactive Learning Journey",
      subtitle: `${name} — Dedicated Educator`,
      bio: `Learn ${subject} from ${name}. Bringing years of professional classroom experience to deliver theory and targeted papers discussion in Gampaha/Weyangoda. Flexible batches available.`,
      photo: aboutPhoto
    },
    heroPhoto: heroPhoto,
    widgets: widgets,
    offerings: [
      { type: "THEORY", title: "Theory Sessions", desc: `Full curriculum breakdown for ${subject} with structured notes.`, badge: "All Levels" },
      { type: "PAPER CLASS", title: "Paper Discussions", desc: "Mock exam practices, past papers reviews, and model question coverage.", badge: "Exam Targeted" }
    ],
    syllabus: [
      { topic: "Module 01 - Basics", desc: "Foundational concepts and formulas breakdown." },
      { topic: "Module 02 - Intermediate", desc: "Core exercises and problem solving methodologies." },
      { topic: "Module 03 - Advanced", desc: "Mock test scenarios and past papers reviews." }
    ],
    timetable: [
      { grade: "Batch A", day: "Saturday", time: "09.00 AM - 11.30 AM", location: location, mode: "Physical", status: "Ongoing" },
      { grade: "Batch B", day: "Sunday", time: "02.00 PM - 04.30 PM", location: location, mode: "Online Zoom", status: "Ongoing" }
    ],
    testimonials: []
  };

  // Save to LocalStorage
  localStorage.setItem('clazz_custom_preview', JSON.stringify(customConfig));
  
  // Reload Iframe
  iframe.src = 'template.html?t=custom';
}

/* Edit actions on hub directory cards */
function setupTeacherCardActions() {
  const editButtons = document.querySelectorAll('.btn-edit-teacher');
  
  editButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const tKey = this.getAttribute('data-teacher');
      const teacherData = window.CLAZZ_TEACHERS[tKey];
      
      if (!teacherData) return;
      
      // Populate form fields
      document.getElementById('creName').value = teacherData.name;
      document.getElementById('creSub').value = teacherData.subject;
      document.getElementById('creTag').value = teacherData.tagline;
      document.getElementById('crePhone').value = teacherData.contact.phone;
      document.getElementById('creLoc').value = teacherData.contact.location;
      document.getElementById('creLms').value = teacherData.contact.lms || "";
      document.getElementById('creHeroPhoto').value = teacherData.heroPhoto || "assets/oshan-sir-suit.jpg";
      document.getElementById('creAboutPhoto').value = teacherData.about.photo || "assets/oshan-sir-stool.jpg";
      
      // Update custom select dropdown display
      const customThemeText = {
        "neon": "Glassmorphic Neon (Vibrant Space/Math)",
        "chalk": "Chalkboard Blackboard (Chalk/Handwritten)",
        "cyber": "Cyber Bio-Verse (Neon Cyberpunk/Biology)",
        "lux": "Luxury Academic (Gold/Navy/Commerce)",
        "minimal": "Minimalist Zen (Apple-Style/Clean)",
        "terminal": "Synthwave Terminal (Retro-Tech/ICT)",
        "prism": "Liquid Prism (Molecular/Chemistry)",
        "heritage": "Classic Heritage (Ink & Gold/Literature)",
        "smart-kids": "Smart Kids (Playful / Yellow-Blue)",
        "calm-scholar": "Calm Scholar (Mint Green / Stress-Free)",
        "pastel": "Pastel Wonder (Baby Blue-Lavender / Soft)"
      };
      document.getElementById('creTheme').value = teacherData.theme;
      document.getElementById('selectedThemeText').textContent = customThemeText[teacherData.theme] || "Select Styling Theme";
      
      const customOpts = document.querySelectorAll('.custom-option');
      customOpts.forEach(opt => {
        if (opt.getAttribute('data-value') === teacherData.theme) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
      
      // Setup widget checkboxes
      document.getElementById('wGraph').checked = teacherData.widgets ? teacherData.widgets.includes('graph-sketcher') : false;
      document.getElementById('wMCQ').checked = teacherData.widgets ? teacherData.widgets.includes('mcq-flashcards') : false;
      document.getElementById('wPhysics').checked = teacherData.widgets ? teacherData.widgets.includes('physics-simulator') : false;
      
      // Update preview and scroll to previewer section
      updatePreview();
      document.getElementById('creator-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Debounce helper to prevent excessive iframe reloads while typing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* Custom Select Dropdown UI Engine */
window.toggleCustomSelect = function(e) {
  if (e) e.stopPropagation();
  const optionsList = document.getElementById('themeOptionsList');
  const chevron = document.getElementById('themeChevron');
  if (!optionsList) return;
  
  const isOpen = optionsList.style.display === 'flex';
  optionsList.style.display = isOpen ? 'none' : 'flex';
  if (chevron) {
    chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  }
};

window.selectCustomOption = function(e, val) {
  if (e) e.stopPropagation();
  const optionsList = document.getElementById('themeOptionsList');
  const chevron = document.getElementById('themeChevron');
  const hiddenInput = document.getElementById('creTheme');
  const selectedText = document.getElementById('selectedThemeText');
  const options = document.querySelectorAll('.custom-option');
  
  if (hiddenInput) hiddenInput.value = val;
  
  const customThemeText = {
    "neon": "Glassmorphic Neon (Vibrant Space/Math)",
    "chalk": "Chalkboard Blackboard (Chalk/Handwritten)",
    "cyber": "Cyber Bio-Verse (Neon Cyberpunk/Biology)",
    "lux": "Luxury Academic (Gold/Navy/Commerce)",
    "minimal": "Minimalist Zen (Apple-Style/Clean)",
    "terminal": "Synthwave Terminal (Retro-Tech/ICT)",
    "prism": "Liquid Prism (Molecular/Chemistry)",
    "heritage": "Classic Heritage (Ink & Gold/Literature)",
    "smart-kids": "Smart Kids (Playful / Yellow-Blue)",
    "calm-scholar": "Calm Scholar (Mint Green / Stress-Free)",
    "pastel": "Pastel Wonder (Baby Blue-Lavender / Soft)"
  };
  
  if (selectedText) {
    selectedText.textContent = customThemeText[val] || "Select Styling Theme";
  }
  
  options.forEach(opt => {
    if (opt.getAttribute('data-value') === val) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
  
  if (optionsList) optionsList.style.display = 'none';
  if (chevron) chevron.style.transform = 'rotate(0deg)';
  
  // Force update preview
  updatePreview();
};

function initCustomSelect() {
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    const optionsList = document.getElementById('themeOptionsList');
    const chevron = document.getElementById('themeChevron');
    if (optionsList) optionsList.style.display = 'none';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  });
}

window.copyConfigJSON = function() {
  const name = document.getElementById('creName').value.trim() || "Mr. Custom Teacher";
  const subject = document.getElementById('creSub').value.trim() || "Mathematics";
  const tagline = document.getElementById('creTag').value.trim() || "අපේ සොඳුරු පංතිය";
  const theme = document.getElementById('creTheme').value;
  const phone = document.getElementById('crePhone').value.trim() || "0703964107";
  const location = document.getElementById('creLoc').value.trim() || "Sudarshi - Weyangoda";
  const lms = document.getElementById('creLms').value.trim() || "";
  const heroPhoto = document.getElementById('creHeroPhoto').value.trim() || "assets/oshan-sir-suit.jpg";
  const aboutPhoto = document.getElementById('creAboutPhoto').value.trim() || "assets/oshan-sir-stool.jpg";
  
  const widgets = [];
  if (document.getElementById('wGraph').checked) widgets.push('graph-sketcher');
  if (document.getElementById('wMCQ').checked) widgets.push('mcq-flashcards');
  if (document.getElementById('wPhysics').checked) widgets.push('physics-simulator');

  let accent = '#8b5cf6';
  let secondary = '#06b6d4';
  if (theme === 'chalk') { accent = '#00e5ff'; secondary = '#ffea00'; }
  else if (theme === 'cyber') { accent = '#00ffa3'; secondary = '#00e5ff'; }
  else if (theme === 'lux') { accent = '#b45309'; secondary = '#0b192f'; }
  else if (theme === 'minimal') { accent = '#111111'; secondary = '#888888'; }
  else if (theme === 'terminal') { accent = '#f59e0b'; secondary = '#10b981'; }
  else if (theme === 'prism') { accent = '#06b6d4'; secondary = '#ec4899'; }
  else if (theme === 'heritage') { accent = '#b45309'; secondary = '#450a0a'; }
  else if (theme === 'smart-kids') { accent = '#FFD166'; secondary = '#118AB2'; }
  else if (theme === 'calm-scholar') { accent = '#06D6A0'; secondary = '#1e293b'; }
  else if (theme === 'pastel') { accent = '#BDB2FF'; secondary = '#A0C4FF'; }

  const customConfig = {
    name: name,
    subject: subject,
    subheading: `${subject} Class`,
    tagline: tagline,
    theme: theme,
    accentColor: accent,
    secondaryColor: secondary,
    contact: {
      phone: phone,
      whatsapp: '94' + phone.replace(/^0/, ''),
      location: location,
      lms: lms
    },
    stats: [
      { val: "10", suffix: "+", label: "Years Experience" },
      { val: "2000", suffix: "+", label: "Students Taught" },
      { val: "100", suffix: "%", label: "Pass Rate" }
    ],
    about: {
      title: "Interactive Learning Journey",
      subtitle: `${name} — Dedicated Educator`,
      bio: `Learn ${subject} from ${name}.`,
      photo: aboutPhoto
    },
    heroPhoto: heroPhoto,
    widgets: widgets
  };

  navigator.clipboard.writeText(JSON.stringify(customConfig, null, 2))
    .then(() => {
      alert("Config JSON copied to clipboard! You can paste it into js/config.js or send it to me to save it permanently.");
    })
    .catch(err => {
      console.error("Could not copy text: ", err);
    });
};
