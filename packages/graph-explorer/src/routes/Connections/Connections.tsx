import { useSearchParams } from "react-router";

import {
  NavBar,
  NavBarContent,
  NavBarTitle,
  NotInProduction,
  Panel,
  PanelContent,
  PanelEmptyState,
  PanelGroup,
  RouteButtonGroup,
  PersistenceStatusIndicator,
  Workspace,
  WorkspaceContent,
} from "@/components";
import GraphExplorerIcon from "@/components/icons/GraphExplorerIcon";
import { useConfiguration } from "@/core";
import { useIsSyncing } from "@/hooks/useSchemaSync";
import AvailableConnections from "@/modules/AvailableConnections";
// PROTOTYPE (#1327) — throwaway; remove with the connectionValidationPrototype directory.
import { ConnectionValidationPrototype } from "@/modules/AvailableConnections/connectionValidationPrototype";
import ConnectionDetail from "@/modules/ConnectionDetail";

export default function Connections() {
  const config = useConfiguration();
  const isSyncing = useIsSyncing();
  const [searchParams] = useSearchParams();
  const showPrototype =
    searchParams.get("prototype") === "connection-validation";

  return (
    <Workspace>
      <NavBar logoVisible>
        <NavBarContent>
          <NavBarTitle
            title="Connections Details"
            subtitle={`Connection: ${config?.displayLabel || config?.id || "none"}`}
          />
          <PersistenceStatusIndicator />
        </NavBarContent>
        <RouteButtonGroup active="connections" />
      </NavBar>
      <WorkspaceContent>
        {showPrototype ? (
          <NotInProduction>
            <ConnectionValidationPrototype />
          </NotInProduction>
        ) : (
          <PanelGroup className="grid grid-cols-2 gap-2">
            <div className="h-full grow">
              <AvailableConnections isSync={isSyncing} />
            </div>
            {config ? (
              <div className="h-full grow">
                <ConnectionDetail config={config} />
              </div>
            ) : (
              <NoActiveConnectionPanel />
            )}
          </PanelGroup>
        )}
      </WorkspaceContent>
    </Workspace>
  );
}

function NoActiveConnectionPanel() {
  return (
    <Panel>
      <PanelContent>
        <PanelEmptyState
          icon={<GraphExplorerIcon />}
          title="No Active Connection"
          subtitle="Select a connection in the left panel to be the active connection."
        />
      </PanelContent>
    </Panel>
  );
}
