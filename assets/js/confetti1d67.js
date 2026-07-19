/* GameCoin Store – Lightning Strike effect (replaces confetti) */

function generateBolt(x1, y1, x2, y2, spread, depth) {
  if (depth <= 0) return [[x1, y1], [x2, y2]];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
  const my = (y1 + y2) / 2 + (Math.random() - 0.3) * spread * 0.15;
  const left  = generateBolt(x1, y1, mx, my, spread / 1.8, depth - 1);
  const right = generateBolt(mx, my, x2, y2, spread / 1.8, depth - 1);
  return [...left, ...right.slice(1)];
}

function generateBranch(points, branchCount) {
  const branches = [];
  for (let b = 0; b < branchCount; b++) {
    const startIdx = Math.floor(points.length * (0.2 + Math.random() * 0.5));
    const [bx, by] = points[startIdx];
    const endX = bx + (Math.random() - 0.5) * 160;
    const endY = by + (Math.random() * 0.4 + 0.2) * (window.innerHeight - by);
    branches.push(generateBolt(bx, by, endX, endY, 60, 5));
  }
  return branches;
}

function drawBolt(ctx, points, alpha, widthMain) {
  if (!points || points.length < 2) return;

  // Outer glow pass
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.shadowBlur = 28;
  ctx.shadowColor = 'rgba(123,47,247,0.9)';
  ctx.strokeStyle = `rgba(180,140,255,${alpha * 0.6})`;
  ctx.lineWidth = widthMain * 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Mid glow pass
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#a370ff';
  ctx.strokeStyle = `rgba(220,200,255,${alpha * 0.9})`;
  ctx.lineWidth = widthMain;
  ctx.stroke();

  // Bright core
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#fff';
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth = widthMain * 0.35;
  ctx.stroke();

  ctx.shadowBlur = 0;
}

window.initConfetti = function () {
  if (window.CONFETTI_TEMPLATE === 'none') return;

  /* ── Canvas ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'lightning-canvas';
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Flash overlay ── */
  const flash = document.createElement('div');
  flash.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9998;' +
    'background:linear-gradient(to bottom,rgba(200,170,255,0.18),transparent 60%);' +
    'opacity:0;';
  document.body.appendChild(flash);

  let strikes = 0;
  const MAX_STRIKES = 3;

  function strike() {
    if (strikes >= MAX_STRIKES) {
      setTimeout(() => {
        canvas.remove();
        flash.remove();
        window.removeEventListener('resize', resize);
      }, 400);
      return;
    }
    strikes++;

    /* Flash the screen */
    flash.style.transition = 'none';
    flash.style.opacity = '1';
    requestAnimationFrame(() => {
      flash.style.transition = 'opacity 0.35s ease-out';
      flash.style.opacity = '0';
    });

    /* Generate 1–2 main bolts */
    const numBolts = Math.random() > 0.45 ? 2 : 1;
    const allBolts  = [];
    const allBranches = [];

    for (let b = 0; b < numBolts; b++) {
      const startX = canvas.width * (0.1 + Math.random() * 0.8);
      const endX   = startX + (Math.random() - 0.5) * 180;
      const pts = generateBolt(startX, 0, endX, canvas.height, 130, 9);
      allBolts.push(pts);
      allBranches.push(...generateBranch(pts, Math.floor(Math.random() * 2) + 1));
    }

    /* Animate: quick appear → hold → fade */
    let frame = 0;
    const HOLD = 5;
    const FADE = 10;
    const TOTAL = HOLD + FADE;

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alpha = frame < HOLD
        ? 1
        : 1 - (frame - HOLD) / FADE;

      allBolts.forEach(pts   => drawBolt(ctx, pts,   alpha, 3.5));
      allBranches.forEach(pts => drawBolt(ctx, pts,   alpha * 0.55, 1.8));

      frame++;
      if (frame <= TOTAL) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const delay = 500 + Math.random() * 900;
        setTimeout(strike, delay);
      }
    }

    tick();
  }

  /* Kick off first strike after a short pause */
  setTimeout(strike, 400);
};

window.clearConfetti = function () {
  const c = document.getElementById('lightning-canvas');
  if (c) c.remove();
};

(function ready(fn) {
  if (typeof $ !== 'undefined') {
    $(document).ready(fn);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(function () { window.initConfetti(); });
