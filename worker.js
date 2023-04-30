let processId;
let numProcesses;
let dependencies;
let dependent;

function listenForMessages() {
    process.on('message', (msg) => {
        //console.log(`Received message ${JSON.stringify(msg)} in process ${processId}`);
        if (msg.type === 'init') {
            // Initialize the worker process with its dependencies
            processId = msg.processId;
            numProcesses = msg.numProcesses;
            dependencies = msg.dependencies;
            dependent = Array(numProcesses).fill(false);
            console.log(`P${processId}: Initialized process with ID ${processId}`);
        } else if (msg.type === 'start') {
            // Start the deadlock detection by sending initial probes
            console.log(`P${processId}: Initiating deadlock detection by process ${processId}`);
            if (dependencies.length == 0) {
                console.log(`P${processId}: No dependent processes found.So not sending out any probes...`);
                process.send({ type: 'end' });
            } else if (dependencies.includes(processId)) {
                console.log(`P${processId}: Deadlock detected as the process is dependent on itself...`);
                process.send({ type: 'deadlock' });
            } else {
                dependencies.forEach((depProcessId) => {
                    console.log(`P${processId}: Sending probe message (${processId}, ${processId}, ${depProcessId})`);
                    process.send({
                        type: 'probe',
                        toProcessId: depProcessId,
                        probeMessage: {
                            i: processId,
                            j: processId,
                            k: depProcessId,
                        },
                    });
                });
            }
        } else if (msg.type === 'probe') {
            // Handle the received probe message and forward it to dependent processes if necessary
            const { i, j, k } = msg.probeMessage;
            console.log(`P${processId}: Received probe message triplet (${i}, ${j}, ${k})`);
            if (k === i) {
                // A cycle has been detected
                console.log(`P${processId}: Process ${processId}: Detected a deadlock involving initiator...`);
                process.send({ type: 'deadlock' });
            } else if (!dependent[i]) {
                dependent[i] = true;
                if (dependencies.length == 0) {
                    console.log(`P${processId}: No dependent processes found.So not sending out any probes...`)
                }
                dependencies.forEach((depProcessId) => {
                    console.log(`P${processId}: Sending probe message (${i}, ${processId}, ${depProcessId})`);
                    process.send({
                        type: 'probe',
                        toProcessId: depProcessId,
                        probeMessage: {
                            i: i,
                            j: processId,
                            k: depProcessId,
                        },
                    });
                });
            } else {
                console.log(`P${processId}: Discarding probe message (${i}, ${j}, ${k}) by ${processId} as dependent[${i}] is true -  ${dependent}`);
                console.log(`P${processId}: Deadlock is detected as Process ${processId} got probe back...`);
                console.log(`P${processId}: Process ${processId} might not be the initiator but as dependent is already true there must be a deadlock...`);
                process.send({ type: 'deadlock' });
            }
        }
    });
}

module.exports = {
    listenForMessages: listenForMessages
}