"use client";
import { Kbd } from "@lorenthi/ui";

export default function Demo() {
  return (
    <>
      <Kbd keys={["⌘", "K"]} />
      <Kbd keys={["Ctrl", "Shift", "P"]} />
      <Kbd>Esc</Kbd>
    </>
  );
}
