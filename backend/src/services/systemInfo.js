const os = require('os');
const gitService = require('./gitService');
const backendPackage = require('../../package.json');

function secondsToHms(totalSeconds) {
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const dayPart = days ? `${days} day${days === 1 ? '' : 's'}, ` : '';
  return `${dayPart}${hours}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

async function collectSystemInfo() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const repoMeta = await gitService.getRepoMetadata();

  return {
    os: os.platform(),
    os_version: `${os.platform()} ${os.release()}`,
    hostname: os.hostname(),
    cpu: cpus.length ? `${cpus.length} cores @ ${cpus[0].speed || 'unknown'}MHz` : 'unknown',
    cpu_model: cpus[0]?.model,
    cpu_load: os.loadavg(),
    memory: {
      total_gb: +(totalMem / 1024 / 1024 / 1024).toFixed(2),
      used_gb: +(usedMem / 1024 / 1024 / 1024).toFixed(2),
      free_gb: +(freeMem / 1024 / 1024 / 1024).toFixed(2),
      percent: +((usedMem / totalMem) * 100).toFixed(2)
    },
    uptime: secondsToHms(os.uptime()),
    app: {
      version: backendPackage.version,
      env: process.env.NODE_ENV || 'development',
      git_branch: repoMeta.branch,
      git_commit: repoMeta.commit,
      git_status: repoMeta.status,
      pid: process.pid
    }
  };
}

module.exports = {
  collectSystemInfo
};