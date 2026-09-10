import { PluginOption } from 'vite';

interface EstreeNode {
  type: string;
  start: number;
  end: number;
  parent?: unknown;
  [key: string]: unknown;
}

interface ImportSite {
  start: number;
  end: number;
  sourceStart: number;
  sourceEnd: number;
}

interface OutputChunkLike {
  type: string;
  fileName: string;
  code: string;
}

export default function customDynamicImport(): PluginOption {
  return {
    name: 'custom-dynamic-import',
    // Rollup removed renderDynamicImport in the Vite 8 / Rolldown line, so
    // wrap the emitted dynamic imports in generateBundle instead, after
    // vite:build-import-analysis has substituted its preload helpers. The
    // chunk is parsed so only real import() expressions are wrapped (never
    // string or comment contents). Each import(source) becomes a call
    // through a local alias with the same source, matching the previous
    // renderDynamicImport output shape. The wrapper stays on one line so
    // production output without sourcemaps is unaffected.
    enforce: 'post',
    generateBundle(_options, bundle) {
      const context = this as unknown as {
        parse: (code: string) => EstreeNode;
      };
      for (const file of Object.keys(bundle)) {
        const chunk = bundle[file] as unknown as OutputChunkLike;
        if (chunk.type !== 'chunk' || !chunk.code.includes('import(')) {
          continue;
        }
        const ast = context.parse.call(this, chunk.code);
        const sites: ImportSite[] = [];
        collectImportSites(ast, sites);
        if (sites.length === 0) {
          continue;
        }
        const left = `{ const dynamicImport = (path) => import(path); dynamicImport(`;
        const right = `) }`;
        let code = chunk.code;
        for (const site of sites.sort((a, b) => b.start - a.start)) {
          code =
            `${code.slice(0, site.start)}${left}` +
            `${code.slice(site.sourceStart, site.sourceEnd)}${right}` +
            `${code.slice(site.end)}`;
        }
        chunk.code = code;
      }
    },
  };
}

function collectImportSites(node: unknown, out: ImportSite[]): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectImportSites(item, out);
    }
    return;
  }
  if (typeof node !== 'object' || node === null) {
    return;
  }
  const estreeNode = node as EstreeNode;
  if (estreeNode.type === 'ImportExpression') {
    const source = estreeNode['source'] as EstreeNode | undefined;
    if (source && typeof source.start === 'number' && typeof source.end === 'number') {
      out.push({
        start: estreeNode.start,
        end: estreeNode.end,
        sourceStart: source.start,
        sourceEnd: source.end,
      });
    }
  }
  for (const key of Object.keys(estreeNode)) {
    if (key === 'parent') {
      continue;
    }
    collectImportSites(estreeNode[key], out);
  }
}
