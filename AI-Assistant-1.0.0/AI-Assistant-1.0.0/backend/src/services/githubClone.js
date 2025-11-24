const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function hasGit(){
  try{ execSync('git --version', { stdio: 'ignore' }); return true; }catch(e){ return false; }
}

async function cloneOrUpdateRepo(cloneUrl, dest){
  if(!hasGit()) throw new Error('git not available on PATH');
  // if dest contains a .git, attempt pull, else clone into temp and move
  const gitDir = path.join(dest, '.git');
  if(fs.existsSync(gitDir)){
    try{
      execSync(`git -C "${dest}" pull --ff-only`, { stdio: 'inherit' });
      return { updated: true };
    }catch(e){
      throw new Error('git pull failed: ' + (e && e.message));
    }
  }

  // clone into dest
  try{
    // clone with depth=1 to save time
    execSync(`git clone --depth=1 "${cloneUrl}" "${dest}"`, { stdio: 'inherit' });
    return { cloned: true };
  }catch(e){
    throw new Error('git clone failed: ' + (e && e.message));
  }
}

module.exports = { cloneOrUpdateRepo };
