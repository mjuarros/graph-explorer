// PROTOTYPE — throwaway. Variant A: inline per-field validation. Errors live
// directly beneath each field; the list surfaces attention inline in the row;
// import reports each issue as an inline line item. See PROTOTYPE.md.

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  TriangleAlertIcon,
} from "lucide-react";

import {
  Button,
  Chip,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Label,
  ListRowContent,
  ListRowSubtitle,
  ListRowTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { cn } from "@/utils";

import {
  hardInvalidConnection,
  importErrorFileName,
  importErrorIssues,
  isHardInvalid,
  isSoftInvalid,
  prototypeConnections,
  softInvalidConnection,
  type FieldIssue,
  type PrototypeConnection,
} from "./fixtures";
import { PrototypeFrame, PrototypePanel, StateLabel } from "./scaffold";

const queryOptions = [
  { label: "Gremlin - PG (Property Graph)", value: "gremlin" },
  { label: "OpenCypher - PG (Property Graph)", value: "openCypher" },
  { label: "SPARQL - RDF", value: "sparql" },
];

function issueFor(issues: FieldIssue[], field: string) {
  return issues.find(issue => issue.field === field);
}

function InlineField({
  label,
  value,
  issue,
}: {
  label: string;
  value: string;
  issue?: FieldIssue;
}) {
  const invalid = Boolean(issue);
  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        readOnly
        value={value}
        aria-invalid={invalid}
        className={cn(invalid && "border-danger-foreground")}
      />
      {issue ? <FieldError>{issue.message}</FieldError> : null}
    </Field>
  );
}

function InlineForm({
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
      <div className="flex flex-col gap-5">
        <InlineField
          label="Name"
          value={config.displayLabel || "(none)"}
          issue={issueFor(issues, "name")}
        />
        <div className="flex flex-col gap-1.5">
          <Label>Query Language</Label>
          <Select value={conn.queryEngine}>
            <SelectTrigger
              aria-invalid={Boolean(issueFor(issues, "queryEngine"))}
              className={cn(
                issueFor(issues, "queryEngine") && "border-danger-foreground",
              )}
            >
              <SelectValue>
                {queryOptions.find(o => o.value === conn.queryEngine)?.label ??
                  "Select a query language"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {queryOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {issueFor(issues, "queryEngine") ? (
            <FieldError>{issueFor(issues, "queryEngine")!.message}</FieldError>
          ) : null}
        </div>
        <InlineField
          label="Public or Proxy Endpoint"
          value={conn.url}
          issue={issueFor(issues, "url")}
        />
        {conn.proxyConnection ? (
          <InlineField
            label="Graph Connection URL"
            value={conn.graphDbUrl ?? ""}
            issue={issueFor(issues, "graphDbUrl")}
          />
        ) : null}
        {conn.awsAuthEnabled ? (
          <InlineField
            label="AWS Region"
            value={conn.awsRegion ?? ""}
            issue={issueFor(issues, "awsRegion")}
          />
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

function InlineRow({ connection }: { connection: PrototypeConnection }) {
  const { config, issues } = connection;
  const conn = config.connection!;
  const hard = isHardInvalid(issues);
  const soft = isSoftInvalid(issues);
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg px-4 py-3 ring-1",
        hard && "ring-danger-foreground/40 bg-danger-subtle/30",
        soft && "ring-warning/50 bg-warning/5",
        !hard && !soft && "ring-border",
      )}
    >
      <div className="flex items-center gap-3">
        <DatabaseIcon className="text-primary size-7 shrink-0" />
        <ListRowContent>
          <ListRowTitle className="text-foreground flex items-center gap-2">
            {config.displayLabel || config.id}
            {hard ? (
              <Chip variant="error">
                <AlertCircleIcon /> Needs attention
              </Chip>
            ) : null}
            {soft ? (
              <Chip variant="warning">
                <TriangleAlertIcon /> Check settings
              </Chip>
            ) : null}
            {!hard && !soft ? (
              <Chip variant="success">
                <CheckCircle2Icon /> Ready
              </Chip>
            ) : null}
          </ListRowTitle>
          <ListRowSubtitle className="text-muted-foreground">
            {conn.queryEngine ?? "no query language"} · {conn.url || "no URL"}
          </ListRowSubtitle>
        </ListRowContent>
      </div>
      {issues.length > 0 ? (
        <ul className="border-t pt-2 pl-1 text-sm">
          {issues.map(issue => (
            <li
              key={issue.field}
              className={cn(
                "flex gap-2 py-0.5",
                issue.severity === "hard"
                  ? "text-danger-foreground"
                  : "text-muted-foreground",
              )}
            >
              {issue.severity === "hard" ? (
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
              ) : (
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              )}
              <span>
                <span className="font-medium">{issue.label}:</span>{" "}
                {issue.message}
              </span>
            </li>
          ))}
          <li className="pt-2">
            <Button size="small" variant={hard ? "danger" : "outline"}>
              Edit to fix
            </Button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function InlineImportErrors() {
  return (
    <div className="border-danger-foreground/40 bg-danger-subtle/30 rounded-lg border p-4">
      <div className="text-danger-foreground flex items-center gap-2 font-medium">
        <AlertCircleIcon className="size-4" />
        Couldn&apos;t import {importErrorFileName}
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Nothing was imported. Fix these fields in the file and try again.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {importErrorIssues.map(issue => (
          <li key={issue.path} className="text-sm">
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              {issue.path}
            </code>
            <div className="text-danger-foreground mt-0.5">{issue.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VariantA() {
  return (
    <PrototypeFrame
      listPanel={
        <PrototypePanel title="Available connections">
          <div className="flex flex-col gap-3">
            <StateLabel>Import failure (inline per-field)</StateLabel>
            <InlineImportErrors />
            <StateLabel>Stored connections</StateLabel>
            {prototypeConnections.map(connection => (
              <InlineRow key={connection.config.id} connection={connection} />
            ))}
          </div>
        </PrototypePanel>
      }
      formPanel={
        <PrototypePanel title="Connection form">
          <div className="flex flex-col gap-4">
            <StateLabel>Hard-invalid (blocks save)</StateLabel>
            <InlineForm
              title="Editing a hard-invalid connection"
              connection={hardInvalidConnection}
            />
            <StateLabel>Soft-invalid (saves with warnings)</StateLabel>
            <InlineForm
              title="Editing a soft-invalid connection"
              connection={softInvalidConnection}
            />
          </div>
        </PrototypePanel>
      }
    />
  );
}
