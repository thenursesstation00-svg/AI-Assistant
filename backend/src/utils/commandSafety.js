const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\/?/i,
  /format\s+c:/i,
  /del\s+\/s\s+\/q/i,
  /rmdir\s+\/s\s+\/q/i,
  /shutdown/i,
  /restart/i,
  /mkfs/i,
  /dd\s+if=/i,
  /diskpart/i,
  /:\(\)\s*\{\s*:\|:&\s*\};\s*:/
];

function isCommandDangerous(command = '') {
  if (!command || typeof command !== 'string') {
    return false;
  }
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(command));
}

module.exports = {
  DANGEROUS_PATTERNS,
  isCommandDangerous
};
