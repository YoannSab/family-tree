import React, { useMemo } from 'react';
import '../css/FamilyTree.css';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { THEME } from '../config/config';

export default function FamilyTree({ onPersonClick, familyData, onResetView, onCenterPerson, onContextMenu }) {
  const memoizedFamilyData = useMemo(() => familyData, [familyData]);
  const memoizedOnPersonClick = React.useCallback(onPersonClick, [onPersonClick]);

  const { centerOnPerson } = useFamilyTree(memoizedFamilyData, memoizedOnPersonClick, onResetView, onContextMenu);

  // Expose centerOnPerson function to parent
  React.useEffect(() => {
    if (onCenterPerson) {
      onCenterPerson(centerOnPerson);
    }
  }, [onCenterPerson, centerOnPerson]);

  return (
    <div
      id="FamilyChart"
      className="f3 tree-container"
      style={{
        width: '100%',
        height: '100%',
        margin: 'auto',
        background: `linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 100%)`,
        color: '#fff',
        overflow: 'auto',
        borderRadius: '12px',
        position: 'relative',
        border: `3px solid var(--theme-accent)`,
        boxShadow: `0 8px 32px rgba(var(--theme-primary-rgb), 0.3)`,
      }}
    />
  );
}
