import React from 'react';
import ControlPanel from '../panels/ControlPanel';

export default function DeveloperControlPanelWindow({ uiState }) {
  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      <ControlPanel />
    </div>
  );
}
