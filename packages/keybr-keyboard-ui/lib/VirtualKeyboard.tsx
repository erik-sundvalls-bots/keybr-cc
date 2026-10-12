import { Geometry, type Keyboard, KeyboardContext } from "@keybr/keyboard";
import { type ZoomableProps } from "@keybr/widget";
import { memo, type ReactNode } from "react";
import { getFrameSize } from "./shapes.tsx";
import * as styles from "./VirtualKeyboard.module.less";

export const VirtualKeyboard = memo(function VirtualKeyboard({
  children,
  keyboard,
  width,
  height,
  moving,
  ...props
}: {
  readonly children?: ReactNode;
  readonly keyboard: Keyboard;
  readonly width?: string;
  readonly height?: string;
  readonly moving?: boolean;
} & ZoomableProps): ReactNode {
  const size = getFrameSize(keyboard);
  // The CC1 picture is a pair of switch clusters, so a fixed 16rem height
  // would shrink every key. Width stays 100% and the aspect ratio sets the
  // height. Other geometries keep the height the caller asked for.
  const frameHeight = keyboard.geometry === Geometry.CC1 ? undefined : height;
  return (
    <svg
      {...props}
      className={styles.keyboard}
      viewBox={`0 0 ${size.width} ${size.height}`}
      style={{ aspectRatio: `${size.width}/${size.height}` }}
      width={width}
      height={frameHeight}
    >
      <rect
        className={styles.frame}
        x={0}
        y={0}
        width={size.width}
        height={size.height}
        rx={10}
        ry={10}
      />
      <KeyboardContext.Provider value={keyboard}>
        {children}
      </KeyboardContext.Provider>
    </svg>
  );
});
