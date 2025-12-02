const path = require('path');
const { execFile } = require('child_process');
const util = require('util');

const execFileAsync = util.promisify(execFile);

const DEFAULT_MAX_BUFFER = 1024 * 1024; // 1MB
const repoRoot = process.env.GIT_REPO_ROOT
  ? path.resolve(process.env.GIT_REPO_ROOT)
  : path.resolve(__dirname, '../../..');

async function runGit(args) {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd: repoRoot,
    maxBuffer: DEFAULT_MAX_BUFFER
  });
  return (stdout && stdout.trim()) || (stderr && stderr.trim()) || '';
}

async function getStatus() {
  const output = await runGit(['status', '--porcelain=v1']);
  if (!output) return [];
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2).trim() || line.charAt(0),
      file: line.slice(3).trim()
    }));
}

async function commitAll(message) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Commit message required');
  }
  await runGit(['add', '-A']);
  return runGit(['commit', '-m', message.trim()]);
}

async function pull() {
  return runGit(['pull']);
}

async function push() {
  return runGit(['push']);
}

async function getRepoMetadata() {
  const [branch, commit] = await Promise.all([
    runGit(['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => null),
    runGit(['rev-parse', '--short', 'HEAD']).catch(() => null)
  ]);

  let statusSummary = null;
  try {
    const changes = await getStatus();
    statusSummary = {
      changes: changes.length,
      isClean: changes.length === 0
    };
  } catch (error) {
    statusSummary = null;
  }

  return {
    branch,
    commit,
    status: statusSummary
  };
}

module.exports = {
  getStatus,
  commitAll,
  pull,
  push,
  getRepoMetadata
};