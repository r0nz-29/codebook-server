import * as fs from 'fs';
import { spawn } from 'child_process';

export function executeCode(client, code: string) {
  fs.writeFile('Main.java', code, (err) => {
    if (err) {
      console.error('Error writing Java code to file:', err);
    } else {
      console.log('Java code written to Main.java');
      const childProcess = spawn('javac', ['Main.java'], { shell: true });

      let compileErrorOutput = '';

      // Capture the error output if there's any during compilation
      childProcess.stderr.on('data', (data) => {
        compileErrorOutput += data.toString();
      });

      childProcess.on('close', (code) => {
        if (code !== 0) {
          client.emit('compilation_failed', {
            status: 'fail',
            error: compileErrorOutput,
          });
          return;
        }
        // If compilation is successful, execute the Java code
        client.emit('compilation_successful');
        const executionProcess = spawn('java', ['Main'], { shell: true });

        let output = '';
        let executionErrorOutput = '';

        // Capture the standard output of the execution process
        executionProcess.stdout.on('data', (data) => {
          console.log(data);
          output += data.toString();
        });

        // Capture the error output of the execution process
        executionProcess.stderr.on('data', (data) => {
          executionErrorOutput += data.toString();
        });

        // Handle the completion of the execution process
        executionProcess.on('close', (code) => {
          if (code === 0) {
            // If the execution process exits successfully, send the output to the client
            console.log(output);
            client.emit('execution_complete', { status: 'success', output });
          } else {
            // If there is an error in the code execution, send the error output to the client
            client.emit('execution_failed', {
              status: 'fail',
              error: executionErrorOutput,
            });
          }
        });
      });
    }
  });
}
