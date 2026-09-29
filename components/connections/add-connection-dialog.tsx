"use client";

import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { connectorCatalog, type ConnectorOption } from "@/lib/mock/connections";
import { useOperator } from "@/lib/store";
import { sleep } from "@/lib/utils";

const defaults: Partial<Record<ConnectorOption["kind"], string>> = {
  rest: "https://api.example.com/v1",
  openapi: "https://api.example.com/openapi.json",
  postgres: "postgres://readonly@db.internal:5432/app",
  mysql: "mysql://readonly@db.internal:3306/app",
  salesforce: "acme-industrial.my.salesforce.com",
  shopify: "acme-industrial.myshopify.com",
  custom: "operator-sdk://acme/connector",
};

const discovered: Partial<Record<ConnectorOption["kind"], number>> = { rest: 6, openapi: 12, postgres: 8, mysql: 8, salesforce: 10, shopify: 9, custom: 4, hubspot: 8, gmail: 6, drive: 5 };

export function AddConnectionDialog() {
  const addConnection = useOperator((s) => s.addConnection);
  const updateConnection = useOperator((s) => s.updateConnection);
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<ConnectorOption | null>(null);
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [readOnly, setReadOnly] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const choose = (o: ConnectorOption) => {
    setOption(o);
    setName(o.name);
    setEndpoint(defaults[o.kind] ?? "");
    setReadOnly(o.group === "Databases");
  };

  const reset = () => {
    setOption(null);
    setConnecting(false);
  };

  const connect = async () => {
    if (!option) return;
    setConnecting(true);
    await sleep(900);
    const id = `${option.kind}-${Date.now().toString(36)}`;
    const tools = discovered[option.kind] ?? 5;
    addConnection({
      id,
      name,
      shortName: name,
      kind: option.kind,
      category: option.group === "Databases" ? "Database" : option.group === "Protocols" ? "API" : "Application",
      description: `${option.description}. Added by Pawan.`,
      status: "syncing",
      auth: option.auth,
      access: readOnly ? "Read-only" : "Read & write",
      toolCount: 0,
      lastSynced: "syncing",
      lastActivity: "just now",
      syncSchedule: "Every 15 minutes",
      owner: "Pawan",
      endpoint,
      objects: [],
      scopes: [readOnly ? "read" : "read, write"],
    });
    setOpen(false);
    reset();
    toast(`Connecting ${name}`, { description: "Verifying credentials and discovering available operations…" });
    await sleep(2400);
    updateConnection(id, { status: "connected", toolCount: tools, lastSynced: "just now" });
    toast.success(`${name} connected`, { description: `${tools} operations discovered. They stay disabled until assigned to an agent.` });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="size-3.5" /> Add connection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        {!option ? (
          <>
            <DialogHeader>
              <DialogTitle>Add connection</DialogTitle>
              <DialogDescription>Choose a system. Operator generates tools from it and applies your permission policies.</DialogDescription>
            </DialogHeader>
            <div className="scrollbar-thin max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4">
              {(["Applications", "Databases", "Protocols"] as const).map((group) => (
                <div key={group}>
                  <div className="mb-2 text-xs font-medium text-muted">{group}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {connectorCatalog
                      .filter((o) => o.group === group)
                      .map((o) => (
                        <button
                          key={o.kind}
                          onClick={() => choose(o)}
                          className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface-muted focus-visible:border-ink/40"
                        >
                          <ConnectionIcon kind={o.kind} />
                          <span className="min-w-0">
                            <span className="block text-sm text-ink">{o.name}</span>
                            <span className="block truncate text-xs text-muted">{o.description}</span>
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void connect();
            }}
          >
            <DialogHeader>
              <button type="button" onClick={() => setOption(null)} className="mb-1 flex items-center gap-1 text-xs text-muted hover:text-ink">
                <ArrowLeft className="size-3" /> All connectors
              </button>
              <DialogTitle className="flex items-center gap-2.5">
                <ConnectionIcon kind={option.kind} /> Connect {option.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-5 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="conn-name">Display name</Label>
                <Input id="conn-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="conn-endpoint">{option.group === "Databases" ? "Connection string" : "Endpoint"}</Label>
                <Input id="conn-endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="font-mono text-xs" required />
              </div>
              <div className="space-y-1.5">
                <Label>Authentication</Label>
                <div className="flex h-8 items-center rounded-md border border-line bg-surface-muted px-2.5 text-sm text-ink-2">
                  {option.auth === "OAuth 2.0" ? "OAuth 2.0 — you'll be asked to authorise in a new window" : option.auth === "Database role" ? "Password stored in vault" : `${option.auth} · stored in vault`}
                </div>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-line px-3.5 py-3">
                <span>
                  <span className="block text-sm text-ink">Read-only</span>
                  <span className="block text-xs text-muted">Generate read tools only. Write tools can be enabled later.</span>
                </span>
                <Switch checked={readOnly} onCheckedChange={setReadOnly} />
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOption(null)}>
                Back
              </Button>
              <Button type="submit" variant="primary" disabled={connecting || !name.trim() || !endpoint.trim()}>
                {connecting && <Loader2 className="size-3.5 animate-spin" />}
                {connecting ? "Verifying…" : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
