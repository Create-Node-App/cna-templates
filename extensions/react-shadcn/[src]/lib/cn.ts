// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { clsx } from "clsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { twMerge } from "tailwind-merge";

export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs));
}
