import { useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useBreakpointValue } from '@chakra-ui/react';
import f3 from 'family-chart';
import { THEME, DATA_SOURCE } from '../config/config';

export const useFamilyTree = (familyData, onPersonClick, onResetView, onContextMenu) => {
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

  const centerOnPerson = useCallback((person) => {
    if (chartRef.current && person) {
      const tree = chartRef.current.store.getTree();
      // Find the datum for the specific person
      const datum = tree.data.find(d => d.data.id === person.id);
      if (datum) {
        f3.handlers.cardToMiddle({ 
          datum, 
          svg: chartRef.current.svg, 
          svg_dim: chartRef.current.svg.getBoundingClientRect(), 
          transition_time: 1000 
        });
      }
    }
  }, []);

  const resetTreeView = useCallback(() => {
    if (chartRef.current) {
      // Re-render the tree to reset view
      chartRef.current.updateTree({ initial: false });
    }
  }, []);

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

      const f3Card = f3Chart.setCard(f3.CardHtml)
      

        .setCardInnerHtmlCreator(d => {
          const fontSize = isMobile ? '12px' : '14px';
          const cardWidth = isMobile ? '160px' : '200px';
          const avatarSize = '60px';
          const avatarImg = `<img src="/images/${d.data.data.image}.JPG" onerror="this.onerror=null; this.src='/images/default.png';" style="width: ${avatarSize}; height: ${avatarSize}; object-fit: cover; border-radius: 50%; border: 1px solid ${THEME.accent};">`;

          return `
          <div class="card-inner tree-card" data-person-id="${d.data.id}" style="position: relative; width: ${cardWidth}; font-size: ${fontSize}; background: ${THEME.bgCard}; border: 2px solid ${THEME.accent}; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="avatar" style="flex-shrink: 0;">
                ${avatarImg}
              </div>
              <div style="flex-grow: 1;">
                <div class="card-name" style="font-weight: bold; margin-bottom: 4px; font-size: ${isMobile ? '13px' : '15px'}; color: ${THEME.primary}; text-align: center;">
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
        // Center the tree on the clicked person
        centerOnPerson(d.data);
        f3Card.onCardClickDefault(e, d);
      });

      f3Chart.updateTree({ initial: true });
      
      chartRef.current = f3Chart;
    }

    create(familyData);

  }, [familyData, isMobile, isTablet, onPersonClick]);

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
