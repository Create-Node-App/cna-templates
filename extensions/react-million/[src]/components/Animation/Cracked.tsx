import React, { FC } from "react";
import { For, block } from "million/react";
import "./slicer.scss";
import "./cracked.css";

export interface CrackedProps {
  children?: React.ReactNode;
}

export interface SlicerProps {
  i: number;
  children?: React.ReactNode;
}

const Slicer: FC<SlicerProps> = block(({ i, children }) => (
  <div key={`slice-${i + 1}`} className="text">
    {children}
  </div>
));

const Cracked: FC<CrackedProps> = ({ children }) => (
  <div className="bg-text">
    <div className="slicer-gradient">
      <For each={new Array(40).fill(1).map((_, i) => i + 1)}>
        {(i) => (
          <Slicer key={`slice-${i}`} i={i}>
            {children}
          </Slicer>
        )}
      </For>
    </div>
  </div>
);

export default Cracked;
