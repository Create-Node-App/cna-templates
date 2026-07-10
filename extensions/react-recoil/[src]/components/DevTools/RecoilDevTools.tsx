import React from 'react';
// @ts-expect-error -- types may not resolve with TS6 bundler mode
import { RecoilLogger } from 'recoil-devtools-logger';
// @ts-expect-error -- types may not resolve with TS6 bundler mode
import LogMonitor from 'recoil-devtools-log-monitor';
// @ts-expect-error -- types may not resolve with TS6 bundler mode
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