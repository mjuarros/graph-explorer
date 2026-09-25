// PROTOTYPE — throwaway. Answers "what should the good/bad-data connection UX
// look like?" for issue #1327. Not production. In-memory only, no schema wiring,
// no IndexedDB. Do not promote. See PROTOTYPE.md in this directory.

import type { ConnectionConfig } from "@shared/types";

import { createNewConfigurationId, type RawConfiguration } from "@/core";

/**
 * Severity of a validation issue, mirroring the locked design decision:
 * hard = request-impossible (blocks use), soft = refinable (usable with warning).
 */
export type IssueSeverity = "hard" | "soft";

export type FieldIssue = {
  field: string;
  label: string;
  message: string;
  severity: IssueSeverity;
};

/**
 * A prototype connection: the persisted raw config plus the pre-computed issues
 * a real derived selector (`connectionSchema.safeParse`) would produce. Hand-built
 * so the prototype shows states without any real validation logic.
 */
export type PrototypeConnection = {
  config: RawConfiguration;
  issues: FieldIssue[];
};

function connection(
  displayLabel: string,
  connectionConfig: ConnectionConfig,
  issues: FieldIssue[],
): PrototypeConnection {
  return {
    config: {
      id: createNewConfigurationId(),
      displayLabel,
      connection: connectionConfig,
    },
    issues,
  };
}

/** A fully valid connection — the happy path. No issues. */
export const validConnection = connection(
  "Air Routes (Neptune)",
  {
    url: "https://air-routes.cluster-abc123.us-east-1.neptune.amazonaws.com:8182",
    queryEngine: "gremlin",
    proxyConnection: false,
    awsAuthEnabled: true,
    serviceType: "neptune-db",
    awsRegion: "us-east-1",
    fetchTimeoutMs: 240000,
  },
  [],
);

/**
 * Hard-invalid — request-impossible. Malformed URL (passes today's truthiness
 * gate) and a missing query engine. Both are the required core of the schema, so
 * a base parse failure. Blocks use.
 */
export const hardInvalidConnection = connection(
  "Legacy import (bad URL)",
  {
    url: "not a url",
    // queryEngine intentionally omitted — optional in today's type, required by the new schema
    proxyConnection: false,
  },
  [
    {
      field: "url",
      label: "Public or Proxy Endpoint",
      message: "Must be a valid http(s) URL. Got “not a url”.",
      severity: "hard",
    },
    {
      field: "queryEngine",
      label: "Query Language",
      message:
        "Choose a query language — the connection can't run queries without one.",
      severity: "hard",
    },
  ],
);

/**
 * Soft-invalid — refinable. Blank name, IAM enabled but region missing, and a
 * fetch timeout out of range. Usable, but flagged with a warning.
 */
export const softInvalidConnection = connection(
  "",
  {
    url: "https://gremlin.example.com:8182",
    queryEngine: "openCypher",
    proxyConnection: true,
    graphDbUrl: "https://neptune-cluster.us-west-2.neptune.amazonaws.com:8182",
    awsAuthEnabled: true,
    serviceType: "neptune-db",
    awsRegion: "",
    fetchTimeoutMs: 5,
  },
  [
    {
      field: "name",
      label: "Name",
      message:
        "This connection has no name. It'll show as its ID until you add one.",
      severity: "soft",
    },
    {
      field: "awsRegion",
      label: "AWS Region",
      message:
        "IAM auth is on but no region is set — requests may fail to sign.",
      severity: "soft",
    },
    {
      field: "fetchTimeoutMs",
      label: "Fetch Timeout (ms)",
      message:
        "5 ms is below the supported range; expect requests to time out immediately.",
      severity: "soft",
    },
  ],
);

/** The list every variant renders: one of each state. */
export const prototypeConnections: PrototypeConnection[] = [
  validConnection,
  hardInvalidConnection,
  softInvalidConnection,
];

/**
 * An import-error payload: the per-field issues the improved atomic importer
 * would report instead of one generic "not valid" toast. Modeled on the Zod
 * schema's issue paths.
 */
export type ImportIssue = {
  path: string;
  message: string;
};

export const importErrorFileName = "my-neptune-connections.json";

export const importErrorIssues: ImportIssue[] = [
  {
    path: "connections[0].connection.url",
    message:
      'Invalid URL — expected an http(s) address, received "neptune://cluster".',
  },
  {
    path: "connections[0].connection.queryEngine",
    message:
      'Invalid query engine — expected gremlin, openCypher, or sparql; received "cypher".',
  },
  {
    path: "connections[2].connection.graphDbUrl",
    message: "Required when proxyConnection is true, but it was missing.",
  },
];

export function hardIssues(issues: FieldIssue[]) {
  return issues.filter(issue => issue.severity === "hard");
}

export function softIssues(issues: FieldIssue[]) {
  return issues.filter(issue => issue.severity === "soft");
}

/** True when the connection can't be used at all (any hard issue). */
export function isHardInvalid(issues: FieldIssue[]) {
  return issues.some(issue => issue.severity === "hard");
}

/** True when the connection is usable but imperfect (only soft issues). */
export function isSoftInvalid(issues: FieldIssue[]) {
  return issues.length > 0 && !isHardInvalid(issues);
}
