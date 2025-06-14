import { useEffect, useRef} from 'react'
import { useBreakpointValue } from '@chakra-ui/react'
import './FamilyTree.css';
import f3 from 'family-chart';


export default function FamilyTree({ onPersonClick, familyData }) {
  const chartRef = useRef(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })

  useEffect(() => {
    if (!familyData || familyData.length === 0) {
      return;
    }
    
    function create(data) {
      // Clear previous chart
      const container = document.getElementById('FamilyChart')
      if (container) {
        container.innerHTML = ''
      }

      // Responsive spacing based on device
      const cardXSpacing = isMobile ? 180 : isTablet ? 220 : 250
      const cardYSpacing = isMobile ? 120 : isTablet ? 140 : 150

      const f3Chart = f3.createChart('#FamilyChart', data)
        .setTransitionTime(500)
        .setCardXSpacing(cardXSpacing)
        .setCardYSpacing(cardYSpacing)

      const f3Card = f3Chart.setCard(f3.CardHtml)        
      .setCardInnerHtmlCreator(d => {
          const fontSize = isMobile ? '12px' : '14px'
          const cardWidth = isMobile ? '160px' : '200px' // Made cards slightly wider to accommodate image
          const isReliable = d.data.data.reliable
          const reliabilityIndicator = isReliable === false ? 
        `<div style="position: absolute; top: 4px; right: 4px; width: 12px; height: 12px; background: #f56565; border-radius: 50%; border: 1px solid white;" title="Unreliable information"></div>` : 
        `<div style="position: absolute; top: 4px; right: 4px; width: 12px; height: 12px; background: #48bb78; border-radius: 50%; border: 1px solid white;" title="Reliable information"></div>`
          
          const avatarSize = '60px'
            const avatarImg = `<img src="/images/${d.data.data.image}.JPG" onerror="this.onerror=null; this.src='/images/default.png';" style="width: ${avatarSize}; height: ${avatarSize}; object-fit: cover; border-radius: 50%; border: 1px solid #c8a882;">`

          return `<div class="card-inner italian-card" style="position: relative; width: ${cardWidth}; font-size: ${fontSize}; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border: 2px solid #c8a882; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        ${reliabilityIndicator}
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
        })

      f3Card.setOnCardClick((e, d) => {
        if (onPersonClick) {
          onPersonClick(d.data);
        }
        f3Card.onCardClickDefault(e, d);
      });
      
      f3Chart.updateTree({ initial: true })
      chartRef.current = f3Chart
    }
    
    create(familyData);

  }, [familyData, isMobile, isTablet]);
  return (
    <div 
      id="FamilyChart" 
      className="f3 italian-family-tree" 
      style={{ 
        width: '100%', 
        height: '100%',
        margin: 'auto', 
        background: 'linear-gradient(135deg, #2d5a27 0%, #1e3a1a 100%)',
        color: '#fff',
        overflow: 'auto',
        borderRadius: '12px',
        position: 'relative',
        border: '3px solid #c8a882',
        boxShadow: '0 8px 32px rgba(45, 90, 39, 0.3)'
      }}
    />
  );
}
