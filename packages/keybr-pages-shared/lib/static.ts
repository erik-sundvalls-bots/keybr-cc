// GitHub Pages (static build) support for the erik-sundvalls-bots fork.
// Lives only on the gh-pages-cc1 branch, not in the upstream-bound PR.

export type StaticSite = {
  /** Router basename, e.g. "/keybr.com". */
  readonly basename: string;
  /** Link to the source code (AGPL-3.0). */
  readonly sourceUrl: string;
};

export function getStaticSite(): StaticSite | null {
  return (globalThis as any).__KEYBR_STATIC__ ?? null;
}
