import React, { useMemo } from 'react';
import '../css/FamilyTree.css';
import { useFamilyTree } from '../hooks/useFamilyTree';

export default function FamilyTree({ onPersonClick, familyData }) {
  const memoizedFamilyData = useMemo(() => familyData, [familyData]);
  const memoizedOnPersonClick = React.useCallback(onPersonClick, [onPersonClick]);

  useFamilyTree(memoizedFamilyData, memoizedOnPersonClick);

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
        boxShadow: '0 8px 32px rgba(45, 90, 39, 0.3)',
      }}
    />
  );
}
