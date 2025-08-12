/* components/ai/portalHero.module.css */
/* Sticky portal that does NOT block clicks below it. */

.portal {
  position: sticky;
  top: 0;
  z-index: 100;
  isolation: isolate;
  background: var(--panel, #0b0c11);
  border-bottom: 1px solid var(--stroke, #1f2230);

  /* key: let clicks fall through unless they're inside the card */
  pointer-events: none;
}

.shell {
  transition: height 120ms ease;
  /* re-enable events *inside* the hero */
  pointer-events: auto;
}

.card {
  position: relative;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--stroke, #262a3c);
  background: #0f0f12;
  box-shadow: 0 0 20px rgba(155, 140, 255, 0.15);
  touch-action: manipulation;
  transform-origin: top center;
  transition: transform 120ms ease;
  will-change: transform;

  /* card itself needs to be interactive */
  pointer-events: auto;
}

.glowPink {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  background: radial-gradient(
    60% 50% at 50% 35%,
    rgba(255, 45, 184, 0.25) 0%,
    transparent 70%
  );
  mix-blend-mode: screen;
}

.glowPurple {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  background: radial-gradient(
    55% 45% at 50% 30%,
    rgba(155, 140, 255, 0.2) 0%,
    transparent 70%
  );
  mix-blend-mode: screen;
}

.glossAngle {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    130deg,
    rgba(155, 140, 255, 0.12) 10%,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 45, 184, 0.15) 90%
  );
  mix-blend-mode: screen;
}
