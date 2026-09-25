// PROTOTYPE — throwaway. Shared chrome for the connection-validation prototype
// variants (#1327). Only the two-panel frame is shared; each variant is free to
// render its form and list however it likes. See PROTOTYPE.md.

import type { ReactNode } from "react";

import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelHeaderActions,
  PanelTitle,
} from "@/components";

export function PrototypeFrame({
  formPanel,
  listPanel,
}: {
  formPanel: ReactNode;
  listPanel: ReactNode;
}) {
  return (
    <div className="grid h-full grid-cols-2 gap-2">
      <div className="h-full min-h-0">{listPanel}</div>
      <div className="h-full min-h-0">{formPanel}</div>
    </div>
  );
}

export function PrototypePanel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>{title}</PanelTitle>
        {actions ? <PanelHeaderActions>{actions}</PanelHeaderActions> : null}
      </PanelHeader>
      <PanelContent className="overflow-auto p-3">{children}</PanelContent>
    </Panel>
  );
}

/** A labelled boundary marking which fixture state a block demonstrates. */
export function StateLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-muted-foreground mt-4 mb-1 text-xs font-semibold tracking-wide uppercase first:mt-0">
      {children}
    </div>
  );
}
