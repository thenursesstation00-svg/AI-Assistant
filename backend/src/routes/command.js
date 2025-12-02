// backend/src/routes/command.js - Execute commands from chat
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { isCommandDangerous } = require('../utils/commandSafety');

// POST /api/command - Execute a command
router.post('/', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Security: Block dangerous commands
    if (isCommandDangerous(command)) {
      return res.status(403).json({ 
        error: 'Command blocked for security reasons',
        output: 'This command could be dangerous and has been blocked.'
      });
    }

    console.log(`Executing command: ${command}`);

    // Execute command with timeout
    const { stdout, stderr } = await execPromise(command, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
      shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash'
    });

    res.json({
      success: true,
      output: stdout || stderr || 'Command executed successfully (no output)',
      command: command
    });

  } catch (error) {
    console.error('Command execution error:', error);
    
    res.json({
      success: false,
      error: error.message,
      output: error.stdout || error.stderr || 'Command failed to execute',
      command: req.body.command
    });
  }
});

module.exports = router;
