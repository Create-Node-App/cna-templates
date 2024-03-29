import React from 'react';
import { RecoilLogger } from 'recoil-devtools-logger';
import LogMonitor from 'recoil-devtools-log-monitor';
import DockMonitor from 'recoil-devtools-dock';

export const RecoilDevTools = () => {
  return (
    <>
      <RecoilLogger />
      <DockMonitor
        toggleVisibilityKey="ctrl-h"
        changePositionKey="ctrl-q"
        changeMonitorKey="ctrl-m"
        defaultIsVisible={false}
      >
        <LogMonitor markStateDiff />
      </DockMonitor>
    </>
  );
};