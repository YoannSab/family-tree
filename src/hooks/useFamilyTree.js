import { useEffect, useRef, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useBreakpointValue } from '@chakra-ui/react';
import f3 from 'family-chart';
import { THEME, DATA_SOURCE } from '../config/config';
import { getImageUrlCached, subscribeToCacheUpdate } from '../services/storageService';

export const useFamilyTree = (familyData, onPersonClick, onResetView, onContextMenu, familyId = null) => {
  const chartRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  // Refs so event listeners always see the latest values without re-attaching
  const familyDataRef   = useRef(familyData);
  const onContextMenuRef = useRef(onContextMenu);
  useEffect(() => { familyDataRef.current    = familyData;    }, [familyData]);
  useEffect(() => { onContextMenuRef.current = onContextMenu; }, [onContextMenu]);

  // Long-press tracking refs
  const longPressTimerRef    = useRef(null);
  const longPressTargetRef   = useRef(null);
  const isLongPressActiveRef = useRef(false);

  // Find the root ancestor with the most descendants (works on raw data, no chart needed).
  const findBestAncestor = (data) => {
    const roots = data.filter(p => !p.rels?.father && !p.rels?.mother);
    if (roots.length === 0) return data[0];
    if (roots.length === 1) return roots[0];

    // BFS count of all descendants
    const countDescendants = (personId) => {
      const visited = new Set();
      const queue = [personId];
      while (queue.length) {
        const id = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        const p = data.find(x => x.id === id);
        if (!p) continue;
        (p.rels?.children || []).forEach(cid => queue.push(cid));
      }
      return visited.size - 1; // exclude self
    };

    return roots.reduce((best, p) =>
      countDescendants(p.id) > countDescendants(best.id) ? p : best
    , roots[0]);
  };

  const bestAncestor = useMemo(() => findBestAncestor(familyData), [familyData]);

  const centerOnPerson = useCallback((person) => {
    if (chartRef.current && person) {
      chartRef.current.updateMainId(person.id);
      chartRef.current.updateTree({ tree_position: 'main_to_middle' });
    }
  }, []);

  const resetTreeView = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.updateMainId(bestAncestor?.id);
      chartRef.current.updateTree({ tree_position: 'fit' });
    }
  }, [bestAncestor]);

  useEffect(() => {
    if (!familyData || familyData.length === 0) {
      return;
    }

    function create(data) {
      const container = document.getElementById('FamilyChart');
      if (container) {
        container.innerHTML = '';
      }

      const cardXSpacing = isMobile ? 180 : isTablet ? 220 : 250;
      const cardYSpacing = isMobile ? 120 : isTablet ? 140 : 150;

      const f3Chart = f3.createChart('#FamilyChart', data)
        .setTransitionTime(500)
        .setCardXSpacing(cardXSpacing)
        .setCardYSpacing(cardYSpacing)
        .setSingleParentEmptyCard(false)
        // Sort children oldest-first by birth year
        .setSortChildrenFunction((a, b) => {
          const yearA = parseInt(a.data?.birthday) || 9999;
          const yearB = parseInt(b.data?.birthday) || 9999;
          return yearA - yearB;
        })
        // Sort spouses by birth year (consistent ordering for multi-spouse cases)
        .setSortSpousesFunction((d, allData) => {
          const spouses = [...(d.data?.rels?.spouses || [])];
          return spouses.sort((a, b) => {
            const spA = allData.find(p => p.id === a);
            const spB = allData.find(p => p.id === b);
            const yearA = parseInt(spA?.data?.birthday) || 9999;
            const yearB = parseInt(spB?.data?.birthday) || 9999;
            return yearA - yearB;
          });
        });

      const f3Card = f3Chart.setCard(f3.CardHtml)
        .setCardInnerHtmlCreator(d => {
          const fontSize = isMobile ? '12px' : '14px';
          const cardWidth = isMobile ? '160px' : '200px';
          const avatarSize = '60px';
          const avatarSrc = getImageUrlCached(familyId, d.data.data.image);
          const initials = `${(d.data.data.firstName?.[0] || '').toUpperCase()}${(d.data.data.lastName?.[0] || '').toUpperCase()}`;
          const initialsStyle = `width:${avatarSize};height:${avatarSize};border-radius:50%;background:var(--theme-primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;border:1px solid var(--theme-accent);flex-shrink:0;`;
          const initialsHtml = `<div style="${initialsStyle}">${initials}</div>`;
          const avatarHtml = avatarSrc
            ? `<img src="${avatarSrc}" data-fallback="${initialsHtml.replace(/"/g, '&quot;')}" onerror="this.outerHTML=this.dataset.fallback" style="width:${avatarSize};height:${avatarSize};object-fit:cover;border-radius:50%;border:1px solid var(--theme-accent);">`
            : initialsHtml;

          return `
          <div class="card-inner tree-card" data-person-id="${d.data.id}" style="position: relative; width: ${cardWidth}; font-size: ${fontSize}; background: ${THEME.bgCard}; border: 2px solid var(--theme-accent); border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="avatar" style="flex-shrink: 0;">
                ${avatarHtml}
              </div>
              <div style="flex-grow: 1;">
                <div class="card-name" style="font-weight: bold; margin-bottom: 4px; font-size: ${isMobile ? '13px' : '15px'}; color: var(--theme-primary); text-align: center;">
              ${d.data.data.firstName} ${d.data.data.lastName}
                </div>
                <div class="card-birthday" style="font-size: ${isMobile ? '10px' : '12px'}; color: ${THEME.textMuted}; margin-bottom: 2px; text-align: center;">
              ${d.data.data.birthday ? d.data.data.birthday : ''}${d.data.data.death ? ' - ' + d.data.data.death : ''}
                </div>
                <div class="card-occupation" style="font-size: ${isMobile ? '10px' : '11px'}; color: ${THEME.textSubtle}; font-style: italic; text-align: center;">
              ${d.data.data.occupation ? d.data.data.occupation : ''}
                </div>
              </div>
            </div>
          </div>`;
        });

      f3Card.setOnCardClick((e, d) => {
        if (onPersonClick) {
          onPersonClick(d.data);
        }
        f3Card.onCardClickDefault(e, d);
      });

      // Set the best ancestor as main person, then render with 'fit' to show the full tree
      f3Chart.updateMainId(bestAncestor.id);
      f3Chart.updateTree({ initial: true, tree_position: 'fit' });

      chartRef.current = f3Chart;
    }

    create(familyData);

  }, [familyData, isMobile, isTablet, onPersonClick]);

  // Patch tree card avatars in-place when blob URLs arrive (prefetch / upload).
  // Debounced: rapid updates (parallel prefetch) are batched into a single DOM pass.
  useEffect(() => {
    if (DATA_SOURCE !== 'firebase' || !familyId) return;
    let timer = null;
    const patchAll = () => {
      const container = document.getElementById('FamilyChart');
      if (!container) return;
      const avatarSize = '60px';
      container.querySelectorAll('[data-person-id]').forEach(card => {
        const person = familyDataRef.current?.find(p => p.id === card.dataset.personId);
        if (!person?.data?.image) return;
        const blobUrl = getImageUrlCached(familyId, person.data.image);
        if (!blobUrl) return;
        const avatarContainer = card.querySelector('.avatar');
        if (!avatarContainer) return;
        const current = avatarContainer.firstElementChild;
        if (current?.tagName === 'IMG' && current.src === blobUrl) return;
        const img = document.createElement('img');
        img.src = blobUrl;
        img.style.cssText = `width:${avatarSize};height:${avatarSize};object-fit:cover;border-radius:50%;border:1px solid var(--theme-accent);`;
        img.onerror = () => { img.style.display = 'none'; };
        if (current) avatarContainer.replaceChild(img, current);
        else avatarContainer.appendChild(img);
      });
    };
    return subscribeToCacheUpdate(() => {
      clearTimeout(timer);
      timer = setTimeout(patchAll, 80);
    });
  }, [familyId]);

  // Expose the reset function to the parent component
  useEffect(() => {
    if (onResetView) {
      onResetView(resetTreeView);
    }
  }, [onResetView, resetTreeView]);

  // ── Context-menu event delegation ────────────────────────────────────────────
  // Attached once on mount; uses refs so it always reads the latest data.
  // Only active when DATA_SOURCE === 'firebase' (local JSON is read-only).
  useEffect(() => {
    if (DATA_SOURCE !== 'firebase') return;

    const container = document.getElementById('FamilyChart');
    if (!container) return;

    /** Traverse up from an event target to find a card element with data-person-id */
    const getPersonFromTarget = (target) => {
      const card = target.closest?.('[data-person-id]');
      if (!card) return null;
      return familyDataRef.current?.find(p => p.id === card.dataset.personId) || null;
    };

    // ── Desktop: right-click ──────────────────────────────────────────────────
    const handleContextMenu = (e) => {
      const person = getPersonFromTarget(e.target);
      if (!person) return;
      e.preventDefault();
      e.stopPropagation();
      onContextMenuRef.current?.(person, { x: e.clientX, y: e.clientY });
    };

    // ── Mobile: long-press (≥500 ms) ─────────────────────────────────────────
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const person = getPersonFromTarget(e.target);
      if (!person) return;
      isLongPressActiveRef.current = false;
      longPressTargetRef.current   = { person, x: touch.clientX, y: touch.clientY };
      longPressTimerRef.current = setTimeout(() => {
        if (!longPressTargetRef.current) return;
        isLongPressActiveRef.current = true;
        const { person: p, x, y } = longPressTargetRef.current;
        // flushSync forces React to commit the state update immediately,
        // so the menu appears while the finger is still down (not on lift).
        flushSync(() => {
          onContextMenuRef.current?.(p, { x, y });
        });
      }, 500);
    };

    const handleTouchMove = () => {
      // Any movement cancels the long-press so normal scrolling still works
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      longPressTargetRef.current   = null;
      isLongPressActiveRef.current = false;
    };

    const handleTouchEnd = (e) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (isLongPressActiveRef.current) {
        // Prevent the tap-click that would otherwise fire after lifting the finger
        e.preventDefault();
        isLongPressActiveRef.current = false;
      }
      longPressTargetRef.current = null;
    };

    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('touchstart',  handleTouchStart, { passive: true });
    container.addEventListener('touchmove',   handleTouchMove,  { passive: true });
    container.addEventListener('touchend',    handleTouchEnd,   { passive: false });

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('touchstart',  handleTouchStart);
      container.removeEventListener('touchmove',   handleTouchMove);
      container.removeEventListener('touchend',    handleTouchEnd);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []); // Empty deps — uses refs for all mutable values

  return { chartRef, centerOnPerson };
};
