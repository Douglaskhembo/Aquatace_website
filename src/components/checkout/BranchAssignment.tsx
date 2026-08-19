import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPinned, Building2, Truck, WifiOff } from "lucide-react";
import { assignNearestBranch } from "@/lib/orders.functions";
import { useOnline } from "@/hooks/use-online";

export interface AssignedBranch {
  id: string;
  name: string;
  area: string | null;
  phone: string | null;
  whatsapp: string | null;
  distance_km: number;
  duration_min: number;
}

interface Props {
  lat: number | null;
  lng: number | null;
  onAssign: (branch: AssignedBranch | null) => void;
  branchOverrideId: string | null;
  onOverride: (id: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BranchLite = any;

export function BranchAssignment({ lat, lng, onAssign, branchOverrideId, onOverride }: Props) {
  const assign = useServerFn(assignNearestBranch);
  const [loading, setLoading] = useState(false);
  const [nearest, setNearest] = useState<AssignedBranch | null>(null);
  const [all, setAll] = useState<BranchLite[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) { setNearest(null); onAssign(null); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    assign({ data: { lat, lng } })
      .then((res) => {
        if (cancelled) return;
        const info: AssignedBranch = {
          id: res.branch.id, name: res.branch.name, area: res.branch.area,
          phone: res.branch.phone, whatsapp: res.branch.whatsapp,
          distance_km: res.distance_km, duration_min: res.duration_min,
        };
        setNearest(info);
        setAll(res.all_branches);
        if (!branchOverrideId) onAssign(info);
      })
      .catch((e) => setError(e?.message ?? "Could not calculate nearest branch."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const active = branchOverrideId
    ? (all.find((b) => b.id === branchOverrideId) ?? null)
    : nearest;

  const online = useOnline();
  const OUT_OF_COVERAGE_KM = 15;
  const isNationwide =
    !branchOverrideId &&
    nearest != null &&
    nearest.distance_km > OUT_OF_COVERAGE_KM &&
    /membley/i.test(nearest.name);

  if (lat == null || lng == null) {
    return <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">Pin your delivery location above to see the assigned pickup point.</div>;
  }
  if (loading && !nearest) {
    return <div className="flex items-center gap-2 rounded-2xl border border-border p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Finding nearest pickup point…</div>;
  }
  if (error) return <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>;
  if (!nearest) return null;

  return (
    <div className="space-y-3">
      {!online && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <WifiOff className="h-3.5 w-3.5" /> You appear to be offline — your order will submit once you reconnect.
        </div>
      )}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
            {isNationwide ? <Truck className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">
              {isNationwide
                ? "Nationwide delivery — fulfilled by our Membley hub"
                : `Assigned to ${active?.name ?? nearest.name} pickup point`}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {branchOverrideId ? "Manually selected." : isNationwide ? (
                <>You're outside our local pickup radius (~{nearest.distance_km} km). Our Membley hub coordinates countrywide dispatch — a team member will confirm delivery ETA and any courier fee before dispatch.</>
              ) : (
                <>Nearest pickup point — approximately <span className="font-medium text-foreground">{nearest.distance_km} km</span> away, ETA <span className="font-medium text-foreground">~{nearest.duration_min} min</span>.</>
              )}
            </p>
          </div>
        </div>
      </div>


      {all.length > 1 && (
        <details className="rounded-2xl border border-border p-3 text-sm">
          <summary className="cursor-pointer select-none text-muted-foreground hover:text-foreground">
            <MapPinned className="mr-1.5 inline h-3.5 w-3.5" /> Choose a different pickup point
          </summary>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 rounded-xl border border-border p-2.5 hover:bg-muted/50">
              <input type="radio" name="branch" checked={!branchOverrideId} onChange={() => onOverride(null)} />
              <span className="text-sm"><span className="font-medium">Auto (nearest)</span> — {nearest.name}</span>
            </label>
            {all.map((b) => (
              <label key={b.id} className="flex items-center gap-2 rounded-xl border border-border p-2.5 hover:bg-muted/50">
                <input type="radio" name="branch" checked={branchOverrideId === b.id} onChange={() => onOverride(b.id)} />
                <span className="text-sm"><span className="font-medium">{b.name}</span> {b.area ? `· ${b.area}` : ""}</span>
              </label>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
