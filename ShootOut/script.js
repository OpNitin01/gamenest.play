/*
         Neon Shooter - single file
         Controls: Mouse move to aim; Click or Space to shoot. Arrow keys / A D to move.
         Features: enemies spawn, neon visuals, particles, scoring, levels, pause/mute/restart
        */
        (() => {
            const canvas = document.getElementById('game');
            const gamebox = document.getElementById('gamebox');
            const overlay = document.getElementById('overlay');
            const startMsg = document.getElementById('startMsg');
            const startBtn = document.getElementById('startBtn');
            const scoreEl = document.getElementById('score');
            const levelEl = document.getElementById('level');
            const livesEl = document.getElementById('lives');
            const highscoreEl = document.getElementById('highscore');
            const pauseBtn = document.getElementById('pauseBtn');
            const muteBtn = document.getElementById('muteBtn');
            const restartBtn = document.getElementById('restartBtn');

            let ctx, W, H, dpr;

            function resizeCanvas() {
                const rect = gamebox.getBoundingClientRect();
                dpr = window.devicePixelRatio || 1;
                W = Math.max(480, Math.floor(rect.width));
                H = Math.max(360, Math.floor(rect.height));
                canvas.width = Math.floor(W * dpr);
                canvas.height = Math.floor(H * dpr);
                canvas.style.width = W + 'px';
                canvas.style.height = H + 'px';
                ctx = canvas.getContext('2d');
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            window.addEventListener('resize', () => {
                resizeCanvas();
            });

            /* Game state */
            let running = false, paused = false, muted = false;
            let score = 0, level = 1, lives = 3, highscore = 0;
            let lastSpawn = 0, spawnInterval = 1200; // ms
            let enemies = [], bullets = [], particles = [];
            let keys = {}, mouse = { x: 0, y: 0, down: false };
            let lastTime = 0;
            let player;
            let killCombo = 0, comboTimeout = 0;

            /* Audio simple beep via WebAudio */
            let audioCtx = null;
            function playBeep(freq = 440, length = 0.08, type = 'sine', vol = 0.08) {
                if (muted) return;
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = type;
                o.frequency.value = freq;
                g.gain.value = vol;
                o.connect(g); g.connect(audioCtx.destination);
                o.start();
                o.stop(audioCtx.currentTime + length);
            }

            /* Entities */
            function createPlayer() {
                return {
                    x: W / 2,
                    y: H - 80,
                    w: 26,
                    h: 36,
                    speed: 6,
                    cooldown: 0,
                    color1: '#39f0ff',
                    color2: '#ff3aff'
                };
            }

            function spawnEnemy() {
                const edge = Math.random();
                const size = 18 + Math.random() * 24;
                const x = Math.random() * (W - size * 2) + size;
                const y = -size - 20;
                const hp = 1 + Math.floor(level / 3) + (Math.random() < 0.15 ? 1 : 0);
                const speed = 1.2 + Math.random() * 1.2 + level * 0.12;
                const type = Math.random() < 0.12 ? 'big' : 'small';
                enemies.push({ x, y, size, hp, speed, rot: Math.random() * Math.PI * 2, wobble: Math.random() * 0.8, type });
            }

            function createBullet(x, y, dx, dy, owner = 'player') {
                bullets.push({ x, y, dx, dy, owner, r: 3, life: 180 });
            }

            function createParticles(x, y, color, amount = 12, str = 1.2) {
                for (let i = 0; i < amount; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = (Math.random() * str + 0.6) * (Math.random() * 3 + 1);
                    particles.push({
                        x, y,
                        vx: Math.cos(a) * s,
                        vy: Math.sin(a) * s,
                        life: 40 + Math.random() * 30,
                        size: 1 + Math.random() * 2,
                        color,
                    });
                }
            }

            /* collisions */
            function circleCollide(a, b) {
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const r = (a.r || a.size / 2) + (b.r || b.size / 2);
                return dx * dx + dy * dy <= r * r;
            }

            /* draw helpers */
            function neonLine(x1, y1, x2, y2, color, glow = 12, width = 2, alpha = 1) {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.lineCap = 'round';
                ctx.lineWidth = width;
                ctx.shadowBlur = glow;
                ctx.shadowColor = color;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.restore();
            }

            /* draw starfield */
            let stars = [];
            function createStars() {
                stars = [];
                const count = Math.round((W * H) / 5000);
                for (let i = 0; i < count; i++) {
                    stars.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        r: Math.random() * 1.4,
                        tw: Math.random() * 120 + 80,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
            function updateDrawStars(dt) {
                ctx.fillStyle = 'rgba(255,255,255,0.02)';
                for (const s of stars) {
                    s.phase += dt / 1000 * 0.8;
                    const a = 0.35 + (Math.sin(s.phase) + 1) * 0.3;
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(173,216,255,' + (a * 0.12).toFixed(3) + ')';
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            /* Game loop */
            function startGame() {
                if (!audioCtx) { } // do not resume here; audio created on demand
                running = true; paused = false;
                score = 0; level = 1; lives = 3; enemies = []; bullets = []; particles = [];
                lastSpawn = performance.now();
                spawnInterval = 1100;
                player = createPlayer();
                createStars();
                startMsg.style.display = 'none';
                overlay.style.pointerEvents = 'none';
                highscore = Math.max(highscore, Number(localStorage.getItem('neon_high') || 0));
                highscoreEl.textContent = highscore;
                lastTime = performance.now();
                requestAnimationFrame(loop);
            }

            function gameOver() {
                running = false;
                overlay.style.pointerEvents = 'auto';
                startMsg.style.display = 'block';
                startMsg.querySelector('.big').textContent = 'GAME OVER';
                startMsg.querySelector('.tiny').textContent = `Score: ${score} — Click start to play again`;
                // save highscore
                highscore = Math.max(highscore, score, Number(localStorage.getItem('neon_high') || 0));
                localStorage.setItem('neon_high', highscore);
                highscoreEl.textContent = highscore;
                playBeep(120, 0.22, 'sine', 0.12);
            }

            function plusScore(n, x, y) {
                score += n;
                scoreEl.textContent = score;
                // small flourish sound
                playBeep(420 + Math.random() * 220, 0.06, 'sawtooth', 0.04);
                // small particle burst
                createParticles(x || (player.x), y || (player.y - 20), '#39f0ff', 8);
            }

            function loop(now) {
                if (!running) return;
                const dt = Math.min(60, now - lastTime);
                lastTime = now;
                if (paused) {
                    drawPaused();
                    requestAnimationFrame(loop);
                    return;
                }

                update(dt);
                render();
                requestAnimationFrame(loop);
            }

            /* Update */
            function update(dt) {
                // player movement
                if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
                if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;

                // mouse follow smoothing
                const dx = mouse.x - player.x;
                player.x += dx * 0.12;

                // clamp
                player.x = Math.max(18, Math.min(W - 18, player.x));

                // shooting
                if ((keys[' '] || mouse.down) && player.cooldown <= 0) {
                    shoot();
                    player.cooldown = 8; // frames
                }
                if (player.cooldown > 0) player.cooldown -= 1;

                // spawn enemies
                lastSpawn += dt;
                const adjustedSpawn = spawnInterval - Math.min(700, level * 40);
                if (lastSpawn > adjustedSpawn) {
                    spawnEnemy();
                    lastSpawn = 0;
                }

                // update bullets
                for (let i = bullets.length - 1; i >= 0; i--) {
                    const b = bullets[i];
                    b.x += b.dx * dt / 16;
                    b.y += b.dy * dt / 16;
                    b.life -= dt / 16;
                    if (b.x < -20 || b.x > W + 20 || b.y < -40 || b.y > H + 40 || b.life <= 0) {
                        bullets.splice(i, 1);
                    }
                }

                // update enemies
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    e.rot += 0.02;
                    e.x += Math.sin(performance.now() / 700 + e.wobble * 30) * 0.4 * (e.wobble + 0.6);
                    e.y += e.speed * dt / 16;
                    if (e.y > H + 60) {
                        enemies.splice(i, 1);
                        lives -= 1;
                        livesEl.textContent = lives;
                        createParticles(e.x, H - 20, '#ff3aff', 16);
                        playBeep(160, 0.06, 'sine', 0.08);
                        if (lives <= 0) { gameOver(); return; }
                    }
                }

                // bullets vs enemies
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    const eobj = { x: e.x, y: e.y, size: e.size };
                    for (let j = bullets.length - 1; j >= 0; j--) {
                        const b = bullets[j];
                        if (b.owner !== 'player') continue;
                        if (circleCollide(eobj, b)) {
                            // hit
                            e.hp -= 1;
                            bullets.splice(j, 1);
                            createParticles(b.x, b.y, '#fff', 7, 1.2);
                            playBeep(600 + Math.random() * 300, 0.03, 'square', 0.03);
                            if (e.hp <= 0) {
                                // enemy destroyed
                                const pts = (e.type === 'big') ? 40 + Math.floor(level * 6) : 10 + Math.floor(level * 2);
                                plusScore(pts, e.x, e.y);
                                // combo
                                killCombo += 1;
                                comboTimeout = performance.now() + 1200;
                                // spawn explosion
                                createParticles(e.x, e.y, (Math.random() > 0.5 ? '#39f0ff' : '#ff3aff'), 20 + Math.floor(Math.random() * 20), 2.1);
                                playBeep(220 + Math.random() * 240, 0.12, 'sawtooth', 0.08);
                                enemies.splice(i, 1);
                            }
                            break;
                        }
                    }
                }

                // enemy bullets / collisions to player (simple)
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    // simple collision with player
                    const distX = e.x - player.x;
                    const distY = e.y - player.y + 6;
                    const rr = e.size / 2 + player.w / 2;
                    if (distX * distX + distY * distY < rr * rr) {
                        // damage player
                        enemies.splice(i, 1);
                        createParticles(player.x, player.y, '#ff3aff', 26, 2.2);
                        lives -= 1;
                        livesEl.textContent = lives;
                        playBeep(140, 0.12, 'sine', 0.12);
                        if (lives <= 0) { gameOver(); return; }
                    }
                }

                // particles
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx * dt / 16;
                    p.y += p.vy * dt / 16;
                    p.vy += 0.02 * dt / 16;
                    p.life -= dt / 16;
                    if (p.life <= 0) particles.splice(i, 1);
                }

                // combo timeout check (award bonus if big combo)
                if (killCombo > 0 && performance.now() > comboTimeout) {
                    if (killCombo >= 3) {
                        const bonus = killCombo * 5;
                        plusScore(bonus, player.x, player.y - 30);
                    }
                    killCombo = 0;
                }

                // level progression
                const lvlFromScore = 1 + Math.floor(score / 200);
                if (lvlFromScore > level) {
                    level = lvlFromScore;
                    levelEl.textContent = level;
                    playBeep(520 + level * 20, 0.14, 'triangle', 0.08);
                }
            }

            /* Render */
            function render() {
                ctx.clearRect(0, 0, W, H);

                // background gradient
                const g = ctx.createLinearGradient(0, 0, 0, H);
                g.addColorStop(0, 'rgba(2,6,23,0.75)');
                g.addColorStop(1, 'rgba(2,6,15,0.72)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);

                updateDrawStars(16);

                // faint grid lines
                ctx.save();
                ctx.globalAlpha = 0.03;
                for (let x = 0; x < W; x += 40) {
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(x, 0, 1, H);
                }
                ctx.restore();

                // draw player — neon triangle ship
                drawShip(player.x, player.y, player.w, player.h);

                // draw bullets
                for (const b of bullets) {
                    if (b.owner === 'player') {
                        neonBullet(b.x, b.y, b.r, '#39f0ff');
                    } else {
                        neonBullet(b.x, b.y, b.r, '#ff3aff');
                    }
                }

                // draw enemies
                for (const e of enemies) {
                    drawEnemy(e);
                }

                // draw particles
                for (const p of particles) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 60));
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                // HUD glow bottom
                ctx.save();
                ctx.globalAlpha = 0.06;
                ctx.fillStyle = '#39f0ff';
                ctx.fillRect(0, H - 2, W, 2);
                ctx.restore();

                // small reticle at mouse
                ctx.save();
                ctx.globalAlpha = 0.85;
                neonLine(mouse.x - 8, mouse.y, mouse.x + 8, mouse.y, '#7dff6b', 6, 1.2, 0.6);
                neonLine(mouse.x, mouse.y - 8, mouse.x, mouse.y + 8, '#7dff6b', 6, 1.2, 0.6);
                ctx.restore();
            }

            function drawShip(x, y, w, h) {
                ctx.save();
                ctx.translate(x, y);
                // body glow
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = 'rgba(57,240,255,0.04)';
                ctx.beginPath();
                ctx.ellipse(0, 8, w * 1.6, 6, 0, 0, Math.PI * 2);
                ctx.fill();

                // neon strokes
                ctx.strokeStyle = '#39f0ff';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 18;
                ctx.shadowColor = '#39f0ff';
                ctx.beginPath();
                ctx.moveTo(0, -h / 2);
                ctx.lineTo(-w / 2, h / 2);
                ctx.lineTo(w / 2, h / 2);
                ctx.closePath();
                ctx.stroke();

                // center glow
                ctx.fillStyle = '#39f0ff';
                ctx.globalAlpha = 0.12;
                ctx.beginPath();
                ctx.ellipse(0, 0, w * 0.6, w * 0.24, 0, 0, Math.PI * 2);
                ctx.fill();

                // cockpit neon
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ff3aff';
                ctx.beginPath();
                ctx.moveTo(-6, -2);
                ctx.quadraticCurveTo(0, -8, 6, -2);
                ctx.lineTo(6, 4);
                ctx.quadraticCurveTo(0, 0, -6, 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            function neonBullet(x, y, r, color) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.shadowBlur = 18;
                ctx.shadowColor = color;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            function drawEnemy(e) {
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(Math.sin(e.rot) * 0.06);
                const sz = e.size;
                // glow
                ctx.globalCompositeOperation = 'lighter';
                ctx.shadowBlur = e.type === 'big' ? 28 : 12;
                ctx.shadowColor = e.type === 'big' ? '#ff3aff' : '#39f0ff';
                // body
                ctx.fillStyle = (e.type === 'big') ? '#ff3aff' : '#39f0ff';
                ctx.beginPath();
                ctx.moveTo(0, -sz * 0.7);
                ctx.lineTo(-sz * 0.8, sz * 0.6);
                ctx.lineTo(sz * 0.8, sz * 0.6);
                ctx.closePath();
                ctx.fill();

                // core
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(2, sz * 0.18), 0, Math.PI * 2);
                ctx.fill();

                // hp ring
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.beginPath();
                ctx.arc(0, 0, sz * 0.95, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            }

            function drawPaused() {
                ctx.save();
                ctx.fillStyle = 'rgba(2,6,23,0.5)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = '700 28px Inter, Arial';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', W / 2, H / 2);
                ctx.restore();
            }

            /* shooting helper */
            function shoot() {
                const angle = -Math.PI / 2;
                // 3-shot spread at higher levels
                const spread = Math.min(3, 1 + Math.floor(level / 6));
                const speed = 10 + Math.min(8, level);
                for (let i = 0; i < spread; i++) {
                    const off = (i - (spread - 1) / 2) * 0.14;
                    const dx = Math.cos(angle + off) * speed;
                    const dy = Math.sin(angle + off) * speed;
                    createBullet(player.x, player.y - 18, dx, dy, 'player');
                }
                playBeep(720 + Math.random() * 120, 0.03, 'square', 0.06);
            }

            /* input */
            canvas.addEventListener('mousemove', (e) => {
                const r = canvas.getBoundingClientRect();
                mouse.x = (e.clientX - r.left);
                mouse.y = (e.clientY - r.top);
            });
            canvas.addEventListener('mousedown', (e) => { mouse.down = true; });
            canvas.addEventListener('mouseup', (e) => { mouse.down = false; });
            window.addEventListener('keydown', (e) => {
                if (e.key === ' ') { e.preventDefault(); }
                keys[e.key] = true;
                if (!running && e.key === 'Enter') {
                    startGame();
                    startMsg.querySelector('.big').textContent = 'NEON SHOOTER';
                    startMsg.querySelector('.tiny').textContent = 'Move with mouse or arrow keys / A D | Shoot: Left click or Spacebar';
                }
                if (e.key === 'p' || e.key === 'P') {
                    togglePause();
                }
            });
            window.addEventListener('keyup', (e) => {
                keys[e.key] = false;
            });

            // buttons
            startBtn.addEventListener('click', () => {
                // reset start overlay text
                startMsg.querySelector('.big').textContent = 'NEON SHOOTER';
                startMsg.querySelector('.tiny').textContent = 'Move with mouse or arrow keys / A D | Shoot: Left click or Spacebar';
                startGame();
            });
            pauseBtn.addEventListener('click', togglePause);
            restartBtn.addEventListener('click', () => {
                running = false;
                startGame();
            });
            muteBtn.addEventListener('click', () => {
                muted = !muted;
                muteBtn.textContent = muted ? 'Unmute' : 'Mute';
            });

            function togglePause() {
                if (!running) return;
                paused = !paused;
                pauseBtn.textContent = paused ? 'Resume' : 'Pause';
                if (paused) {
                    overlay.style.pointerEvents = 'auto';
                    startMsg.style.display = 'block';
                    startMsg.querySelector('.big').textContent = 'PAUSED';
                    startMsg.querySelector('.tiny').textContent = 'Click Resume or press P to continue';
                } else {
                    overlay.style.pointerEvents = 'none';
                    startMsg.style.display = 'none';
                    lastTime = performance.now();
                    requestAnimationFrame(loop);
                }
            }

            // initial setup
            resizeCanvas();
            createStars();
            // show highscore
            highscore = Number(localStorage.getItem('neon_high') || 0);
            highscoreEl.textContent = highscore;

            // small instructions: click canvas will focus for keyboard
            canvas.addEventListener('click', () => {
                canvas.focus && canvas.focus();
            });

            // friendly fallback: auto start if mobile touch
            window.addEventListener('touchstart', () => {
                // no autoplay of audio; just allow touch to start interactions
            }, { passive: true });

            // ensure initial overlay text restored on load
            startMsg.querySelector('.big').textContent = 'NEON SHOOTER';
            startMsg.querySelector('.tiny').textContent = 'Move with mouse or arrow keys / A D | Shoot: Left click or Spacebar';
        })();