const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.post('/exec', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  // Security check: In a real app, you'd want strict allowlisting here.
  // For this "Developer Control Panel", we assume authenticated admin access.
  // But we still block some dangerous patterns.
  if (command.includes('rm -rf /') || command.includes('format c:')) {
    return res.status(403).json({ error: 'Command blocked by safety policy' });
  }

  exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      return res.json({ 
        success: false, 
        output: stderr || error.message,
        exitCode: error.code 
      });
    }
    res.json({ 
      success: true, 
      output: stdout || stderr,
      exitCode: 0
    });
  });
});

module.exports = router;
