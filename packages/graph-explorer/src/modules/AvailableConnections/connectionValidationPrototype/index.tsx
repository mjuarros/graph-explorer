// PROTOTYPE — throwaway. Host for the connection-validation UX prototype (#1327).
// Renders one of three structurally different variants based on ?variant= and
// the floating PrototypeSwitcher. Mounted inside the /connections route behind
// NotInProduction + ?prototype=connection-validation. See PROTOTYPE.md.

import { PrototypeSwitcher, useVariant } from "./PrototypeSwitcher";
import { VariantA } from "./VariantA";
import { VariantB } from "./VariantB";
import { VariantC } from "./VariantC";

export function ConnectionValidationPrototype() {
  const variant = useVariant();
  return (
    <>
      {variant === "A" ? <VariantA /> : null}
      {variant === "B" ? <VariantB /> : null}
      {variant === "C" ? <VariantC /> : null}
      <PrototypeSwitcher />
    </>
  );
}
