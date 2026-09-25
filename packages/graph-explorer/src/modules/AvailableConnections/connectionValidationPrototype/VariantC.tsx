// PROTOTYPE — throwaway. Variant C: row badge + fix drawer. The list is calm —
// each row carries only a status badge. Detail lives behind a click: opening a
// flagged row reveals a fix drawer (Dialog) that explains each issue and routes
// to the fix. The form carries a compact status rail instead of inline errors.
// Import failure opens the same drawer surface. See PROTOTYPE.md.

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  DatabaseIcon,
  TriangleAlertIcon,
} from "lucide-react";

import {
  Button,
  Chip,
  Input,
  Label,
  ListRowContent,
  ListRowSubtitle,
  ListRowTitle,
} from "@/components";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog";
import { cn } from "@/utils";

import {
  hardInvalidConnection,
  hardIssues,
  importErrorFileName,
  importErrorIssues,
  isHardInvalid,
  isSoftInvalid,
  prototypeConnections,
  softInvalidConnection,
  validConnection,
  type FieldIssue,
  type PrototypeConnection,
} from "./fixtures";
import { PrototypeFrame, PrototypePanel, StateLabel } from "./scaffold";

function StatusBadge({ issues }: { issues: FieldIssue[] }) {
  if (isHardInvalid(issues)) {
    return (
      <Chip variant="error">
        <AlertCircleIcon /> Blocked
      </Chip>
    );
  }
  if (isSoftInvalid(issues)) {
    return (
      <Chip variant="warning">
        <TriangleAlertIcon /> Warning
      </Chip>
    );
  }
  return (
    <Chip variant="success">
      <CheckCircle2Icon /> Ready
    </Chip>
  );
}

function IssueList({ issues }: { issues: FieldIssue[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {issues.map(issue => (
        <li key={issue.field} className="flex gap-3">
          {issue.severity === "hard" ? (
            <AlertCircleIcon className="text-danger-foreground mt-0.5 size-5 shrink-0" />
          ) : (
            <TriangleAlertIcon className="text-warning mt-0.5 size-5 shrink-0" />
          )}
          <div>
            <div className="font-medium">{issue.label}</div>
            <div className="text-muted-foreground text-sm">{issue.message}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FixDrawerRow({ connection }: { connection: PrototypeConnection }) {
  const { config, issues } = connection;
  const conn = config.connection!;
  const hard = isHardInvalid(issues);
  const clickable = issues.length > 0;

  const row = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 ring-1",
        clickable && "cursor-pointer",
        hard
          ? "ring-danger-foreground/40 hover:ring-danger-foreground/70"
          : isSoftInvalid(issues)
            ? "ring-warning/50 hover:ring-warning"
            : "ring-border",
      )}
    >
      <DatabaseIcon className="text-primary size-7 shrink-0" />
      <ListRowContent>
        <ListRowTitle className="text-foreground">
          {config.displayLabel || config.id}
        </ListRowTitle>
        <ListRowSubtitle className="text-muted-foreground">
          {conn.queryEngine ?? "no query language"} · {conn.url || "no URL"}
        </ListRowSubtitle>
      </ListRowContent>
      <StatusBadge issues={issues} />
      {clickable ? (
        <ChevronRightIcon className="text-muted-foreground size-5" />
      ) : null}
    </div>
  );

  if (!clickable) {
    return row;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{row}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.displayLabel || config.id}
            <StatusBadge issues={issues} />
          </DialogTitle>
          <DialogDescription>
            {hard
              ? "This connection can't be used until these are fixed."
              : "This connection works, but these settings need a look."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <IssueList issues={issues} />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline">Dismiss</Button>
          <Button variant={hard ? "primary-danger" : "primary"}>
            Edit connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusRail({ issues }: { issues: FieldIssue[] }) {
  const hard = hardIssues(issues);
  const soft = issues.filter(i => i.severity === "soft");
  return (
    <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm">
      <span className="text-muted-foreground">Status</span>
      <span className="flex items-center gap-2">
        {hard.length > 0 ? (
          <span className="text-danger-foreground flex items-center gap-1">
            <AlertCircleIcon className="size-4" /> {hard.length} blocking
          </span>
        ) : null}
        {soft.length > 0 ? (
          <span className="text-warning flex items-center gap-1">
            <TriangleAlertIcon className="size-4" /> {soft.length} warning
          </span>
        ) : null}
        {issues.length === 0 ? (
          <span className="text-success flex items-center gap-1">
            <CheckCircle2Icon className="size-4" /> All good
          </span>
        ) : null}
      </span>
    </div>
  );
}

function RailForm({
  title,
  connection,
}: {
  title: string;
  connection: PrototypeConnection;
}) {
  const { config, issues } = connection;
  const conn = config.connection!;
  const fieldHasIssue = (field: string) => issues.find(i => i.field === field);
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex flex-col gap-4">
        <StatusRail issues={issues} />
        {(
          [
            ["name", "Name", config.displayLabel || ""],
            ["queryEngine", "Query Language", conn.queryEngine ?? ""],
            ["url", "Public or Proxy Endpoint", conn.url],
          ] as const
        ).map(([field, label, value]) => {
          const issue = fieldHasIssue(field);
          return (
            <div key={field} className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-2">
                {label}
                {issue ? (
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      issue.severity === "hard" ? "bg-danger" : "bg-warning",
                    )}
                    aria-label={`${issue.severity} issue`}
                  />
                ) : null}
              </Label>
              <Input readOnly value={value || "(empty)"} />
            </div>
          );
        })}
        <div className="flex justify-end">
          <Button variant="primary" disabled={isHardInvalid(issues)}>
            {isHardInvalid(issues) ? "Fix errors to save" : "Update Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ImportFixDrawer() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="border-danger-foreground/40 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 hover:ring-1">
          <AlertCircleIcon className="text-danger-foreground size-6 shrink-0" />
          <div className="grow">
            <div className="text-danger-foreground font-medium">
              Import failed — {importErrorFileName}
            </div>
            <div className="text-muted-foreground text-sm">
              {importErrorIssues.length} fields invalid. Click to see details.
            </div>
          </div>
          <ChevronRightIcon className="text-muted-foreground size-5" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import failed</DialogTitle>
          <DialogDescription>
            Nothing was imported from {importErrorFileName}. Fix these fields
            and try again.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ul className="flex flex-col gap-3">
            {importErrorIssues.map(issue => (
              <li key={issue.path}>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {issue.path}
                </code>
                <div className="text-danger-foreground mt-0.5 text-sm">
                  {issue.message}
                </div>
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VariantC() {
  return (
    <PrototypeFrame
      listPanel={
        <PrototypePanel title="Available connections">
          <div className="flex flex-col gap-3">
            <StateLabel>Import failure (opens fix drawer)</StateLabel>
            <ImportFixDrawer />
            <StateLabel>Stored connections (click a flagged row)</StateLabel>
            {prototypeConnections.map(connection => (
              <FixDrawerRow
                key={connection.config.id}
                connection={connection}
              />
            ))}
          </div>
        </PrototypePanel>
      }
      formPanel={
        <PrototypePanel title="Connection form">
          <div className="flex flex-col gap-4">
            <StateLabel>Valid (happy path)</StateLabel>
            <RailForm title="A valid connection" connection={validConnection} />
            <StateLabel>Hard-invalid (blocks save)</StateLabel>
            <RailForm
              title="Editing a hard-invalid connection"
              connection={hardInvalidConnection}
            />
            <StateLabel>Soft-invalid (saves with warnings)</StateLabel>
            <RailForm
              title="Editing a soft-invalid connection"
              connection={softInvalidConnection}
            />
          </div>
        </PrototypePanel>
      }
    />
  );
}
