/* Clazz Wow Interactive Widgets Library
   ========================================================================== */

const CLAZZ_WIDGETS = {
  /**
   * Initialize Graph Sketcher (For Mathematics)
   * Draws y = ax^2 + bx + c and lets users adjust sliders.
   * @param {string} containerId - The container element ID.
   */
  initGraphSketcher: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="widget-card glass" style="padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
        <h4 style="margin-bottom: 0.8rem; font-family: var(--font-head); font-size: 1.1rem; color: #fff;">Interactive Graph Sketcher</h4>
        <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 1.2rem; color: #eee;">Adjust the sliders to study the quadratic function <code>y = ax² + bx + c</code> in real-time!</p>
        
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem;">
          <div style="position: relative;">
            <canvas id="graphCanvas" style="background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); width: 100%; aspect-ratio: 1; display: block;"></canvas>
          </div>
          
          <div style="display: flex; flex-direction: column; justify-content: center; gap: 1rem;">
            <div style="font-family: var(--font-head); font-size: 1rem; color: var(--accent-color, #8b5cf6); font-weight: bold; text-align: center; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem;">
              y = <span id="valA">1.0</span>x² + <span id="valB">0.0</span>x + <span id="valC">0.0</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-head);">
                <span>Coefficient a (Width/Direction)</span>
                <span id="labelA" style="font-weight: bold;">1.0</span>
              </div>
              <input type="range" id="sliderA" min="-3" max="3" step="0.1" value="1" style="width: 100%; cursor: pointer;">
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-head);">
                <span>Coefficient b (Horizontal shift)</span>
                <span id="labelB" style="font-weight: bold;">0.0</span>
              </div>
              <input type="range" id="sliderB" min="-5" max="5" step="0.2" value="0" style="width: 100%; cursor: pointer;">
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-head);">
                <span>Coefficient c (y-intercept)</span>
                <span id="labelC" style="font-weight: bold;">0.0</span>
              </div>
              <input type="range" id="sliderC" min="-80" max="80" step="2" value="0" style="width: 100%; cursor: pointer;">
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    
    const sliderA = document.getElementById('sliderA');
    const sliderB = document.getElementById('sliderB');
    const sliderC = document.getElementById('sliderC');
    
    const labelA = document.getElementById('labelA');
    const labelB = document.getElementById('labelB');
    const labelC = document.getElementById('labelC');
    
    const valA = document.getElementById('valA');
    const valB = document.getElementById('valB');
    const valC = document.getElementById('valC');
    
    // Scale canvas resolution for high-DPI displays
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.width * window.devicePixelRatio;
      drawGraph();
    }

    function drawGraph() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      
      const scaleX = w / 20; // 20 units total (-10 to 10)
      const scaleY = h / 200; // 200 units total (-100 to 100)
      const originX = w / 2;
      const originY = h / 2;
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let x = -10; x <= 10; x++) {
        const cx = originX + x * scaleX;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let y = -100; y <= 100; y += 10) {
        const cy = originY - y * scaleY;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();
      }
      
      // Draw Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      
      // X-Axis
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(w, originY);
      ctx.stroke();
      
      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, h);
      ctx.stroke();
      
      // Read coefficient values
      const a = parseFloat(sliderA.value);
      const b = parseFloat(sliderB.value);
      const c = parseFloat(sliderC.value);
      
      // Update displays
      labelA.textContent = a.toFixed(1);
      labelB.textContent = b.toFixed(1);
      labelC.textContent = c.toFixed(0);
      
      valA.textContent = a.toFixed(1);
      valB.textContent = (b >= 0 ? '+ ' : '- ') + Math.abs(b).toFixed(1);
      valC.textContent = (c >= 0 ? '+ ' : '- ') + Math.abs(c).toFixed(0);
      
      // Draw quadratic curve: y = ax^2 + bx + c
      ctx.beginPath();
      ctx.strokeStyle = window.themeAccentColor || '#06b6d4';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      
      let first = true;
      for (let px = 0; px <= w; px++) {
        // Calculate math x coordinate
        const x = (px - originX) / scaleX;
        // Calculate math y coordinate
        const y = a * x * x + b * x + c;
        // Convert to canvas pixel y
        const py = originY - y * scaleY;
        
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      
      // Add subtle glow under the curve
      ctx.shadowBlur = 15;
      ctx.shadowColor = window.themeAccentColor || '#06b6d4';
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
      
      // Draw Y-intercept point
      ctx.beginPath();
      ctx.arc(originX, originY - c * scaleY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899'; // Highlight point in pink
      ctx.fill();
    }

    // Set up events
    sliderA.addEventListener('input', drawGraph);
    sliderB.addEventListener('input', drawGraph);
    sliderC.addEventListener('input', drawGraph);
    
    window.addEventListener('resize', resizeCanvas);
    
    // Initial render
    setTimeout(resizeCanvas, 200);
  },

  /**
   * Initialize MCQ Flashcards (For Biology / general quizzes)
   */
  initFlashcards: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const questions = [
      {
        q: "Which cell organelle is known as the powerhouse of the cell?",
        a: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"],
        correct: 2,
        explain: "The mitochondria are responsible for cellular respiration and generating ATP (energy molecules), making them the cellular powerhouse."
      },
      {
        q: "What is the primary product of photosynthesis in plants?",
        a: ["Oxygen & Glucose", "Carbon Dioxide", "Water & Starch", "Nitrate"],
        correct: 0,
        explain: "Photosynthesis uses sunlight, water, and CO2 to yield Glucose (chemical energy) and Oxygen (released as a byproduct)."
      }
    ];

    let currentIdx = 0;

    function renderCard() {
      const qData = questions[currentIdx];
      container.innerHTML = `
        <div class="widget-card glass" style="padding: 1.5rem; border-radius: 12px; max-width: 500px; margin: 1rem auto; overflow: hidden;">
          <h4 style="margin-bottom: 0.8rem; font-family: var(--font-head); font-size: 1.1rem; color: #fff; text-align: center;">Biological MCQ Trainer</h4>
          <div class="flashcard-container" style="perspective: 1000px; min-height: 280px; position: relative;">
            <div id="flashCardInner" style="width: 100%; height: 100%; position: absolute; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;">
              
              <!-- Front of the Card -->
              <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.8rem; opacity: 0.7; font-family: var(--font-head); text-transform: uppercase; margin-bottom: 0.5rem;">Question ${currentIdx + 1} of ${questions.length}</div>
                  <p style="font-weight: 500; margin-bottom: 1.2rem; font-size: 0.95rem; color: #fff;">${qData.q}</p>
                  
                  <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                    ${qData.a.map((opt, i) => `
                      <button class="opt-btn" data-index="${i}" style="width: 100%; text-align: left; padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: #fff; font-size: 0.85rem; transition: var(--transition-fast); cursor: pointer;">
                        ${String.fromCharCode(65 + i)}. ${opt}
                      </button>
                    `).join('')}
                  </div>
                </div>
                <div style="text-align: center; font-size: 0.75rem; opacity: 0.6; margin-top: 1rem;">Click options to choose, or flip to verify</div>
              </div>
              
              <!-- Back of the Card -->
              <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg); background: rgba(0, 255, 163, 0.05); border: 1px solid rgba(0, 255, 163, 0.2); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="color: var(--accent-color, #00ffa3); font-weight: bold; font-family: var(--font-head); font-size: 1.1rem; margin-bottom: 0.5rem;">Explanation</div>
                  <div style="font-weight: 500; font-size: 0.9rem; color: #fff; margin-bottom: 0.8rem;">Correct Answer: <span style="color: var(--accent-color, #00ffa3); font-weight: bold;">${String.fromCharCode(65 + qData.correct)}. ${qData.a[qData.correct]}</span></div>
                  <p style="font-size: 0.85rem; line-height: 1.5; opacity: 0.9; color: #eee;">${qData.explain}</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                  <button id="flipBackBtn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #fff; cursor: pointer;">Question</button>
                  <button id="nextCardBtn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 4px; border: none; background: var(--accent-color, #00ffa3); color: #001a10; font-weight: bold; cursor: pointer;">Next Question &rarr;</button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      `;

      const cardInner = document.getElementById('flashCardInner');
      const optBtns = container.querySelectorAll('.opt-btn');
      
      optBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation(); // Stop card flipping on option click
          const selectedIdx = parseInt(this.getAttribute('data-index'));
          
          optBtns.forEach(b => {
            b.style.borderColor = 'rgba(255,255,255,0.1)';
            b.style.background = 'rgba(255,255,255,0.02)';
          });
          
          if (selectedIdx === qData.correct) {
            this.style.borderColor = '#00ffa3';
            this.style.background = 'rgba(0, 255, 163, 0.1)';
            // Flip card to explanation after 800ms
            setTimeout(() => {
              cardInner.style.transform = 'rotateY(180deg)';
            }, 800);
          } else {
            this.style.borderColor = '#ff2e9a';
            this.style.background = 'rgba(255, 46, 154, 0.1)';
            setTimeout(() => {
              cardInner.style.transform = 'rotateY(180deg)';
            }, 1000);
          }
        });
      });

      cardInner.addEventListener('click', function() {
        if (this.style.transform === 'rotateY(180deg)') {
          this.style.transform = 'rotateY(0deg)';
        } else {
          this.style.transform = 'rotateY(180deg)';
        }
      });

      document.getElementById('flipBackBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        cardInner.style.transform = 'rotateY(0deg)';
      });

      document.getElementById('nextCardBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        currentIdx = (currentIdx + 1) % questions.length;
        renderCard();
      });
    }

    renderCard();
  },

  /**
   * Initialize Physics Pendulum / Gravity Simulator
   */
  initPhysicsSimulator: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="widget-card glass" style="padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
        <h4 style="margin-bottom: 0.8rem; font-family: var(--font-head); font-size: 1.1rem; color: #fff;">Quantum Pendulum Simulator</h4>
        <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 1.2rem; color: #eee;">Interact with physical laws. Drag values to see the effect on simple harmonic oscillation.</p>
        
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem;">
          <div style="position: relative;">
            <canvas id="physicsCanvas" style="background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); width: 100%; aspect-ratio: 1.2; display: block;"></canvas>
          </div>
          
          <div style="display: flex; flex-direction: column; justify-content: center; gap: 1.2rem;">
            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-head);">
                <span>Pendulum Length (m)</span>
                <span id="labelLen" style="font-weight: bold; color: var(--accent-color, #06b6d4);">1.5m</span>
              </div>
              <input type="range" id="sliderLen" min="0.8" max="2.2" step="0.1" value="1.5" style="width: 100%; cursor: pointer;">
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-head);">
                <span>Gravity Acceleration (g)</span>
                <span id="labelGrav" style="font-weight: bold; color: var(--accent-color, #06b6d4);">9.8 m/s²</span>
              </div>
              <input type="range" id="sliderGrav" min="1.6" max="25" step="0.2" value="9.8" style="width: 100%; cursor: pointer;">
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-head);">
                <span>Energy Friction / Dampening</span>
                <span id="labelDamp" style="font-weight: bold; color: var(--accent-color, #06b6d4);">0%</span>
              </div>
              <input type="range" id="sliderDamp" min="0" max="0.05" step="0.005" value="0.005" style="width: 100%; cursor: pointer;">
            </div>
            
            <button id="resetPendulum" style="padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; font-family: var(--font-head); font-weight: 600; cursor: pointer; font-size: 0.8rem; transition: var(--transition-fast);">
              Reset Angle
            </button>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById('physicsCanvas');
    const ctx = canvas.getContext('2d');
    
    const sliderLen = document.getElementById('sliderLen');
    const sliderGrav = document.getElementById('sliderGrav');
    const sliderDamp = document.getElementById('sliderDamp');
    const resetBtn = document.getElementById('resetPendulum');
    
    const labelLen = document.getElementById('labelLen');
    const labelGrav = document.getElementById('labelGrav');
    const labelDamp = document.getElementById('labelDamp');

    let animationFrameId;
    
    // Physics variables
    let angle = Math.PI / 4; // Initial angle (45 degrees)
    let angleVelocity = 0.0;
    let angleAcceleration = 0.0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.width * (1 / 1.2) * window.devicePixelRatio;
    }

    function step() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const length = parseFloat(sliderLen.value);
      const gravity = parseFloat(sliderGrav.value);
      const damp = parseFloat(sliderDamp.value);

      labelLen.textContent = length.toFixed(1) + 'm';
      labelGrav.textContent = gravity.toFixed(1) + ' m/s²';
      labelDamp.textContent = (damp * 1000).toFixed(0) + '%';

      // Pendulum calculations
      // Acceleration = - (g / L) * sin(theta)
      // We scale the timestep relative to frames (approx 1/60s)
      const scaleFactor = 15; // Speed multiplier for animation aesthetics
      const dt = 0.016 * scaleFactor;
      
      angleAcceleration = (-1 * (gravity / (length * 10))) * Math.sin(angle);
      angleVelocity += angleAcceleration * dt;
      angleVelocity *= (1 - damp); // apply dampening/friction
      angle += angleVelocity * dt;

      // Coordinate systems
      const originX = w / 2;
      const originY = h * 0.15;
      const pixelLength = length * (h * 0.35); // scale length to pixels

      const bobX = originX + pixelLength * Math.sin(angle);
      const bobY = originY + pixelLength * Math.cos(angle);

      // Draw Support Pivot
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Draw String
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw path trailing outline
      ctx.beginPath();
      ctx.arc(originX, originY, pixelLength, Math.PI / 2 - Math.PI / 4, Math.PI / 2 + Math.PI / 4);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Draw Bob (weighted mass) with cyan/purple radial glow
      const radius = 18;
      ctx.beginPath();
      ctx.arc(bobX, bobY, radius, 0, Math.PI * 2);
      
      // Radial glow gradient inside bob
      const radGrad = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, radius);
      radGrad.addColorStop(0, '#fff');
      radGrad.addColorStop(0.3, window.themeAccentColor || '#06b6d4');
      radGrad.addColorStop(1, 'rgba(0, 85, 255, 0.2)');
      
      ctx.fillStyle = radGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = window.themeAccentColor || '#06b6d4';
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      animationFrameId = requestAnimationFrame(step);
    }

    resetBtn.addEventListener('click', () => {
      angle = Math.PI / 4;
      angleVelocity = 0;
      angleAcceleration = 0;
    });

    window.addEventListener('resize', resize);
    
    resize();
    step();

    // Clean up animation on container destruction
    container.addEventListener('destroyed', () => {
      cancelAnimationFrame(animationFrameId);
    });
  }
};
