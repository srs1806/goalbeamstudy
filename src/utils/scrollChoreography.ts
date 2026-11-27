export type ScrollDirectionVariant = 'left' | 'right' | 'bottom' | 'fade';
export type ScrollRevealState = 'visible' | 'exit-bottom';

function isCardLikeSurface(el: HTMLElement): boolean {
  const cls = typeof el.className === 'string' ? el.className : '';
  return (
    /(?:^|\s)(rounded-2xl|rounded-xl|rounded-lg)(?:\s|$)/.test(cls) ||
    /(?:^|\s)border(?:-\S+)?(?:\s|$)/.test(cls) ||
    cls.includes('bg-[var(--bg-card)]') ||
    cls.includes('bg-gradient-') ||
    el.tagName === 'FOOTER' ||
    el.tagName === 'FORM'
  );
}

function isPureLayoutContainer(el: HTMLElement): boolean {
  if (el.hasAttribute('data-scroll-split')) return true;
  if (el.hasAttribute('data-scroll-group')) return true;

  const cls = typeof el.className === 'string' ? el.className : '';
  const hasCardSurface =
    cls.includes('bg-[var(--bg-card)]') ||
    cls.includes('bg-gradient-') ||
    /(?:^|\s)border(?:-\S+)?(?:\s|$)/.test(cls);

  if (hasCardSurface) return false;

  return (
    /(?:^|\s)grid(?:\s|$)/.test(cls) ||
    cls.includes('space-y-') ||
    el.tagName === 'SECTION' ||
    el.tagName === 'MAIN'
  );
}

function shouldSkipElement(el: HTMLElement): boolean {
  if (el.hasAttribute('data-scroll-skip')) return true;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'SVG') return true;
  if (el.getAttribute('role') === 'dialog') return true;
  if (el.getAttribute('aria-hidden') === 'true') return true;
  const cls = typeof el.className === 'string' ? el.className : '';
  if (
    /(?:^|\s)(fixed|sticky|sr-only|hidden)(?:\s|$)/.test(cls) &&
    !cls.includes('sm:flex') &&
    !cls.includes('md:flex') &&
    !cls.includes('sm:block')
  ) {
    return true;
  }
  if (el.offsetHeight < 16) return true;
  return false;
}

function collectChoreographyTargets(
  container: HTMLElement,
  maxContainerHeight: number,
  depth = 0,
  out: HTMLElement[] = []
): HTMLElement[] {
  if (depth > 7) return out;

  const children = Array.from(container.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement && !shouldSkipElement(node)
  );

  for (const child of children) {
    // Explicit leaf opt-in
    if (child.hasAttribute('data-scroll-item')) {
      out.push(child);
      continue;
    }

    const childCount = child.children.length;
    const cls = typeof child.className === 'string' ? child.className : '';
    const isGrid = /(?:^|\s)grid(?:\s|$)/.test(cls);
    const isTallUnstyledWrapper =
      childCount >= 2 &&
      child.offsetHeight > maxContainerHeight * 0.65 &&
      !isCardLikeSurface(child);

    if ((isGrid || isPureLayoutContainer(child) || isTallUnstyledWrapper) && childCount > 0 && depth < 7) {
      collectChoreographyTargets(child, maxContainerHeight, depth + 1, out);
      continue;
    }

    // If a large bordered card wraps multiple sub-cards (grids or stacked lists), animate its heading + each inner card
    if (
      isCardLikeSurface(child) &&
      child.offsetHeight > maxContainerHeight * 0.72 &&
      depth < 5 &&
      child.getAttribute('role') !== 'button'
    ) {
      const innerListOrGrid = Array.from(child.children).some(
        (sub): sub is HTMLElement =>
          sub instanceof HTMLElement &&
          !shouldSkipElement(sub) &&
          typeof sub.className === 'string' &&
          (/(?:^|\s)grid(?:\s|$)/.test(sub.className) || sub.className.includes('space-y-')) &&
          sub.children.length >= 2
      );
      if (innerListOrGrid) {
        collectChoreographyTargets(child, maxContainerHeight, depth + 1, out);
        continue;
      }
    }

    // Animate cards, headers, section bars, toolbars, footers, etc.
    if (isCardLikeSurface(child) || depth <= 4) {
      out.push(child);
    }
  }

  return out;
}

/**
 * Returns the UNTRANSFORMED layout top of `el` relative to `scrollRoot`'s top content edge.
 * Using `offsetTop` guarantees CSS `transform` transitions NEVER affect visibility math (zero flicker).
 */
function getLayoutTopInRoot(el: HTMLElement, scrollRoot: HTMLElement): number {
  let top = 0;
  let curr: HTMLElement | null = el;

  while (curr && curr !== scrollRoot && curr !== document.body) {
    top += curr.offsetTop + (curr !== el ? curr.clientTop : 0);
    curr = curr.offsetParent as HTMLElement | null;
  }

  if (curr === scrollRoot) {
    return top;
  }

  const docTop = (node: HTMLElement) => {
    let y = 0;
    let ptr: HTMLElement | null = node;
    while (ptr) {
      y += ptr.offsetTop;
      ptr = ptr.offsetParent as HTMLElement | null;
    }
    return y;
  };
  return docTop(el) - docTop(scrollRoot);
}

/**
 * Returns the UNTRANSFORMED layout horizontal center of `el` relative to `scrollRoot`.
 * Immune to CSS horizontal `translate3d(...)` transforms during transitions.
 */
function getLayoutCenterXInRoot(el: HTMLElement, scrollRoot: HTMLElement): number {
  let left = 0;
  let curr: HTMLElement | null = el;

  while (curr && curr !== scrollRoot && curr !== document.body) {
    left += curr.offsetLeft + (curr !== el ? curr.clientLeft : 0);
    curr = curr.offsetParent as HTMLElement | null;
  }

  if (curr !== scrollRoot) {
    const docLeft = (node: HTMLElement) => {
      let x = 0;
      let ptr: HTMLElement | null = node;
      while (ptr) {
        x += ptr.offsetLeft;
        ptr = ptr.offsetParent as HTMLElement | null;
      }
      return x;
    };
    left = docLeft(el) - docLeft(scrollRoot);
  }

  return left + el.offsetWidth / 2;
}

interface RowSlotMeta {
  rowBucket: number;
  dir: ScrollDirectionVariant;
  withinRowOffsetMs: number;
}

/**
 * Groups tracked targets by rendered visual row (`Math.round(layoutTop / 28)`)
 * so every multi-column row enters & exits with true bilateral mirror symmetry.
 */
function buildRowSymmetryMap(
  elements: HTMLElement[],
  scrollRoot: HTMLElement
): Map<HTMLElement, RowSlotMeta> {
  const rowMap = new Map<
    number,
    Array<{ el: HTMLElement; layoutTop: number; centerX: number }>
  >();

  for (const el of elements) {
    if (!el.isConnected || el.offsetHeight < 16) continue;
    const layoutTop = getLayoutTopInRoot(el, scrollRoot);
    const centerX = getLayoutCenterXInRoot(el, scrollRoot);
    const bucket = Math.round(layoutTop / 28);
    const existing = rowMap.get(bucket);
    if (existing) {
      existing.push({ el, layoutTop, centerX });
    } else {
      rowMap.set(bucket, [{ el, layoutTop, centerX }]);
    }
  }

  const sortedBuckets = Array.from(rowMap.keys()).sort((a, b) => a - b);
  const metaMap = new Map<HTMLElement, RowSlotMeta>();
  let singleCardIndex = 0;

  sortedBuckets.forEach((bucket, rowIdx) => {
    const rowItems = rowMap.get(bucket)!.sort((a, b) => a.centerX - b.centerX);

    if (rowItems.length === 1) {
      const { el } = rowItems[0];
      const explicit = el.getAttribute('data-scroll') as ScrollDirectionVariant | null;
      let dir: ScrollDirectionVariant;

      if (explicit === 'left' || explicit === 'right' || explicit === 'bottom' || explicit === 'fade') {
        dir = explicit;
      } else if (rowIdx === 0 || el.tagName === 'FOOTER') {
        dir = 'bottom';
      } else if (!isCardLikeSurface(el) && el.offsetHeight < 96) {
        dir = 'fade';
      } else {
        dir = singleCardIndex % 2 === 0 ? 'left' : 'right';
        singleCardIndex += 1;
      }

      metaMap.set(el, {
        rowBucket: bucket,
        dir,
        withinRowOffsetMs: 0,
      });
      return;
    }

    if (rowItems.length === 2) {
      rowItems.forEach(({ el }, colIdx) => {
        const explicit = el.getAttribute('data-scroll') as ScrollDirectionVariant | null;
        const dir: ScrollDirectionVariant =
          explicit === 'left' || explicit === 'right' || explicit === 'bottom' || explicit === 'fade'
            ? explicit
            : colIdx === 0
            ? 'left'
            : 'right';
        metaMap.set(el, {
          rowBucket: bucket,
          dir,
          withinRowOffsetMs: 0, // Simultaneous left/right pair for crisp bilateral symmetry
        });
      });
      return;
    }

    if (rowItems.length === 3) {
      rowItems.forEach(({ el }, colIdx) => {
        const explicit = el.getAttribute('data-scroll') as ScrollDirectionVariant | null;
        const defaultDir: ScrollDirectionVariant =
          colIdx === 0 ? 'left' : colIdx === 1 ? 'bottom' : 'right';
        const dir: ScrollDirectionVariant =
          explicit === 'left' || explicit === 'right' || explicit === 'bottom' || explicit === 'fade'
            ? explicit
            : defaultDir;
        metaMap.set(el, {
          rowBucket: bucket,
          dir,
          withinRowOffsetMs: colIdx === 1 ? 0 : 45, // Center anchors first, outer flanks open simultaneously
        });
      });
      return;
    }

    // 4+ columns: balanced mirror outward/inward around row horizontal midpoint
    const mid = (rowItems.length - 1) / 2;
    rowItems.forEach(({ el }, colIdx) => {
      const explicit = el.getAttribute('data-scroll') as ScrollDirectionVariant | null;
      const defaultDir: ScrollDirectionVariant =
        Math.abs(colIdx - mid) < 0.01
          ? 'bottom'
          : colIdx < mid
          ? 'left'
          : 'right';
      const dir: ScrollDirectionVariant =
        explicit === 'left' || explicit === 'right' || explicit === 'bottom' || explicit === 'fade'
          ? explicit
          : defaultDir;
      const ringStep = Math.round(Math.abs(colIdx - mid));
      metaMap.set(el, {
        rowBucket: bucket,
        dir,
        withinRowOffsetMs: Math.min(ringStep * 36, 108),
      });
    });
  });

  return metaMap;
}

/**
 * Measures the effective bottom edge of the scroll viewport above any fixed BottomNav bar
 * and our luminous Entrance & Exit Horizon Gate.
 */
function getVisibleViewportHeight(scrollRoot: HTMLElement): number {
  const rootRect = scrollRoot.getBoundingClientRect();
  let visibleBottom = rootRect.bottom;

  const nav = document.querySelector<HTMLElement>('nav[aria-label="Primary Mobile Navigation"]');
  if (nav) {
    const navRect = nav.getBoundingClientRect();
    if (navRect.top < visibleBottom && navRect.bottom > rootRect.top) {
      visibleBottom = Math.min(visibleBottom, navRect.top);
    }
  }

  return Math.max(180, visibleBottom - rootRect.top);
}

/**
 * Attaches row-synchronized, symmetrical scroll choreography to a scroll root.
 * Strictly preserves:
 *   - Scrolling DOWN: Entrance ONLY (`exit-bottom -> visible`). Elements above NEVER exit.
 *   - Scrolling UP: Exit ONLY from the bottom horizon gate (`visible -> exit-bottom`).
 *   - Bilateral symmetry per visual horizontal row (`2-col`, `3-col`, `4-col`).
 *   - Luminous Horizon Gate reactivity (`#app-scroll-gate[data-gate-active="enter" | "exit"]`).
 */
export function attachScrollChoreography(scrollRoot: HTMLElement, screenKey: string): () => void {
  if (
    typeof window === 'undefined' ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {};
  }

  let rafId = 0;
  let gateResetTimer = 0;
  let lastScrollTop = scrollRoot.scrollTop;
  let dirAnchorScrollTop = scrollRoot.scrollTop;
  let committedDir: 'down' | 'up' = 'down';
  let isDisposed = false;
  let trackedElements: HTMLElement[] = [];
  let rowSymmetryMap = new Map<HTMLElement, RowSlotMeta>();

  const pulseHorizonGate = (mode: 'enter' | 'exit') => {
    const gateEl = document.getElementById('app-scroll-gate');
    if (!gateEl) return;
    gateEl.setAttribute('data-gate-active', mode);
    if (gateResetTimer) window.clearTimeout(gateResetTimer);
    gateResetTimer = window.setTimeout(() => {
      gateResetTimer = 0;
      const el = document.getElementById('app-scroll-gate');
      if (el) el.removeAttribute('data-gate-active');
    }, 360);
  };

  const discoverTargets = (): boolean => {
    const visibleHeight = getVisibleViewportHeight(scrollRoot);
    const currentScrollTop = scrollRoot.scrollTop;
    const rawTargets = collectChoreographyTargets(scrollRoot, visibleHeight, 0, []);

    const seen = new Set<HTMLElement>();
    trackedElements = rawTargets.filter((el) => {
      if (seen.has(el)) return false;
      seen.add(el);
      return true;
    });

    rowSymmetryMap = buildRowSymmetryMap(trackedElements, scrollRoot);

    let addedNewVisible = false;
    const distinctInitialVisibleRows = new Map<number, number>();

    trackedElements.forEach((el) => {
      const slot = rowSymmetryMap.get(el);
      const dir: ScrollDirectionVariant = slot?.dir || 'bottom';
      if (el.getAttribute('data-scroll-dir') !== dir) {
        el.setAttribute('data-scroll-dir', dir);
      }

      if (!el.hasAttribute('data-scroll-state')) {
        const layoutTop = getLayoutTopInRoot(el, scrollRoot);
        const visTop = layoutTop - currentScrollTop;

        if (visTop > visibleHeight - 16) {
          el.setAttribute('data-scroll-state', 'exit-bottom');
        } else {
          const bucket = slot?.rowBucket ?? Math.round(layoutTop / 28);
          if (!distinctInitialVisibleRows.has(bucket)) {
            distinctInitialVisibleRows.set(bucket, distinctInitialVisibleRows.size);
          }
          const rowOrder = distinctInitialVisibleRows.get(bucket)!;
          const baseRowDelay = Math.min(rowOrder * 65, 260);
          const delay = Math.min(baseRowDelay + (slot?.withinRowOffsetMs || 0), 320);

          el.style.setProperty('--scroll-delay', `${delay}ms`);
          el.setAttribute('data-scroll-state', 'exit-bottom');
          addedNewVisible = true;
        }
      }
    });

    if (addedNewVisible) {
      // Force single layout style flush so newly added above-the-fold items transition cleanly
      void scrollRoot.offsetHeight;
    }

    return addedNewVisible;
  };

  const evaluateVisibility = (initialFlush = false) => {
    rafId = 0;
    if (isDisposed) return;

    const currentScrollTop = scrollRoot.scrollTop;
    const stepDelta = currentScrollTop - lastScrollTop;
    lastScrollTop = currentScrollTop;

    // Update committed scroll direction using an 8px deadband to ignore trackpad micro-bounce
    if (stepDelta > 0) {
      if (committedDir === 'down') {
        dirAnchorScrollTop = currentScrollTop;
      } else if (currentScrollTop - dirAnchorScrollTop >= 8) {
        committedDir = 'down';
        dirAnchorScrollTop = currentScrollTop;
      }
    } else if (stepDelta < 0) {
      if (committedDir === 'up') {
        dirAnchorScrollTop = currentScrollTop;
      } else if (dirAnchorScrollTop - currentScrollTop >= 8) {
        committedDir = 'up';
        dirAnchorScrollTop = currentScrollTop;
      }
    }

    const scrollingUp = committedDir === 'up';
    const visibleHeight = getVisibleViewportHeight(scrollRoot);

    const newlyEntering: HTMLElement[] = [];
    const newlyExitingBottom: HTMLElement[] = [];

    for (const el of trackedElements) {
      if (!el.isConnected) continue;

      const elHeight = el.offsetHeight;
      if (elHeight < 16) continue;

      const layoutTop = getLayoutTopInRoot(el, scrollRoot);
      const visTop = layoutTop - currentScrollTop;
      const state = (el.getAttribute('data-scroll-state') as ScrollRevealState) || 'visible';

      const enterPad = Math.min(24, Math.max(10, elHeight * 0.22));
      // Trigger bottom exit smoothly while lower cards cross the bottom horizon gate above BottomNav
      const exitInsideBand = Math.min(
        104,
        Math.max(26, Math.min(elHeight * 0.42, Math.max(26, elHeight * 0.64)))
      );

      // Strict asymmetric rules:
      // 1) Scrolling DOWN: ONLY entrance effects (exit-bottom -> visible). Elements above NEVER exit!
      // 2) Scrolling UP: Exit effect ONLY from the bottom gate (visible -> exit-bottom). Nothing exits at top!
      if (state === 'exit-bottom') {
        const isSolidlyAboveOrInside = visTop < visibleHeight - exitInsideBand - 16;
        if (
          isSolidlyAboveOrInside ||
          ((!scrollingUp || initialFlush) && visTop <= visibleHeight - enterPad)
        ) {
          newlyEntering.push(el);
        }
      } else if (state === 'visible') {
        if (!initialFlush && scrollingUp && visTop >= visibleHeight - exitInsideBand) {
          newlyExitingBottom.push(el);
        } else if (visTop >= visibleHeight + 24 && scrollingUp) {
          newlyExitingBottom.push(el);
        }
      } else {
        // Fallback safety: never leave any element in hidden state
        newlyEntering.push(el);
      }
    }

    // Group entering delays by visual horizontal row so multi-column cards glide symmetrically
    if (newlyEntering.length > 0) {
      const enteringRowOrder = new Map<number, number>();
      newlyEntering.forEach((el) => {
        const slot = rowSymmetryMap.get(el);
        const bucket = slot?.rowBucket ?? Math.round(getLayoutTopInRoot(el, scrollRoot) / 28);
        if (!enteringRowOrder.has(bucket)) {
          enteringRowOrder.set(bucket, enteringRowOrder.size);
        }
        const rowSeq = enteringRowOrder.get(bucket)!;
        const delay = Math.min(rowSeq * 60 + (slot?.withinRowOffsetMs || 0), 300);
        el.style.setProperty('--scroll-delay', `${delay}ms`);
        el.setAttribute('data-scroll-state', 'visible');
      });

      if (!initialFlush) {
        pulseHorizonGate('enter');
      }
    }

    // Group exiting delays by visual horizontal row (bottom-most rows exit first while scrolling up)
    if (newlyExitingBottom.length > 0) {
      const orderedExit = [...newlyExitingBottom].reverse();
      const exitingRowOrder = new Map<number, number>();
      orderedExit.forEach((el) => {
        const slot = rowSymmetryMap.get(el);
        const bucket = slot?.rowBucket ?? Math.round(getLayoutTopInRoot(el, scrollRoot) / 28);
        if (!exitingRowOrder.has(bucket)) {
          exitingRowOrder.set(bucket, exitingRowOrder.size);
        }
        const rowSeq = exitingRowOrder.get(bucket)!;
        const delay = Math.min(rowSeq * 30, 90);
        el.style.setProperty('--scroll-delay', `${delay}ms`);
        el.setAttribute('data-scroll-state', 'exit-bottom');
      });

      if (!initialFlush) {
        pulseHorizonGate('exit');
      }
    }
  };

  const scheduleEvaluate = (rediscover = false, initialFlush = false) => {
    if (isDisposed) return;
    const flushedNew = rediscover ? discoverTargets() : false;
    const isInitial = initialFlush || flushedNew;
    if (!rafId) {
      rafId = window.requestAnimationFrame(() => evaluateVisibility(isInitial));
    }
  };

  // Initial discovery & guaranteed frame-separated reveal
  discoverTargets();
  rafId = window.requestAnimationFrame(() => evaluateVisibility(true));

  const handleScroll = () => scheduleEvaluate(false, false);
  const handleResize = () => scheduleEvaluate(true, true);

  scrollRoot.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  const mutationObserver = new MutationObserver(() => {
    scheduleEvaluate(true, true);
  });
  mutationObserver.observe(scrollRoot, { childList: true, subtree: true });

  const settleTimer = window.setTimeout(() => scheduleEvaluate(true, true), 260);

  return () => {
    isDisposed = true;
    if (rafId) window.cancelAnimationFrame(rafId);
    if (gateResetTimer) window.clearTimeout(gateResetTimer);
    window.clearTimeout(settleTimer);
    scrollRoot.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    mutationObserver.disconnect();
    const gateEl = document.getElementById('app-scroll-gate');
    if (gateEl) gateEl.removeAttribute('data-gate-active');
    trackedElements.forEach((el) => {
      el.removeAttribute('data-scroll-dir');
      el.removeAttribute('data-scroll-state');
      el.style.removeProperty('--scroll-delay');
    });
    void screenKey;
  };
}
