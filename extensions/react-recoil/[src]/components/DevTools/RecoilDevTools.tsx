import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RecoilLogger } from 'recoil-devtools-logger';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LogMonitor from 'recoil-devtools-log-monitor';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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