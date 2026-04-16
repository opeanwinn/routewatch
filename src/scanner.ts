import * as fs from 'fs';
import * as path from 'path';

export interface RouteNode {
  segment: string;
  fullPath: string;
  isDynamic: boolean;
  isCatchAll: boolean;
  isGroup: boolean;
  children: RouteNode[];
  hasPage: boolean;
  hasLayout: boolean;
}

const PAGE_FILES = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];
const LAYOUT_FILES = ['layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js'];

function hasFile(dir: string, files: string[]): boolean {
  return files.some(f => fs.existsSync(path.join(dir, f)));
}

export function scanAppRouter(appDir: string): RouteNode {
  return scanDirectory(appDir, appDir, '');
}

function scanDirectory(rootDir: string, currentDir: string, segment: string): RouteNode {
  const relativePath = path.relative(rootDir, currentDir) || '/';
  const dirName = path.basename(currentDir);

  const node: RouteNode = {
    segment: segment || '/',
    fullPath: '/' + relativePath.replace(/\\/g, '/').replace(/^\/$/, ''),
    isDynamic: dirName.startsWith('[') && !dirName.startsWith('[...'),
    isCatchAll: dirName.startsWith('[...'),
    isGroup: dirName.startsWith('(') && dirName.endsWith(')'),
    children: [],
    hasPage: hasFile(currentDir, PAGE_FILES),
    hasLayout: hasFile(currentDir, LAYOUT_FILES),
  };

  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return node;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const childDir = path.join(currentDir, entry.name);
    const childNode = scanDirectory(rootDir, childDir, entry.name);
    node.children.push(childNode);
  }

  return node;
}
