const cluster = require('cluster');

function initProcesses(numProcesses, dependencies, initiator) {
    printWFG(numProcesses, dependencies);
    // Create an array to store worker references
    const workers = [];

    // Create worker processes
    for (let i = 0; i < numProcesses; i++) {
        const worker = cluster.fork();
        workers[i] = worker; // Store the worker reference by its process id

        worker.send({
            type: 'init',
            processId: i,
            numProcesses: numProcesses,
            dependencies: dependencies[i],
        });

        // Listen for messages from worker processes
        worker.on('message', (msg) => {
            if (msg.type === 'deadlock') {
                console.log(`Deadlock detected and the process will exit now...`);
                process.exit(0);
            } else if (msg.type === 'probe') {
                // Route the probe message to the appropriate worker process
                const recipientWorker = workers[msg.toProcessId];
                if (recipientWorker) {
                    recipientWorker.send({
                        type: 'probe',
                        probeMessage: msg.probeMessage,
                    });
                }
            } else if (msg.type === 'end') {
                console.log(`No Deadlock detected. Process will exit now....`);
                process.exit(0);
            }
        });
    }

    console.log("Initiator will start sending the probes after 10 seconds....");
    setTimeout(() => {
        // Start the deadlock detection by sending a message to the initiator process
        const initiatorWorker = workers[initiator]; // Get the initiator worker from the workers array
        initiatorWorker.send({ type: 'start' });
    }, 10000);

    // Handle worker process exit
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
    });
}

function printWFG(numProcesses, dependencies) {
    console.log('Wait-For Graph (WFG):');
    for (let i = 0; i < numProcesses; i++) {
      const deps = dependencies[i];
      deps.forEach((depProcessId) => {
        console.log(`P${i} -> P${depProcessId}`);
      });
    }
  }

module.exports = {
    initProcesses: initProcesses
};