import { MorningNotificationPayload } from './notifications';

export interface NotificationPreviewCopy {
  mobileAppLine: string;
  mobileTitle: string;
  mobileBody: string;
  pcAppLine: string;
  pcTitle: string;
  pcBody: string;
  themeAccentHex: string;
}

export function buildDefaultPreviewCopy(
  payload: MorningNotificationPayload
): NotificationPreviewCopy {
  const top = payload.sectionTargets?.[0];
  const accent = top?.hexPrimary || '#22d3ee';

  return {
    mobileAppLine: 'Goalbeam • Now',
    mobileTitle: top
      ? `Today's Target: ${top.chapterPrefix} ${top.chapterNo} - ${top.chapterName}`
      : `Today's Study Target: ${payload.studentName}`,
    mobileBody: top
      ? `${top.subjectName} (${top.sectionName}) • Next: ${top.nextStageLabel} • Goal: ${payload.dailyStageGoal} Stages/Day`
      : `${payload.streakCount}d Streak • ${payload.daysLeft}d left • Daily Study Plan Ready`,
    pcAppLine: 'Goalbeam ⚡ • Web Push',
    pcTitle: top
      ? `Today's Target: ${top.chapterPrefix} ${top.chapterNo} - ${top.chapterName}`
      : `${payload.studentName}'s Daily Study Target`,
    pcBody: top
      ? `${top.subjectName} (${top.sectionName}) — Start ${top.nextStageLabel}. ${payload.daysLeft} days to 1st Paper • ${payload.overallPercent}% syllabus done.`
      : `Daily ${payload.dailyStageGoal} Stages goal • ${payload.daysLeft}d to 1st Paper • ${payload.overallPercent}% complete.`,
    themeAccentHex: accent,
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length === maxLines) {
          lines[maxLines - 1] = truncateLine(ctx, lines[maxLines - 1] + '...', maxWidth);
          return lines;
        }
      }
      current = word;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function truncateLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 4 && ctx.measureText(cut + '...').width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return cut + '...';
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Draws the shared Mini Multi-Colour Banner Strip (matches real OS Web Push big image)
 */
function drawNotificationBannerStrip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  payload: MorningNotificationPayload
) {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 10);
  ctx.clip();

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#0b1120');
  grad.addColorStop(0.55, '#111c36');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Rainbow top accent strip inside notification banner
  const topBar = ctx.createLinearGradient(x, y, x + w, y);
  topBar.addColorStop(0, '#f59e0b');
  topBar.addColorStop(0.35, '#06b6d4');
  topBar.addColorStop(0.7, '#10b981');
  topBar.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = topBar;
  ctx.fillRect(x, y, w, 4);

  const rows = (payload.sectionTargets || []).slice(0, 2);
  if (rows.length === 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`DAILY STUDY TARGET • ${payload.studentName.toUpperCase()}`, x + 12, y + 28);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillText(`${payload.daysLeft}d to 1st Paper • ${payload.dailyStageGoal} Stages/Day`, x + 12, y + 48);
  } else {
    rows.forEach((item, idx) => {
      const rowY = y + 10 + idx * 30;
      ctx.fillStyle = (item.hexPrimary || '#22d3ee') + '26';
      drawRoundedRect(ctx, x + 8, rowY, w - 16, 24, 6);
      ctx.fill();

      ctx.fillStyle = item.hexPrimary || '#22d3ee';
      ctx.fillRect(x + 8, rowY, 5, 24);

      ctx.font = 'bold 10.5px system-ui, sans-serif';
      ctx.textAlign = 'left';
      const label = truncateLine(
        ctx,
        `${item.subjectName}: ${item.chapterPrefix} ${item.chapterNo} - ${item.chapterName}`,
        w - 110
      );
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(label, x + 20, rowY + 15.5);

      ctx.fillStyle = item.hexPrimary || '#22d3ee';
      ctx.font = 'bold 9.5px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(truncateLine(ctx, item.nextStageLabel, 78), x + w - 14, rowY + 15.5);
    });
  }

  ctx.restore();
}

/**
 * Renders an authentic 9:16 Mobile Smartphone Screen (NO website open!).
 * progressTimeline: 0.0..1.0 where:
 *  - 0.00..0.22: Clean home screen, notification NOT visible yet (bell icon pops at 0.14)
 *  - 0.22..0.58: Finger glides down from top edge scrolling/pulling open notification bar
 *  - 0.58..1.00: Pulled-down notification shade open with AURA notification clearly visible
 * Pass timeline = 1 for the final still Mobile Preview Image.
 */
export function renderMobileNotificationScreen(
  canvas: HTMLCanvasElement,
  payload: MorningNotificationPayload,
  copy: NotificationPreviewCopy,
  timelineProgress: number = 1
) {
  const w = 540;
  const h = 960;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const t = Math.max(0, Math.min(1, timelineProgress));
  const bellArrived = t >= 0.12;
  const arrivalPulse = t >= 0.12 && t <= 0.26 ? Math.sin(((t - 0.12) / 0.14) * Math.PI) : 0;

  let shadeProgress = 0;
  if (t >= 0.24 && t <= 0.62) {
    shadeProgress = easeInOutCubic((t - 0.24) / 0.38);
  } else if (t > 0.62) {
    shadeProgress = 1;
  }

  const now = new Date();
  const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateLabel = payload.cycleDateFormatted || now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  // 1. Phone Wallpaper (Normal Home Screen — NO website open)
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0b1228');
  bg.addColorStop(0.42, '#13274c');
  bg.addColorStop(0.78, '#0f3947');
  bg.addColorStop(1, '#09111f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Dawn Ambient Wallpaper Glows
  const glow1 = ctx.createRadialGradient(w * 0.78, h * 0.25, 10, w * 0.78, h * 0.25, 250);
  glow1.addColorStop(0, 'rgba(34, 211, 238, 0.24)');
  glow1.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, w, h);

  const glow2 = ctx.createRadialGradient(w * 0.2, h * 0.68, 10, w * 0.2, h * 0.68, 280);
  glow2.addColorStop(0, 'rgba(245, 158, 11, 0.20)');
  glow2.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, w, h);

  // Subtle Phone Bezel Frame
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 2, 2, w - 4, h - 4, 34);
  ctx.stroke();

  // 2. Normal Phone Clock & Date Widget (behind notification drawer)
  ctx.save();
  ctx.globalAlpha = 1 - shadeProgress * 0.45;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 76px system-ui, -apple-system, sans-serif';
  ctx.fillText(timeLabel, w / 2, 198);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${dateLabel}  •  21°C Clear Dawn`, w / 2, 234);

  // Normal Phone Home Screen App Grid (non-browser everyday phone apps)
  const appIcons = [
    { label: 'Phone', color: '#10b981', glyph: 'call' },
    { label: 'Messages', color: '#3b82f6', glyph: 'msg' },
    { label: 'Notes', color: '#f59e0b', glyph: 'notes' },
    { label: 'Calendar', color: '#ec4899', glyph: 'cal' },
    { label: 'Camera', color: '#64748b', glyph: 'cam' },
    { label: 'Clock', color: '#6366f1', glyph: 'clk' },
    { label: 'Gallery', color: '#14b8a6', glyph: 'gal' },
    { label: 'Settings', color: '#475569', glyph: 'set' },
  ];

  // Subtle home screen info pill (NO website open)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  drawRoundedRect(ctx, 76, 610, w - 152, 42, 21);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText('Mobile Home Screen (No Website Open)', w / 2, 636);

  // Grid row of normal apps
  appIcons.slice(0, 4).forEach((app, i) => {
    const ix = 76 + i * 106;
    const iy = 690;
    ctx.fillStyle = app.color;
    drawRoundedRect(ctx, ix, iy, 68, 68, 18);
    ctx.fill();

    // Minimal geometric glyph inside icon
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    if (app.glyph === 'call') {
      ctx.beginPath();
      ctx.arc(ix + 34, iy + 34, 13, 0.2, Math.PI * 1.4);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    } else if (app.glyph === 'msg') {
      drawRoundedRect(ctx, ix + 18, iy + 21, 32, 24, 7);
      ctx.fill();
    } else if (app.glyph === 'notes') {
      drawRoundedRect(ctx, ix + 20, iy + 18, 28, 32, 4);
      ctx.fill();
    } else {
      ctx.fillRect(ix + 18, iy + 20, 32, 28);
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 12.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(app.label, ix + 34, iy + 88);
  });

  // Frosted Bottom App Dock
  ctx.fillStyle = 'rgba(15, 23, 42, 0.56)';
  drawRoundedRect(ctx, 30, h - 122, w - 60, 88, 28);
  ctx.fill();
  appIcons.slice(4, 8).forEach((app, i) => {
    const ix = 68 + i * 106;
    const iy = h - 107;
    ctx.fillStyle = app.color;
    drawRoundedRect(ctx, ix, iy, 58, 58, 16);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.beginPath();
    ctx.arc(ix + 29, iy + 29, 11, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 3. Pulled-Down OS Notification Bar / Shade (clipped smoothly as user drags down)
  if (shadeProgress > 0.01) {
    const shadeMaxH = 570;
    const currentShadeH = Math.max(46, Math.round(shadeMaxH * shadeProgress));

    ctx.save();
    drawRoundedRect(ctx, 0, 0, w, currentShadeH, 28);
    ctx.clip();

    // Frosted Dark OS Shade Backdrop
    const shadeBg = ctx.createLinearGradient(0, 0, 0, shadeMaxH);
    shadeBg.addColorStop(0, 'rgba(9, 13, 24, 0.97)');
    shadeBg.addColorStop(1, 'rgba(15, 23, 42, 0.94)');
    ctx.fillStyle = shadeBg;
    ctx.fillRect(0, 0, w, currentShadeH);

    // Quick Settings Circular Toggles (authentic Android/iOS pull-down header)
    const quickTiles = [
      { label: 'Wi-Fi', active: true },
      { label: 'Mobile 5G', active: true },
      { label: 'Sound', active: true },
      { label: 'Focus', active: false },
    ];
    quickTiles.forEach((tile, idx) => {
      const tx = 28 + idx * 124;
      const ty = 64;
      ctx.fillStyle = tile.active ? 'rgba(34, 211, 238, 0.22)' : 'rgba(51, 65, 85, 0.5)';
      ctx.strokeStyle = tile.active ? 'rgba(34, 211, 238, 0.55)' : 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, tx, ty, 112, 46, 23);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = tile.active ? '#67e8f9' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(tx + 22, ty + 23, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tile.label, tx + 36, ty + 27);
    });

    // Brightness Slider Bar
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    drawRoundedRect(ctx, 28, 126, w - 56, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    drawRoundedRect(ctx, 28, 126, (w - 56) * 0.72, 22, 11);
    ctx.fill();

    // "Notifications" Section Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 12.5px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NOTIFICATIONS', 30, 178);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('1 New • Study Alert', w - 30, 178);

    // REAL AURA OS PUSH NOTIFICATION CARD
    const cardX = 24;
    const cardY = 194;
    const cardW = w - 48;
    const cardH = 316;

    ctx.fillStyle = '#151f33';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.8;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 22);
    ctx.fill();
    ctx.stroke();

    // Small App Icon + App Name Line
    ctx.fillStyle = '#f59e0b';
    drawRoundedRect(ctx, cardX + 16, cardY + 16, 24, 24, 7);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', cardX + 28, cardY + 33);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 12px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(truncateLine(ctx, copy.mobileAppLine, cardW - 110), cardX + 48, cardY + 32);

    // Right App Avatar Emblem
    const logoGrad = ctx.createLinearGradient(cardX + cardW - 60, cardY + 16, cardX + cardW - 16, cardY + 60);
    logoGrad.addColorStop(0, '#22d3ee');
    logoGrad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = logoGrad;
    drawRoundedRect(ctx, cardX + cardW - 58, cardY + 16, 42, 42, 12);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '800 16px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G⚡', cardX + cardW - 37, cardY + 43);

    // Notification Bold Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px system-ui, -apple-system, sans-serif';
    const titleLines = wrapTextLines(ctx, copy.mobileTitle, cardW - 96, 2);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, cardX + 18, cardY + 64 + i * 21);
    });

    // Notification Body Lines
    const bodyStartY = cardY + 64 + titleLines.length * 21 + 6;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 13.5px system-ui, -apple-system, sans-serif';
    const bodyLines = wrapTextLines(ctx, copy.mobileBody, cardW - 38, 2);
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, cardX + 18, bodyStartY + i * 19);
    });

    // Embedded Colourful Today's Target Banner Image inside OS Push Notification
    drawNotificationBannerStrip(ctx, cardX + 16, cardY + 156, cardW - 32, 76, payload);

    // Divider line before OS Action Buttons
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 16, cardY + 248);
    ctx.lineTo(cardX + cardW - 16, cardY + 248);
    ctx.stroke();

    // Real OS Push Notification Action Buttons ("✅ Mark Done" & "🎯 View Target")
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    drawRoundedRect(ctx, cardX + 16, cardY + 260, (cardW - 44) / 2, 38, 10);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅ Mark Done', cardX + 16 + (cardW - 44) / 4, cardY + 284);

    ctx.fillStyle = 'rgba(34, 211, 238, 0.16)';
    drawRoundedRect(ctx, cardX + 28 + (cardW - 44) / 2, cardY + 260, (cardW - 44) / 2, 38, 10);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🎯 View Target', cardX + 28 + ((cardW - 44) * 3) / 4, cardY + 284);

    // Clear all pill + Shade Drag Handle Pill
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    drawRoundedRect(ctx, w / 2 - 64, currentShadeH - 36, 128, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText('Clear all', w / 2, currentShadeH - 21);

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    drawRoundedRect(ctx, w / 2 - 28, currentShadeH - 10, 56, 4, 2);
    ctx.fill();

    ctx.restore();
  }

  // 4. Smartphone Top Status Bar (always sharp on top)
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(timeLabel, 26, 28);

  if (bellArrived) {
    // Small crisp notification status badge next to time
    ctx.fillStyle = arrivalPulse > 0 ? '#fbbf24' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(82, 23, 7 + arrivalPulse * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '900 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 82, 26.5);

    if (arrivalPulse > 0) {
      ctx.strokeStyle = `rgba(251, 191, 36, ${arrivalPulse * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(82, 23, 14 + arrivalPulse * 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Right status bar (Signal, 5G, Battery 98%)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText('5G   98%', w - 26, 27);

  // 5. Realistic Scroll-Down Finger Swipe Gesture Indicator during transition
  if (t >= 0.20 && t <= 0.66) {
    const swipeT = Math.max(0, Math.min(1, (t - 0.20) / 0.42));
    const fingerY = 30 + easeInOutCubic(swipeT) * 510;
    const fingerX = w / 2;
    const gestureOpacity = t < 0.25 ? (t - 0.20) / 0.05 : t > 0.60 ? (0.66 - t) / 0.06 : 1;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, gestureOpacity));
    // Soft swipe trail
    const trailGrad = ctx.createLinearGradient(fingerX, Math.max(24, fingerY - 90), fingerX, fingerY);
    trailGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
    trailGrad.addColorStop(1, 'rgba(34, 211, 238, 0.45)');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fingerX, Math.max(24, fingerY - 90));
    ctx.lineTo(fingerX, fingerY);
    ctx.stroke();

    // Fingertip press circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
    ctx.beginPath();
    ctx.arc(fingerX, fingerY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fingerX, fingerY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Renders an authentic 16:9 PC Desktop Screen (NO website/browser open!).
 * timelineProgress: 0.0..1.0 where:
 *  - 0.00..0.22: Clean PC Desktop, notification NOT visible yet (tray badge appears at 0.14)
 *  - 0.22..0.56: Cursor moves to taskbar notification tray, clicks & scrolls/opens Notification Panel
 *  - 0.56..1.00: PC Notification Toast & Action Center panel fully visible on screen
 * Pass timeline = 1 for the final still PC Preview Image.
 */
export function renderPCNotificationScreen(
  canvas: HTMLCanvasElement,
  payload: MorningNotificationPayload,
  copy: NotificationPreviewCopy,
  timelineProgress: number = 1
) {
  const w = 960;
  const h = 540;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const t = Math.max(0, Math.min(1, timelineProgress));
  const bellBadgeReady = t >= 0.12;
  const badgePulse = t >= 0.12 && t <= 0.26 ? Math.sin(((t - 0.12) / 0.14) * Math.PI) : 0;

  let panelProgress = 0;
  if (t >= 0.34 && t <= 0.68) {
    panelProgress = easeOutCubic((t - 0.34) / 0.34);
  } else if (t > 0.68) {
    panelProgress = 1;
  }

  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Clean Desktop Aurora Wallpaper (NO browser or website open)
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#090e1c');
  bg.addColorStop(0.5, '#122242');
  bg.addColorStop(1, '#0c2d3b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Abstract Aurora Waves
  const waveGrad = ctx.createRadialGradient(w * 0.55, h * 0.38, 20, w * 0.55, h * 0.38, 380);
  waveGrad.addColorStop(0, 'rgba(34, 211, 238, 0.22)');
  waveGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.12)');
  waveGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = waveGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle Monitor Frame Border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 1.5, 1.5, w - 3, h - 3, 14);
  ctx.stroke();

  // Desktop Shortcut Icons on Left Column (everyday OS icons — NO website open)
  const desktopIcons = [
    { name: 'This PC', color: '#38bdf8' },
    { name: 'Class 10\nNotes', color: '#f59e0b' },
    { name: 'NCERT\nPDFs', color: '#10b981' },
    { name: 'Recycle\nBin', color: '#94a3b8' },
  ];
  desktopIcons.forEach((icon, i) => {
    const ix = 26;
    const iy = 28 + i * 94;
    ctx.fillStyle = icon.color;
    drawRoundedRect(ctx, ix + 10, iy, 36, 36, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.fillRect(ix + 16, iy + 8, 24, 6);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const lines = icon.name.split('\n');
    lines.forEach((ln, li) => {
      ctx.fillText(ln, ix + 28, iy + 52 + li * 13);
    });
  });

  // Subtle Center Desktop Watermark Chip (clearly shows Desktop Idle — No Website Open)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  drawRoundedRect(ctx, 150, 28, 310, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PC Desktop Screen (No Browser / Website Open)', 305, 48);

  // 2. Desktop OS Notification Center / Toast Drawer (bottom-right)
  if (panelProgress > 0.01) {
    const panelW = 416;
    const panelH = 368;
    const panelX = w - panelW - 18;
    const targetY = h - 48 - panelH - 12;
    // Slides smoothly upward/inward from taskbar area
    const slideOffsetY = (1 - panelProgress) * 160;
    const panelY = targetY + slideOffsetY;

    ctx.save();
    ctx.globalAlpha = Math.min(1, panelProgress * 1.25);

    // Outer OS Action Center Glass Panel
    ctx.fillStyle = 'rgba(13, 19, 34, 0.96)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
    ctx.lineWidth = 1.6;
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 16);
    ctx.fill();
    ctx.stroke();

    // Action Center Header
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Notifications (1)', panelX + 18, panelY + 28);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 11.5px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Clear all', panelX + panelW - 18, panelY + 28);

    // Inner Push Notification Card
    const cardX = panelX + 14;
    const cardY = panelY + 44;
    const cardW = panelW - 28;
    const cardH = 308;

    ctx.fillStyle = '#162238';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    // App source header row
    ctx.fillStyle = '#f59e0b';
    drawRoundedRect(ctx, cardX + 14, cardY + 12, 20, 20, 5);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', cardX + 24, cardY + 26.5);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 11.5px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(truncateLine(ctx, copy.pcAppLine, cardW - 64), cardX + 42, cardY + 26);

    // Big Colourful Banner inside Desktop Push Notification
    drawNotificationBannerStrip(ctx, cardX + 14, cardY + 42, cardW - 28, 78, payload);

    // Bold Notification Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14.5px system-ui, sans-serif';
    const titleLines = wrapTextLines(ctx, copy.pcTitle, cardW - 28, 2);
    titleLines.forEach((ln, i) => {
      ctx.fillText(ln, cardX + 14, cardY + 144 + i * 20);
    });

    // Body Text
    const bodyY = cardY + 144 + titleLines.length * 20 + 6;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 12.5px system-ui, sans-serif';
    const bodyLines = wrapTextLines(ctx, copy.pcBody, cardW - 28, 3);
    bodyLines.forEach((ln, i) => {
      ctx.fillText(ln, cardX + 14, bodyY + i * 17);
    });

    // Desktop Action Buttons
    const btnY = cardY + cardH - 46;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    drawRoundedRect(ctx, cardX + 14, btnY, (cardW - 38) / 2, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅ Mark Done', cardX + 14 + (cardW - 38) / 4, btnY + 20.5);

    ctx.fillStyle = 'rgba(34, 211, 238, 0.22)';
    drawRoundedRect(ctx, cardX + 24 + (cardW - 38) / 2, btnY, (cardW - 38) / 2, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🎯 View Target', cardX + 24 + ((cardW - 38) * 3) / 4, btnY + 20.5);

    ctx.restore();
  }

  // 3. Bottom OS Desktop Taskbar
  const tbY = h - 48;
  ctx.fillStyle = 'rgba(10, 15, 28, 0.94)';
  ctx.fillRect(0, tbY, w, 48);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, tbY);
  ctx.lineTo(w, tbY);
  ctx.stroke();

  // Left-Center Start + Taskbar Icons
  const startX = w / 2 - 120;
  // Windows-style 4-pane Start button
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(startX, tbY + 13, 9, 9);
  ctx.fillRect(startX + 11, tbY + 13, 9, 9);
  ctx.fillRect(startX, tbY + 24, 9, 9);
  ctx.fillRect(startX + 11, tbY + 24, 9, 9);

  // Search Pill
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  drawRoundedRect(ctx, startX + 34, tbY + 10, 130, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Search', startX + 50, tbY + 28);

  // Closed App Icons (Explorer, Folder)
  ctx.fillStyle = '#fbbf24';
  drawRoundedRect(ctx, startX + 178, tbY + 13, 24, 22, 5);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  drawRoundedRect(ctx, startX + 214, tbY + 13, 24, 22, 5);
  ctx.fill();

  // System Tray Right: Clock + Notification Bell Tray Icon
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 11.5px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(timeLabel, w - 58, tbY + 21);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillText('20-11-2026', w - 58, tbY + 36);

  // Notification Bell Icon at Bottom Right (w - 30, tbY + 24)
  const bellX = w - 30;
  const bellY = tbY + 24;
  ctx.fillStyle = bellBadgeReady ? 'rgba(34, 211, 238, 0.22)' : 'rgba(51, 65, 85, 0.6)';
  drawRoundedRect(ctx, bellX - 15, bellY - 14, 30, 28, 7);
  ctx.fill();

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔔', bellX, bellY + 4.5);

  if (bellBadgeReady) {
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(bellX + 10, bellY - 8, 7 + badgePulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '900 9.5px system-ui, sans-serif';
    ctx.fillText('1', bellX + 10, bellY - 4.5);
  }

  // 4. Desktop Mouse Pointer Gliding to System Tray & Opening Notification Panel
  if (t >= 0.16 && t <= 0.50) {
    const moveT = easeInOutCubic(Math.min(1, (t - 0.16) / 0.18));
    const cursorX = 560 + (bellX - 560) * moveT;
    const cursorY = 260 + (bellY - 260) * moveT;

    // Click ripple right when cursor reaches notification tray (0.32..0.42)
    if (t >= 0.31 && t <= 0.44) {
      const clickR = ((t - 0.31) / 0.13) * 24;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bellX, bellY, 6 + clickR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crisp White Arrow Cursor
    ctx.save();
    ctx.translate(cursorX, cursorY);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 20);
    ctx.lineTo(6, 15);
    ctx.lineTo(11, 23);
    ctx.lineTo(14, 21);
    ctx.lineTo(9, 13);
    ctx.lineTo(16, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Generates crisp static PNG Data URLs for both Mobile & PC Notification Screens
 */
export function generateStaticOSPreviewImages(
  payload: MorningNotificationPayload,
  copy: NotificationPreviewCopy
): { mobileImageUrl: string; pcImageUrl: string } {
  const mobileCanvas = document.createElement('canvas');
  renderMobileNotificationScreen(mobileCanvas, payload, copy, 1);
  const mobileImageUrl = mobileCanvas.toDataURL('image/png');

  const pcCanvas = document.createElement('canvas');
  renderPCNotificationScreen(pcCanvas, payload, copy, 1);
  const pcImageUrl = pcCanvas.toDataURL('image/png');

  return { mobileImageUrl, pcImageUrl };
}

/**
 * Exports a real 5.5-second 30fps WebM video of the Mobile or PC notification reveal animation
 */
export async function exportNotificationRevealWebM(
  device: 'mobile' | 'pc',
  payload: MorningNotificationPayload,
  copy: NotificationPreviewCopy
): Promise<string> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('Video recording is not supported in this browser.');
  }

  const canvas = document.createElement('canvas');
  const fps = 30;
  const durationMs = 5400;
  const totalFrames = Math.round((durationMs / 1000) * fps);

  if (device === 'mobile') {
    renderMobileNotificationScreen(canvas, payload, copy, 0);
  } else {
    renderPCNotificationScreen(canvas, payload, copy, 0);
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<string>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(URL.createObjectURL(blob));
      } catch (err) {
        reject(err);
      }
    };
    recorder.onerror = () => reject(new Error('Failed to encode WebM video.'));

    recorder.start();

    let frame = 0;
    const interval = setInterval(() => {
      const progress = Math.min(1, frame / totalFrames);
      if (device === 'mobile') {
        renderMobileNotificationScreen(canvas, payload, copy, progress);
      } else {
        renderPCNotificationScreen(canvas, payload, copy, progress);
      }
      frame += 1;
      if (frame > totalFrames) {
        clearInterval(interval);
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }
    }, Math.round(1000 / fps));
  });
}
