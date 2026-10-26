/**
 * Rune Systems - Interactive Fireflies & Mouse Light Points Engine
 * Vagalumes mágicos, feixes de energia conectando ao cursor e magnetismo de partículas.
 */
(function () {
  'use strict';

  function initRuneParticles() {
    var canvas = document.getElementById('rune-canvas');
    var mouseGlow = document.getElementById('mouse-glow');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = (canvas.width = window.innerWidth);
    var height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    var mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 200,
      active: false
    };
    var mouseTimeout;
    var particles = [];
    var sparkles = [];

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      if (mouseGlow) {
        mouseGlow.style.background = 'radial-gradient(750px circle at ' + e.clientX + 'px ' + e.clientY + 'px, rgba(0, 229, 184, 0.16), rgba(22, 70, 84, 0.06) 45%, transparent 75%)';
      }

      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(function () {
        mouse.active = false;
      }, 3500);

      var sparkCount = Math.floor(Math.random() * 2) + 2;
      for (var s = 0; s < sparkCount; s++) {
        sparkles.push({
          x: e.clientX + (Math.random() - 0.5) * 16,
          y: e.clientY + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 2.0,
          vy: (Math.random() - 0.5) * 2.0 - 0.5,
          radius: Math.random() * 2.6 + 1.2,
          alpha: 1.0,
          decay: 0.018 + Math.random() * 0.022
        });
      }
    });

    window.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    var colors = [
      'rgba(0, 229, 184, ',   // Ciano Rúnico (#00E5B8)
      'rgba(22, 190, 180, ',  // Drakkar Cyan
      'rgba(148, 240, 225, ', // Brilho Mágico Claro
      'rgba(255, 255, 255, '  // Centelha Rúnica Pura
    ];

    var runes = ['\u16B1', '\u16A2', '\u16BE', '\u16D6', '\u16DF', '\u16CF', '\u16D2', '\u16A8', '\u2726'];

    function Particle() {
      this.reset();
    }

    Particle.prototype.reset = function () {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseRadius = Math.random() * 2.2 + 1.1;
      this.radius = this.baseRadius;
      this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7 - 0.15;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.035;
      this.isRune = Math.random() < 0.22;
      this.runeChar = runes[Math.floor(Math.random() * runes.length)];
      this.alpha = 0.25 + Math.random() * 0.65;
      this.friction = 0.93;
    };

    Particle.prototype.update = function () {
      this.pulse += this.pulseSpeed;
      var pulseFactor = 0.5 + Math.sin(this.pulse) * 0.45;
      this.currentAlpha = Math.max(0.12, Math.min(1, this.alpha * pulseFactor));

      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        var dx = mouse.x - this.x;
        var dy = mouse.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 2) {
          var force = (mouse.radius - dist) / mouse.radius;
          this.vx += (dx / dist) * force * 0.75;
          this.vy += (dy / dist) * force * 0.75;
          this.vx *= this.friction;
          this.vy *= this.friction;

          this.currentAlpha = Math.min(1, this.currentAlpha + 0.45);
          this.radius = this.baseRadius * 1.5;
        } else {
          this.radius = this.baseRadius;
        }
      } else {
        this.radius = this.baseRadius;
      }

      var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      var maxSpeed = 3.2;
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }

      this.x += this.vx;
      this.y += this.vy;

      this.vx += (Math.random() - 0.5) * 0.04;
      this.vy += (Math.random() - 0.5) * 0.04;

      if (this.x < -40) this.x = width + 40;
      if (this.x > width + 40) this.x = -40;
      if (this.y < -40) this.y = height + 40;
      if (this.y > height + 40) this.y = -40;
    };

    Particle.prototype.draw = function () {
      if (this.isRune) {
        ctx.save();
        ctx.font = Math.floor(this.radius * 6 + 11) + 'px "Space Grotesk", sans-serif';
        ctx.fillStyle = this.colorPrefix + this.currentAlpha + ')';
        ctx.shadowColor = '#00E5B8';
        ctx.shadowBlur = 12;
        ctx.fillText(this.runeChar, this.x, this.y);
        ctx.restore();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.currentAlpha + ')';
        ctx.shadowColor = '#00E5B8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }
    };

    var particleCount = Math.min(85, Math.floor((width * height) / 14000));
    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        var glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
        glowGrad.addColorStop(0, 'rgba(0, 229, 184, 0.20)');
        glowGrad.addColorStop(0.35, 'rgba(22, 190, 180, 0.07)');
        glowGrad.addColorStop(0.7, 'rgba(7, 13, 18, 0.02)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
        ctx.fill();
      }

      var maxDist = 115;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            var lineAlpha = (1 - dist / maxDist) * 0.20;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 229, 184, ' + lineAlpha + ')';
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        for (var k = 0; k < particles.length; k++) {
          var pK = particles[k];
          var mdx = mouse.x - pK.x;
          var mdy = mouse.y - pK.y;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius && mdist > 2) {
            var beamAlpha = (1 - mdist / mouse.radius) * 0.65;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(pK.x, pK.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(0, 229, 184, ' + beamAlpha + ')';
            ctx.lineWidth = 1.3;
            ctx.shadowColor = '#00E5B8';
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      for (var p = 0; p < particles.length; p++) {
        particles[p].update();
        particles[p].draw();
      }

      for (var s = sparkles.length - 1; s >= 0; s--) {
        var sp = sparkles[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0) {
          sparkles.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius * sp.alpha, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 184, ' + sp.alpha + ')';
        ctx.shadowColor = '#00E5B8';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRuneParticles);
  } else {
    initRuneParticles();
  }
})();
