// PROTOTYPE — throwaway. Floating variant switcher for the connection-validation
// UX prototype (#1327). Dev-only, not production. See PROTOTYPE.md.

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

import { NotInProduction } from "@/components";
import { cn } from "@/utils";

export type VariantKey = "A" | "B" | "C";

export const variantLabels: Record<VariantKey, string> = {
  A: "Inline per-field",
  B: "Summary banner",
  C: "Row badge + fix drawer",
};

const variantOrder: VariantKey[] = ["A", "B", "C"];

export function useVariant(): VariantKey {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("variant");
  return isVariantKey(raw) ? raw : "A";
}

function isVariantKey(value: string | null): value is VariantKey {
  return value === "A" || value === "B" || value === "C";
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function PrototypeSwitcher() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = useVariant();

  const go = useCallback(
    (direction: 1 | -1) => {
      const index = variantOrder.indexOf(current);
      const next =
        variantOrder[
          (index + direction + variantOrder.length) % variantOrder.length
        ];
      const params = new URLSearchParams(searchParams);
      params.set("variant", next);
      setSearchParams(params, { replace: true });
    },
    [current, searchParams, setSearchParams],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }
      if (event.key === "ArrowLeft") {
        go(-1);
      } else if (event.key === "ArrowRight") {
        go(1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  return (
    <NotInProduction>
      <div className="z-tooltip fixed bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-gray-700 bg-gray-900 px-2 py-1.5 text-white shadow-2xl">
          <SwitcherButton label="Previous variant" onClick={() => go(-1)}>
            <ChevronLeftIcon className="size-5" />
          </SwitcherButton>
          <div className="flex min-w-[15rem] flex-col items-center px-3 leading-tight">
            <span className="text-xs text-gray-400">
              PROTOTYPE · connection validation · ← →
            </span>
            <span className="text-sm font-semibold">
              {current} — {variantLabels[current]}
            </span>
          </div>
          <SwitcherButton label="Next variant" onClick={() => go(1)}>
            <ChevronRightIcon className="size-5" />
          </SwitcherButton>
        </div>
      </div>
    </NotInProduction>
  );
}

function SwitcherButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full",
        "hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
      )}
    >
      {children}
    </button>
  );
}
