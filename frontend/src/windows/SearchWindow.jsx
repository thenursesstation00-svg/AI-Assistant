import React from 'react';
import Search from '../Search';

export default function SearchWindow({ uiState }) {
  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden', background: '#fff', color: '#000' }}>
      <Search />
    </div>
  );
}
