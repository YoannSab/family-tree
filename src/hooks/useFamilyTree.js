import { useEffect, useRef, useCallback } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';
import f3 from 'family-chart';

export const useFamilyTree = (familyData, onPersonClick, onResetView) => {
  const chartRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

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
        .setCardYSpacing(cardYSpacing);

      const f3Card = f3Chart.setCard(f3.CardHtml)
        .setCardInnerHtmlCreator(d => {
          const fontSize = isMobile ? '12px' : '14px';
          const cardWidth = isMobile ? '160px' : '200px';
          const avatarSize = '60px';
          const avatarImg = `<img src="/images/${d.data.data.image}.JPG" onerror="this.onerror=null; this.src='/images/default.png';" style="width: ${avatarSize}; height: ${avatarSize}; object-fit: cover; border-radius: 50%; border: 1px solid #c8a882;">`;

          return `
          <div class="card-inner italian-card" style="position: relative; width: ${cardWidth}; font-size: ${fontSize}; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border: 2px solid #c8a882; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="avatar" style="flex-shrink: 0;">
                ${avatarImg}
              </div>
              <div style="flex-grow: 1;">
                <div class="card-name" style="font-weight: bold; margin-bottom: 4px; font-size: ${isMobile ? '13px' : '15px'}; color: #2d5a27; text-align: center;">
              ${d.data.data.firstName} ${d.data.data.lastName}
                </div>
                <div class="card-birthday" style="font-size: ${isMobile ? '10px' : '12px'}; color: #666; margin-bottom: 2px; text-align: center;">
              ${d.data.data.birthday ? d.data.data.birthday : ''}${d.data.data.death ? ' - ' + d.data.data.death : ''}
                </div>
                <div class="card-occupation" style="font-size: ${isMobile ? '10px' : '11px'}; color: #888; font-style: italic; text-align: center;">
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
        // f3Card.onCardClickDefault(e, d);
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

  return { chartRef, centerOnPerson };
};
