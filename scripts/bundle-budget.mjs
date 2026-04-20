import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const assetsDir = path.join(projectRoot, 'dist', 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('Bundle budget check failed: dist/assets not found. Run npm run build first.');
  process.exit(1);
}

const parseKb = (bytes) => Number((bytes / 1024).toFixed(2));

const files = fs.readdirSync(assetsDir)
  .filter((fileName) => /\.(js|css)$/.test(fileName))
  .map((fileName) => {
    const fullPath = path.join(assetsDir, fileName);
    const stat = fs.statSync(fullPath);
    return {
      fileName,
      ext: path.extname(fileName),
      sizeBytes: stat.size,
      sizeKb: parseKb(stat.size),
    };
  });

const jsFiles = files.filter((file) => file.ext === '.js');

const budgets = [
  { label: 'entry-index', pattern: /^index-[\w-]+\.js$/, maxKb: 80 },
  { label: 'design-page', pattern: /^DesignPage-[\w-]+\.js$/, maxKb: 100 },
  { label: 'chat-widget', pattern: /^ChatWidget-[\w-]+\.js$/, maxKb: 18 },
  { label: 'chat-markdown', pattern: /^chat-markdown-[\w-]+\.js$/, maxKb: 40 },
  { label: 'map-page', pattern: /^MapPage-[\w-]+\.js$/, maxKb: 20 },
  { label: 'map-core', pattern: /^maplibre-core-[\w-]+\.js$/, maxKb: 1100 },
  { label: 'map-worker', pattern: /^maplibre-worker-[\w-]+\.js$/, maxKb: 650 },
  { label: 'antd-ui', pattern: /^antd-ui-[\w-]+\.js$/, maxKb: 650 },
  { label: 'vendor', pattern: /^vendor-[\w-]+\.js$/, maxKb: 600 },
  { label: 'three-core', pattern: /^three-core-[\w-]+\.js$/, maxKb: 800 },
];

const failures = [];

for (const budget of budgets) {
  const match = jsFiles.find((file) => budget.pattern.test(file.fileName));
  if (!match) {
    failures.push(`Missing chunk for budget "${budget.label}" (pattern ${budget.pattern})`);
    continue;
  }

  if (match.sizeKb > budget.maxKb) {
    failures.push(`${budget.label}: ${match.fileName} is ${match.sizeKb}kB (limit ${budget.maxKb}kB)`);
  }
}

const topJs = [...jsFiles]
  .sort((a, b) => b.sizeBytes - a.sizeBytes)
  .slice(0, 12)
  .map((file) => `- ${file.fileName}: ${file.sizeKb}kB`)
  .join('\n');

console.log('Bundle budget report (top JS chunks):');
console.log(topJs || '- No JS chunks found');

if (failures.length > 0) {
  console.error('\nBudget failures:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nBundle budget check passed.');
