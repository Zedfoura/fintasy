import process from 'node:process';

// CLI argument parser
const args = process.argv.slice(2);
let filesArg = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--files' && args[i + 1]) {
    filesArg = args[i + 1];
    break;
  }
}

if (!filesArg) {
  console.log(JSON.stringify([]));
  process.exit(0);
}

const fileList = filesArg.split(',').map(f => f.trim()).filter(Boolean);
const impactedProjects = new Set<string>();

// Known projects in workspace
// packages/server -> "server"
// packages/client -> "client"
for (const file of fileList) {
  const normalized = file.replace(/\\/g, '/');
  if (normalized.startsWith('packages/server/') || normalized.startsWith('packages/server')) {
    impactedProjects.add('server');
  } else if (normalized.startsWith('packages/client/') || normalized.startsWith('packages/client')) {
    impactedProjects.add('client');
  } else if (
    normalized.startsWith('.wargaming/') ||
    normalized.startsWith('docs/') ||
    normalized.endsWith('.md')
  ) {
    // Documentation or wargaming meta-artifacts do not impact code project runtimes directly,
    // but if needed can be mapped to metadata.
  } else {
    // Root level files (package.json, pnpm-lock.yaml, etc.) affect all projects
    impactedProjects.add('server');
    impactedProjects.add('client');
  }
}

const result = Array.from(impactedProjects).sort();
console.log(JSON.stringify(result));
