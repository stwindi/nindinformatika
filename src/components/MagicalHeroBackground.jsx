import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function MagicalHeroBackground() {
  const containerRef = useRef(null);
  const skyRef = useRef(null);
  const magicCircleRef = useRef(null);
  const cometRef = useRef(null);

  useEffect(() => {
    // 1. Scatter Stars
    const sky = skyRef.current;
    if (sky) {
      // Clear previous if any
      const existingStars = sky.querySelectorAll('.magical-star-bg');
      existingStars.forEach(s => s.remove());

      for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        s.className = 'magical-star-bg';
        const size = Math.random() * 2 + 0.8;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 60 + '%';
        s.style.animationDelay = Math.random() * 4 + 's';
        s.style.animationDuration = (2.5 + Math.random() * 3.5) + 's';
        sky.appendChild(s);
      }

      // 2. Scatter Fireflies
      const existingFlies = sky.querySelectorAll('.magical-firefly');
      existingFlies.forEach(f => f.remove());

      for (let i = 0; i < 14; i++) {
        const f = document.createElement('div');
        f.className = 'magical-firefly';
        f.style.left = (8 + Math.random() * 84) + '%';
        f.style.top = (50 + Math.random() * 40) + '%';
        f.style.animationDelay = (Math.random() * 3) + 's';
        f.style.animationDuration = (3 + Math.random() * 3.5) + 's';
        sky.appendChild(f);
      }
    }

    // 3. Draw Magic Circle SVG
    const mc = magicCircleRef.current;
    if (mc && mc.children.length === 0) {
      const svgNS = 'http://www.w3.org/2000/svg';
      
      const outer = document.createElementNS(svgNS, 'circle');
      outer.setAttribute('r', '150');
      outer.setAttribute('class', 'magical-circle-path');
      outer.style.animationDelay = '2.4s';
      mc.appendChild(outer);

      const inner = document.createElementNS(svgNS, 'circle');
      inner.setAttribute('r', '118');
      inner.setAttribute('class', 'magical-circle-path inner');
      inner.style.animationDelay = '2.7s';
      mc.appendChild(inner);

      function polygonPoints(r, rotationDeg) {
        const pts = [];
        for (let i = 0; i < 3; i++) {
          const a = ((rotationDeg + i * 120) * Math.PI) / 180;
          pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        }
        return pts.map(p => p.join(',')).join(' ');
      }

      const tri1 = document.createElementNS(svgNS, 'polygon');
      tri1.setAttribute('points', polygonPoints(100, -90));
      tri1.setAttribute('class', 'magical-circle-path');
      tri1.style.animationDelay = '2.9s';
      mc.appendChild(tri1);

      const tri2 = document.createElementNS(svgNS, 'polygon');
      tri2.setAttribute('points', polygonPoints(100, -30));
      tri2.setAttribute('class', 'magical-circle-path');
      tri2.style.animationDelay = '3.0s';
      mc.appendChild(tri2);

      [outer, inner, tri1, tri2].forEach(el => {
        const len = el.getTotalLength ? el.getTotalLength() : 940;
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        el.style.animation = `drawMagicCircle 1.4s ease-out forwards`;
      });
    }

    // 4. Comet Trail animation
    const comet = cometRef.current;
    const stage = containerRef.current;
    let trailInterval;

    if (comet && stage) {
      function spawnTrailStar() {
        if (!comet || !stage) return;
        const r = comet.getBoundingClientRect();
        const stageR = stage.getBoundingClientRect();
        const star = document.createElement('div');
        star.className = 'magical-trail-star';
        const size = Math.random() * 3 + 1.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = (r.left - stageR.left + r.width / 2) + 'px';
        star.style.top = (r.top - stageR.top + r.height / 2) + 'px';
        star.style.boxShadow = '0 0 6px 1.5px rgba(238,248,255,0.85)';
        stage.appendChild(star);
        
        star.animate(
          [
            { opacity: 0.9, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.2)' }
          ],
          { duration: 900, easing: 'ease-out', fill: 'forwards' }
        );
        setTimeout(() => star.remove(), 950);
      }

      trailInterval = setInterval(spawnTrailStar, 32);
      setTimeout(() => clearInterval(trailInterval), 2400);
    }

    // 5. Continuous ambient sparkles
    const dustTones = ['#cfe3f0', '#e3eff7', '#b7cfe2', '#e0f2fe', '#fef08a'];
    function launchSprinkle(delay = 0) {
      if (!stage) return;
      const el = document.createElement('div');
      el.className = 'magical-sprinkle';
      const size = Math.random() * 3.5 + 2;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      const c = dustTones[Math.floor(Math.random() * dustTones.length)];
      el.style.background = c;
      el.style.boxShadow = `0 0 8px ${c}`;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 220;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40;
      stage.appendChild(el);

      const duration = 3200 + Math.random() * 1600;
      el.animate(
        [
          { transform: 'translate(-50%,-50%) translate(0px,0px) scale(0.2)', opacity: 0 },
          { transform: `translate(-50%,-50%) translate(${dx * 0.3}px, ${dy * 0.3}px) scale(1)`, opacity: 0.8, offset: 0.3 },
          { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 }
        ],
        { duration, delay, easing: 'cubic-bezier(0.16, 0.84, 0.44, 1)', fill: 'forwards' }
      );
      setTimeout(() => el.remove(), delay + duration + 100);
    }

    for (let i = 0; i < 14; i++) {
      launchSprinkle(2200 + Math.random() * 1000 + i * 40);
    }
    const sprinkleTimer = setInterval(() => {
      launchSprinkle(Math.random() * 300);
    }, 1200);

    return () => {
      clearInterval(trailInterval);
      clearInterval(sprinkleTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="magical-hero-container relative w-full min-h-[780px] lg:min-h-[860px] overflow-hidden flex flex-col items-center justify-center text-white"
    >
      <style>{`
        /* ===== MAGICAL BACKGROUND ANIMATIONS ===== */
        .magical-hero-container {
          background: linear-gradient(180deg, #131b2e 0%, #1c273e 22%, #324466 45%, #6680a3 68%, #a9c2d8 86%, #e6eff6 100%);
          perspective: 1400px;
        }

        .magical-sky-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .magical-moon {
          position: absolute;
          top: 6%;
          right: 10%;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 30% 26%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 6%),
            radial-gradient(circle at 62% 22%, rgba(120,140,160,0.35) 0%, rgba(120,140,160,0) 7%),
            radial-gradient(circle at 68% 42%, rgba(120,140,160,0.3) 0%, rgba(120,140,160,0) 9%),
            radial-gradient(circle at 42% 58%, rgba(120,140,160,0.28) 0%, rgba(120,140,160,0) 10%),
            radial-gradient(circle at 34% 32%, #ffffff 0%, #eaf1f6 30%, #c7d5e0 60%, #97a9ba 85%, #7f93a6 100%);
          box-shadow:
            inset -12px 7px 20px rgba(15,25,42,0.45),
            inset 5px -3px 12px rgba(255,255,255,0.3),
            0 0 65px 20px rgba(210,228,240,0.38);
          opacity: 0;
          animation: moonIn 2.5s ease-out 0.2s forwards, moonDrift 28s ease-in-out 2.8s infinite;
          z-index: 1;
        }
        @keyframes moonIn { to { opacity: 0.96; } }
        @keyframes moonDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1.4deg); }
        }

        .magical-star-bg {
          position: absolute;
          border-radius: 50%;
          background: #eef6fb;
          opacity: 0;
          animation: starTwinkle ease-in-out infinite;
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.85); }
          50% { opacity: 0.95; transform: scale(1.15); }
        }

        .magical-hill-back {
          position: absolute;
          bottom: 0;
          left: -5%;
          width: 110%;
          opacity: 0;
          filter: blur(2px);
          animation: hillIn 2s ease-out 0.3s forwards, hillDriftBack 50s ease-in-out 2.5s infinite;
          z-index: 2;
        }
        .magical-hill-front {
          position: absolute;
          bottom: 0;
          left: -8%;
          width: 120%;
          opacity: 0;
          filter: blur(0.2px);
          animation: hillIn 2s ease-out 0.5s forwards, hillDrift 38s ease-in-out 2.5s infinite;
          z-index: 3;
        }
        @keyframes hillIn { to { opacity: 1; } }
        @keyframes hillDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-1.5%); }
        }
        @keyframes hillDriftBack {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(0.8%); }
        }

        .magical-mist-layer {
          position: absolute;
          bottom: 8%;
          left: -20%;
          width: 140%;
          height: 110px;
          background: linear-gradient(90deg, rgba(238,246,251,0) 0%, rgba(238,246,251,0.5) 45%, rgba(238,246,251,0.55) 55%, rgba(238,246,251,0) 100%);
          filter: blur(14px);
          opacity: 0;
          animation: mistIn 2s ease-out 0.9s forwards, mistDrift2 24s linear 3s infinite;
          z-index: 4;
        }
        @keyframes mistIn { to { opacity: 0.75; } }
        @keyframes mistDrift2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(12%); }
        }

        .magical-firefly {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #d8f0fc;
          box-shadow: 0 0 7px 2px rgba(216,240,252,0.85);
          opacity: 0;
          animation: fireflyFloat ease-in-out infinite;
          z-index: 5;
        }
        @keyframes fireflyFloat {
          0%, 100% { opacity: 0.15; transform: translate(0,0); }
          50% { opacity: 0.95; transform: translate(7px, -15px); }
        }

        .magical-ground-glow {
          position: absolute;
          bottom: 24%;
          left: 50%;
          width: 280px;
          height: 60px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(207,233,245,0.48) 0%, rgba(207,233,245,0) 72%);
          filter: blur(6px);
          opacity: 0;
          animation: groundIn 1.5s ease-out 2.8s forwards, groundPulse 5.5s ease-in-out 4.3s infinite;
          z-index: 5;
        }
        @keyframes groundIn { to { opacity: 0.85; } }
        @keyframes groundPulse {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.95; transform: translateX(-50%) scale(1.1); }
        }

        .magical-fog-near {
          position: absolute;
          bottom: -1%;
          left: -25%;
          width: 150%;
          height: 90px;
          background: linear-gradient(90deg, rgba(230,240,247,0) 0%, rgba(230,240,247,0.42) 50%, rgba(230,240,247,0) 100%);
          filter: blur(10px);
          opacity: 0;
          animation: fogIn 2s ease-out 1.2s forwards, fogDrift 16s linear 3.2s infinite;
          z-index: 6;
        }
        @keyframes fogIn { to { opacity: 0.7; } }
        @keyframes fogDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-15%); }
        }

        /* Comet with star trail */
        .magical-comet {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, #cfe9f5 40%, rgba(207,233,245,0) 75%);
          box-shadow: 0 0 16px 6px rgba(207,233,245,0.9);
          offset-path: path('M -60,120 C 180,-40 420,460 700,180 C 780,120 800,180 800,220');
          offset-rotate: 0deg;
          opacity: 0;
          animation: cometFly 1.8s cubic-bezier(0.32,0,0.4,1) 0.5s forwards;
          z-index: 7;
        }
        @keyframes cometFly {
          0%   { offset-distance: 0%; opacity: 0; }
          6%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .magical-trail-star {
          position: absolute;
          border-radius: 50%;
          background: #eef8ff;
          opacity: 0;
          pointer-events: none;
          z-index: 7;
        }

        .magical-spark {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle, #f5fbff 0%, #bcd8ec 40%, rgba(255,255,255,0) 75%);
          opacity: 0;
          animation: sparkBurst 1s ease-out 2.05s forwards;
          z-index: 8;
          pointer-events: none;
        }
        @keyframes sparkBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.6); }
          65% { opacity: 0.6; transform: translate(-50%, -50%) scale(8); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(13); }
        }

        .magical-halo {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,244,252,0.65) 0%, rgba(179,209,232,0.28) 45%, rgba(0,0,0,0) 72%);
          filter: blur(10px);
          opacity: 0;
          animation: haloIn 1.5s ease-out 2.15s forwards, haloPulse 5.5s ease-in-out 3.8s infinite;
          z-index: 6;
          pointer-events: none;
        }
        @keyframes haloIn { to { opacity: 1; } }
        @keyframes haloPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.78; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
        }

        .magical-scene-svg {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 550px;
          height: 550px;
          overflow: visible;
          z-index: 6;
          pointer-events: none;
        }

        .magical-circle-path {
          fill: none;
          stroke: #7e9cc0;
          stroke-width: 1.2;
          opacity: 0;
        }
        @keyframes drawMagicCircle {
          0% { opacity: 0; }
          8% { opacity: 0.65; }
          100% { stroke-dashoffset: 0; opacity: 0.65; }
        }

        /* 3D Rotating & Floating Emblem */
        .magical-icon-3d {
          position: relative;
          width: 160px;
          height: 160px;
          sm:width: 190px;
          sm:height: 190px;
          transform-style: preserve-3d;
          opacity: 0;
          transform: rotateY(75deg) scale(0.85);
          animation: flip3D 1.1s cubic-bezier(0.22, 1, 0.36, 1) 2.2s forwards,
                     idle3D 7s ease-in-out 3.3s infinite;
          z-index: 10;
        }
        @keyframes flip3D {
          0% { opacity: 0; transform: rotateY(75deg) scale(0.85); }
          40% { opacity: 1; }
          100% { opacity: 1; transform: rotateY(0deg) scale(1); }
        }
        @keyframes idle3D {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg) translateY(0); }
          25%      { transform: rotateY(4.5deg) rotateX(-2deg) translateY(-8px); }
          50%      { transform: rotateY(0deg) rotateX(1.5deg) translateY(-12px); }
          75%      { transform: rotateY(-4.5deg) rotateX(-1deg) translateY(-6px); }
        }
        .magical-icon-3d img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 24px rgba(179,209,232,0.85)) drop-shadow(0 18px 22px rgba(10,20,35,0.45));
        }

        .magical-sprinkle {
          position: absolute;
          top: 38%;
          left: 50%;
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          z-index: 9;
        }

        .magical-flourish {
          display: block;
          width: 0;
          height: 1px;
          margin: 10px auto;
          background: linear-gradient(90deg, transparent, #93c5fd, transparent);
          opacity: 0;
          animation: flourishGrow 1s ease-out 3.5s forwards;
        }
        @keyframes flourishGrow {
          0% { width: 0; opacity: 0; }
          100% { width: 140px; opacity: 0.9; }
        }
      `}</style>

      {/* Sky & Environment Layers */}
      <div ref={skyRef} className="magical-sky-layer">
        <div className="magical-moon" />
        
        {/* Distant Hills */}
        <svg className="magical-hill-back" viewBox="0 0 800 220" preserveAspectRatio="none">
          <path
            d="M0,140 C120,90 220,160 340,120 C460,80 560,150 680,110 C740,90 780,120 800,110 L800,220 L0,220 Z"
            fill="#324466"
            opacity="0.6"
          />
        </svg>

        {/* Foreground Hills */}
        <svg className="magical-hill-front" viewBox="0 0 900 200" preserveAspectRatio="none">
          <path
            d="M0,150 C100,110 200,170 320,130 C440,90 540,160 660,120 C760,95 830,140 900,125 L900,200 L0,200 Z"
            fill="#202c44"
            opacity="0.78"
          />
        </svg>

        <div className="magical-mist-layer" />
      </div>

      {/* Magic Circles & Halos */}
      <svg className="magical-scene-svg" viewBox="0 0 700 700">
        <g ref={magicCircleRef} transform="translate(350,350)" />
      </svg>
      <div className="magical-halo" />
      <div className="magical-ground-glow" />
      <div ref={cometRef} className="magical-comet" />
      <div className="magical-spark" />
      <div className="magical-fog-near" />

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 pt-28 pb-16 text-center flex flex-col items-center">
        {/* Animated 3D Logo Emblem */}
        <div className="mb-4">
          <div className="magical-icon-3d">
            <img src="/logo.png" alt="Clova Logo" />
          </div>
        </div>

        {/* Fantasy/Disney style Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-3"
        >
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Clova
          </h1>
          <div className="magical-flourish" />
          <p
            className="italic text-base md:text-lg font-medium text-sky-200 tracking-widest uppercase drop-shadow"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            belajar jadi petualangan
          </p>
        </motion.div>

        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-sky-100 rounded-full text-xs sm:text-sm font-medium mb-6 shadow-lg"
        >
          <Zap size={14} className="text-amber-300 animate-pulse" />
          Teman Belajar AI Pintar untuk SMP, SMA &amp; Mahasiswa
        </motion.div>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          Pecah tugas sulit jadi langkah mudah, rangkum materi dengan sumber tepercaya, dan hafalan secepat kilat dengan flashcard interaktif bertenaga AI.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
        >
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold rounded-2xl text-base shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.8)] hover:scale-105 transition-all duration-300 border border-white/30"
          >
            <Sparkles size={18} className="text-amber-300" />
            Mulai Petualangan Gratis <ArrowRight size={18} />
          </Link>
          <a
            href="#fitur"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900/60 backdrop-blur-md border border-slate-300/40 text-slate-100 font-semibold rounded-2xl hover:bg-slate-800/80 hover:border-white/60 transition-all duration-200"
          >
            Jelajahi Fitur
          </a>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex items-center justify-center gap-2 bg-slate-950/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
        >
          <div className="flex -space-x-2">
            {['👩‍🎓', '👨‍🎓', '👩‍🎓', '👨‍🎓', '👩‍🎓'].map((a, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-slate-800/80 border border-sky-300/50 flex items-center justify-center text-xs shadow"
              >
                {a}
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 ml-2">
            <span className="font-bold text-white">1,000+</span> pelajar sudah mulai petualangan belajar mereka ✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}
