import { execSync } from 'child_process';
import { platform } from 'os';

try {
  if (platform() === 'win32') {
    // Kill processes using ports 3000 and 24678 on Windows
    try {
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr :3000 ^| findstr LISTENING\') do taskkill /f /pid %a', { stdio: 'inherit' });
    } catch (e) {
      // Ignore errors if no process found
    }
    try {
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr :24678 ^| findstr LISTENING\') do taskkill /f /pid %a', { stdio: 'inherit' });
    } catch (e) {
      // Ignore errors if no process found
    }
  }
  console.log('[Cleanup] Port cleanup completed');
} catch (error) {
  console.log('[Cleanup] No processes to clean up');
}