const templates = {
    classic: {
        count: 70,
        colors: ["#ff962d", "#ffffff", "#4895ef", "#ffd700"],
        shapes: ["square", "circle", "rect", "ribbon"],
    },
    gaming: {
        count: 90,
        colors: ["#ff00ff", "#00ffff", "#00ff66", "#ffff00"],
        shapes: ["square", "triangle", "star"],
    },
    "gold-rain": {
        count: 80,
        colors: ["#ffd700", "#ffcc00", "#ffb300"],
        shapes: ["rect", "ribbon", "star"],
    },
    football: {
        count: 60,
        colors: ["#ffffff"],
        shapes: ["football", "circle"],
    },
    trophies: {
        count: 55,
        colors: ["#ffd700"],
        shapes: ["trophy", "star"],
    },
    diamonds: {
        count: 75,
        colors: ["#d6f3ff", "#9bd6ff", "#ffffff"],
        shapes: ["diamond"],
    },
    fireworks: {
        count: 110,
        colors: ["#ff006e", "#8338ec", "#3a86ff", "#ffbe0b"],
        shapes: ["circle", "star"],
    },
    arena: {
        count: 90,
        colors: ["#00bfff", "#ff6b00", "#ffffff"],
        shapes: ["square", "circle", "triangle", "ribbon"],
    },
};

const STAR_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5l2.95 6.62 7.05.78-5.3 4.93 1.5 7.17L12 17.6l-6.2 3.4 1.5-7.17-5.3-4.93 7.05-.78z"/></svg>';

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

window.initConfetti = function () {
    const options = { intensity: 2, duration: 3500 };
    const template = window.CONFETTI_TEMPLATE;
    if (!template || template === "none") return;
    const config = templates[template] || templates.classic;
    const opts = Object.assign(
        {
            duration: 3500, // how long the burst runs before fading out, ms
            intensity: 1, // multiplier on piece count, e.g. 0.5 for a smaller burst
            fadeOut: 800, // per-piece exit animation length, ms
        },
        options
    );

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let container = document.getElementById("confetti-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "confetti-container";
        container.className = "confetti-container";
        document.body.appendChild(container);
    }

    const pieceCount = reduceMotion
        ? Math.min(20, Math.round(config.count * opts.intensity))
        : Math.round(config.count * opts.intensity);

    const pieces = [];

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement("div");
        const shape =
            config.shapes[Math.floor(Math.random() * config.shapes.length)];
        piece.className = "confetti " + shape;

        // size drives a sense of depth: bigger pieces fall faster and sway
        // wider, like they're closer to the camera; smaller ones drift slower
        const size = rand(7, 20);
        const depth = (size - 7) / 13; // 0 (far/small) .. 1 (near/large)

        if (shape === "star") {
            piece.style.width = size + "px";
            piece.style.height = size + "px";
            piece.innerHTML = STAR_SVG;
        } else if (shape === "rect" || shape === "ribbon") {
            piece.style.width = size * 0.5 + "px";
            piece.style.height = size * 1.6 + "px";
        } else if (shape !== "triangle") {
            piece.style.width = size + "px";
            piece.style.height = size + "px";
        }

        const color =
            config.colors[Math.floor(Math.random() * config.colors.length)];
        if (shape === "triangle" || shape === "star") {
            piece.style.color = color;
        } else if (shape !== "football") {
            piece.style.background = color;
        }

        const opacity = rand(0.7, 1);
        const fallDuration = rand(7, 11) - depth * 2.5; // nearer pieces fall a bit faster
        const swayDuration = rand(2.2, 4.2);
        const sway = 12 + depth * 26; // nearer pieces swing wider
        const fallDelay = rand(0, fallDuration);
        const swayDelay = rand(0, swayDuration);
        const entranceDelay = reduceMotion ? 0 : rand(0, 1.2); // staggered burst-in

        piece.style.left = rand(0, 100) + "%";
        piece.style.setProperty("--piece-opacity", opacity);
        piece.style.setProperty("--sway", sway + "px");
        piece.style.zIndex = String(Math.round(depth * 10));
        piece.style.animationDuration =
            "0.45s, " + fallDuration + "s, " + swayDuration + "s";
        piece.style.animationDelay =
            entranceDelay +
            "s, -" +
            fallDelay +
            "s, -" +
            swayDelay +
            "s";
        piece.style.animationIterationCount = "1, infinite, infinite";

        container.appendChild(piece);
        pieces.push(piece);
    }
    setTimeout(() => {
        pieces.forEach((piece, i) => {
            const delay = reduceMotion ? 0 : rand(0, 500);
            setTimeout(() => {
                piece.style.animation = `confetti-exit ${opts.fadeOut}ms ease-in forwards`;
            }, delay);
        });

        setTimeout(() => {
            container.remove();
        }, opts.fadeOut + 600);
    }, opts.duration);
};
window.clearConfetti = function () {
    document.querySelectorAll('.confetti-container').forEach(el => el.remove());
};
$(document).ready(function () {
    $(initConfetti);
})