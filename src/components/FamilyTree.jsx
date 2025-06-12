import { useEffect, useRef, useState } from 'react'
import { data } from '../assets/data'
import './FamilyTree.css';
import f3 from 'family-chart';

export default function FamilyTree() {
  const cont = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    if (!cont.current) return;
      // Responsive configuration based on screen size
    const getConfig = () => {
      if (isMobile) {
        return {
          node_separation: 120,
          level_separation: 80,
          card_dim: { w: 140, h: 50, text_x: 45, text_y: 10, img_w: 35, img_h: 35, img_x: 5, img_y: 7 }
        };
      } else if (window.innerWidth < 1024) {
        return {
          node_separation: 150,
          level_separation: 100,
          card_dim: { w: 160, h: 55, text_x: 55, text_y: 12, img_w: 40, img_h: 40, img_x: 5, img_y: 7 }
        };
      } else {
        return {
          node_separation: 180,
          level_separation: 120,
          card_dim: { w: 180, h: 60, text_x: 65, text_y: 13, img_w: 45, img_h: 45, img_x: 5, img_y: 7 }
        };
      }
    };

    const config = getConfig();
    
    const store = f3.createStore({
      data: data(),
      node_separation: config.node_separation,
      level_separation: config.level_separation
    });

    const svg = f3.createSvg(document.querySelector("#FamilyChart"));
    
    const Card = f3.elements.Card({
      store,
      svg,
      card_dim: config.card_dim,
      card_display: [
        i => `${i.data["first name"] || ""} ${i.data["last name"] || ""}`,
        i => `${i.data.birthday || ""}`
      ],
      mini_tree: true,
      link_break: false
    });

    store.setOnUpdate(props => f3.view(store.getTree(), svg, Card, props || {}));
    store.updateTree({ initial: true });

    // Handle touch events for mobile
    if (isMobile) {
      const familyChart = document.querySelector("#FamilyChart");
      if (familyChart) {
        familyChart.style.touchAction = 'pan-x pan-y';
      }
    }

    // Cleanup function
    return () => {
      // Clear the chart content
      const chartElement = document.querySelector("#FamilyChart");
      if (chartElement) {
        chartElement.innerHTML = '';
      }
    };
  }, [isMobile]); // Re-run when mobile state changes

  return <div className="f3" id="FamilyChart" ref={cont}></div>;
}