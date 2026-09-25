// PROTOTYPE — throwaway. Variant B: summary banner. All issues are hoisted into
// a single Alert at the top of the form and the top of the list; fields
// themselves stay quiet. Import failure is one banner with a per-field list.
// See PROTOTYPE.md.

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  TriangleAlertIcon,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Chip,
  Input,
  Label,
  ListRowContent,
  ListRowSubtitle,
  ListRowTitle,
} from "@/components";
import { cn } from "@/utils";

import {
  hardInvalidConnection,
  hardIssues,
  importErrorFileName,
  importErrorIssues,
  isHardInvalid,
  isSoftInvalid,
  prototypeConnections,
  softIssues,
  softInvalidConnection,
  validConnection,
  type FieldIssue,
  type PrototypeConnection,
} from "./fixtures";
import { PrototypeFrame, PrototypePanel, StateLabel } from "./scaffold";

function QuietField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input readOnly value={value || "(empty)"} />
    </div>
  );
}

function SummaryBanner({ issues }: { issues: FieldIssue[] }) {
  if (issues.length === 0) {
    return (
      <Alert variant="primary">
        <CheckCircle2Icon />
        <AlertTitle>Ready to save</AlertTitle>
        <AlertDescription>Everything checks out.</AlertDescription>
      </Alert>
    );
  }

  const hard = hardIssues(issues);
  const soft = softIssues(issues);
  return (
    <Alert variant={hard.length ? "danger" : "default"}>
      {hard.length ? <AlertCircleIcon /> : <TriangleAlertIcon />}
      <AlertTitle>
        {hard.length
          ? `${hard.length} error${hard.length > 1 ? "s" : ""} to fix before saving`
          : `${soft.length} warning${soft.length > 1 ? "s" : ""} — you can still save`}
      </AlertTitle>
      <AlertDescription>
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {[...hard, ...soft].map(issue => (
            <li key={issue.field}>
              <span className="font-medium">{issue.label}:</span>{" "}
              {issue.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function BannerForm({
  title,
  connection,
}: {
  title: string;
  connection: PrototypeConnection;
}) {
  const { config, issues } = connection;
  const conn = config.connection!;
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 font-medium">{title}</div>
      <div className="flex flex-col gap-4">
        <SummaryBanner issues={issues} />
        <QuietField label="Name" value={config.displayLabel || ""} />
        <QuietField label="Query Language" value={conn.queryEngine ?? ""} />
        <QuietField label="Public or Proxy Endpoint" value={conn.url} />
        {conn.awsAuthEnabled ? (
          <QuietField label="AWS Region" value={conn.awsRegion ?? ""} />
        ) : null}
        <div className="flex justify-end">
          <Button variant="primary" disabled={isHardInvalid(issues)}>
            {isHardInvalid(issues) ? "Fix errors to save" : "Update Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ListSummaryBanner() {
  const flagged = prototypeConnections.filter(c => c.issues.length > 0);
  const hardCount = flagged.filter(c => isHardInvalid(c.issues)).length;
  const softCount = flagged.filter(c => isSoftInvalid(c.issues)).length;
  if (flagged.length === 0) {
    return null;
  }
  return (
    <Alert variant="danger">
      <AlertCircleIcon />
      <AlertTitle>Some connections need attention</AlertTitle>
      <AlertDescription>
        {hardCount > 0 ? `${hardCount} can't be used until fixed` : null}
        {hardCount > 0 && softCount > 0 ? " · " : null}
        {softCount > 0 ? `${softCount} usable with warnings` : null}. Open a
        flagged connection to fix it.
      </AlertDescription>
    </Alert>
  );
}

function QuietRow({ connection }: { connection: PrototypeConnection }) {
  const { config, issues } = connection;
  const conn = config.connection!;
  const hard = isHardInvalid(issues);
  const soft = isSoftInvalid(issues);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 ring-1",
        hard
          ? "ring-danger-foreground/40"
          : soft
            ? "ring-warning/50"
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
      {hard ? (
        <Chip variant="error">
          <AlertCircleIcon /> Needs attention
        </Chip>
      ) : soft ? (
        <Chip variant="warning">
          <TriangleAlertIcon /> Warning
        </Chip>
      ) : (
        <Chip variant="success">
          <CheckCircle2Icon /> Ready
        </Chip>
      )}
    </div>
  );
}

function ImportBanner() {
  return (
    <Alert variant="danger">
      <AlertCircleIcon />
      <AlertTitle>Import failed — {importErrorFileName}</AlertTitle>
      <AlertDescription>
        Nothing was imported. {importErrorIssues.length} fields are invalid:
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
          {importErrorIssues.map(issue => (
            <li key={issue.path}>
              <code className="text-xs">{issue.path}</code> — {issue.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export function VariantB() {
  return (
    <PrototypeFrame
      listPanel={
        <PrototypePanel title="Available connections">
          <div className="flex flex-col gap-3">
            <StateLabel>Import failure (summary banner)</StateLabel>
            <ImportBanner />
            <StateLabel>List-level summary</StateLabel>
            <ListSummaryBanner />
            <StateLabel>Stored connections</StateLabel>
            {prototypeConnections.map(connection => (
              <QuietRow key={connection.config.id} connection={connection} />
            ))}
          </div>
        </PrototypePanel>
      }
      formPanel={
        <PrototypePanel title="Connection form">
          <div className="flex flex-col gap-4">
            <StateLabel>Valid (happy path)</StateLabel>
            <BannerForm
              title="A valid connection"
              connection={validConnection}
            />
            <StateLabel>Hard-invalid (blocks save)</StateLabel>
            <BannerForm
              title="Editing a hard-invalid connection"
              connection={hardInvalidConnection}
            />
            <StateLabel>Soft-invalid (saves with warnings)</StateLabel>
            <BannerForm
              title="Editing a soft-invalid connection"
              connection={softInvalidConnection}
            />
          </div>
        </PrototypePanel>
      }
    />
  );
}
