const { execSync } = require('child_process');
const path = require('path');

function gitBranchBackup(repoRoot, prefix = 'autosave'){
  try{
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const branch = `${prefix}-${ts}`;
    execSync(`git -C "${repoRoot}" checkout -b "${branch}"`, { stdio: 'inherit' });
    return branch;
  }catch(e){
    console.error('gitBranchBackup failed', e && e.message);
    return null;
  }
}

function gitCommitAll(repoRoot, message = 'Apply automated patch'){
  try{
    execSync(`git -C "${repoRoot}" add -A`, { stdio: 'inherit' });
    execSync(`git -C "${repoRoot}" commit -m "${message.replace(/"/g,'\\"')}"`, { stdio: 'inherit' });
    return true;
  }catch(e){
    console.error('gitCommitAll failed', e && e.message);
    return false;
  }
}

module.exports = { gitBranchBackup, gitCommitAll };
