#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const UPDATES_DIR = path.join(ROOT_DIR, 'updates');

interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

interface CategorizedCommits {
  features: CommitInfo[];
  bugFixes: CommitInfo[];
  performance: CommitInfo[];
  refactoring: CommitInfo[];
  documentation: CommitInfo[];
  styling: CommitInfo[];
  tests: CommitInfo[];
  chores: CommitInfo[];
  other: CommitInfo[];
}

function exec(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8', cwd: ROOT_DIR }).trim();
  } catch (error) {
    return '';
  }
}

function getPreviousTag(): string | null {
  const tags = exec('git tag --list "v*" --sort=-version:refname');
  if (!tags) return null;
  return tags.split('\n')[0] || null;
}

function getCommits(fromRef: string | null): CommitInfo[] {
  const range = fromRef ? `${fromRef}..HEAD` : 'HEAD';
  const logFormat = '%H%n%s%n%an%n%ai%n---COMMIT-END---';
  const log = exec(`git log ${range} --pretty=format:"${logFormat}"`);

  if (!log) return [];

  const commits: CommitInfo[] = [];
  const commitBlocks = log.split('---COMMIT-END---').filter(Boolean);

  for (const block of commitBlocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 4) {
      commits.push({
        hash: lines[0],
        message: lines[1],
        author: lines[2],
        date: lines[3],
      });
    }
  }

  return commits;
}

function categorizeCommits(commits: CommitInfo[]): CategorizedCommits {
  const categories: CategorizedCommits = {
    features: [],
    bugFixes: [],
    performance: [],
    refactoring: [],
    documentation: [],
    styling: [],
    tests: [],
    chores: [],
    other: [],
  };

  for (const commit of commits) {
    const message = commit.message.toLowerCase();

    if (message.startsWith('feat:') || message.startsWith('feat(')) {
      categories.features.push(commit);
    } else if (message.startsWith('fix:') || message.startsWith('fix(')) {
      categories.bugFixes.push(commit);
    } else if (message.startsWith('perf:') || message.startsWith('perf(')) {
      categories.performance.push(commit);
    } else if (message.startsWith('refactor:') || message.startsWith('refactor(')) {
      categories.refactoring.push(commit);
    } else if (message.startsWith('docs:') || message.startsWith('docs(')) {
      categories.documentation.push(commit);
    } else if (message.startsWith('style:') || message.startsWith('style(')) {
      categories.styling.push(commit);
    } else if (message.startsWith('test:') || message.startsWith('test(')) {
      categories.tests.push(commit);
    } else if (message.startsWith('chore:') || message.startsWith('chore(') || message.startsWith('i18n:') || message.startsWith('i18n(')) {
      categories.chores.push(commit);
    } else {
      categories.other.push(commit);
    }
  }

  return categories;
}

function getFileStats(fromRef: string | null): string {
  const range = fromRef ? `${fromRef}..HEAD` : 'HEAD';
  return exec(`git diff --stat ${range}`);
}

function formatCommitList(commits: CommitInfo[]): string {
  return commits
    .map((commit) => `- ${commit.message} (${commit.hash.substring(0, 7)})`)
    .join('\n');
}

function generateChangelog(version: string, fromTag: string | null): string {
  const commits = getCommits(fromTag);

  if (commits.length === 0) {
    return `# v${version}\n\n**Release Date:** ${new Date().toISOString().split('T')[0]}\n\nNo changes detected.\n`;
  }

  const categorized = categorizeCommits(commits);
  const fileStats = getFileStats(fromTag);

  let changelog = `# v${version}\n\n`;
  changelog += `**Release Date:** ${new Date().toISOString().split('T')[0]}\n`;
  changelog += `**Previous Version:** ${fromTag || 'Initial Release'}\n`;
  changelog += `**Total Commits:** ${commits.length}\n\n`;

  changelog += `---\n\n`;

  // Features
  if (categorized.features.length > 0) {
    changelog += `## ✨ Features\n\n`;
    changelog += formatCommitList(categorized.features) + '\n\n';
  }

  // Bug Fixes
  if (categorized.bugFixes.length > 0) {
    changelog += `## 🐛 Bug Fixes\n\n`;
    changelog += formatCommitList(categorized.bugFixes) + '\n\n';
  }

  // Performance
  if (categorized.performance.length > 0) {
    changelog += `## ⚡ Performance Improvements\n\n`;
    changelog += formatCommitList(categorized.performance) + '\n\n';
  }

  // Refactoring
  if (categorized.refactoring.length > 0) {
    changelog += `## ♻️ Code Refactoring\n\n`;
    changelog += formatCommitList(categorized.refactoring) + '\n\n';
  }

  // Documentation
  if (categorized.documentation.length > 0) {
    changelog += `## 📚 Documentation\n\n`;
    changelog += formatCommitList(categorized.documentation) + '\n\n';
  }

  // Styling
  if (categorized.styling.length > 0) {
    changelog += `## 💄 Styling\n\n`;
    changelog += formatCommitList(categorized.styling) + '\n\n';
  }

  // Tests
  if (categorized.tests.length > 0) {
    changelog += `## ✅ Tests\n\n`;
    changelog += formatCommitList(categorized.tests) + '\n\n';
  }

  // Chores
  if (categorized.chores.length > 0) {
    changelog += `## 🔧 Chores & Maintenance\n\n`;
    changelog += formatCommitList(categorized.chores) + '\n\n';
  }

  // Other
  if (categorized.other.length > 0) {
    changelog += `## 🔀 Other Changes\n\n`;
    changelog += formatCommitList(categorized.other) + '\n\n';
  }

  // File Statistics
  if (fileStats) {
    changelog += `---\n\n`;
    changelog += `## 📊 File Changes\n\n`;
    changelog += '```\n';
    changelog += fileStats + '\n';
    changelog += '```\n';
  }

  return changelog;
}

async function main() {
  try {
    // Read version from package.json
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    console.log(`📝 Generating changelog for v${version}...`);

    // Get previous tag
    const previousTag = getPreviousTag();
    console.log(`📌 Previous tag: ${previousTag || 'None (initial release)'}`);

    // Generate changelog
    const changelog = generateChangelog(version, previousTag);

    // Ensure updates directory exists
    if (!fs.existsSync(UPDATES_DIR)) {
      fs.mkdirSync(UPDATES_DIR, { recursive: true });
    }

    // Write changelog file
    const changelogPath = path.join(UPDATES_DIR, `v${version}.md`);
    fs.writeFileSync(changelogPath, changelog, 'utf-8');
    console.log(`✅ Changelog written to: ${changelogPath}`);

    // Stage the changelog file
    exec(`git add updates/`);
    console.log(`✅ Staged changes in updates/ directory`);

    console.log(`\n🎉 Changelog generation complete!`);
  } catch (error) {
    console.error('❌ Error generating changelog:', error);
    process.exit(1);
  }
}

main();
