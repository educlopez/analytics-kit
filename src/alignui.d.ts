// AlignUI components pass CSS custom properties through `style`, which React's
// CSSProperties does not model. Declaring it here keeps the copied components
// verbatim instead of scattering casts through them.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
