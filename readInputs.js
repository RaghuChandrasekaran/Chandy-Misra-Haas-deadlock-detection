const readline = require('readline/promises');

async function readInput() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const numProcessesStr = await rl.question('Enter the number of Processes in the Distributed System: ');
    const numProcesses = parseInt(numProcessesStr);

    if (isNaN(numProcesses) || numProcesses < 1) {
        console.error('Invalid input. Please enter a valid number of processes...');
        process.exit(1);
    }

    const dependencies = [];
    let initiator;
    let count = 0;
    console.log("In the next step enter the values for WFG i.e the dependent Process IDs for each process as prompted."); 
    console.log("For example if Process 0 is dependent on P1 and P3 then enter 1,3 as input.");
    console.log("If there is no dependency then enter as N.");
    const readDependencies = async () => {
        const depsStr = await rl.question(`Enter the dependencies for Process ${count} (comma-separated): `);
        const deps = depsStr.startsWith("N")? [] : depsStr.split(',').map(Number);
        dependencies.push(deps);

        if (++count < numProcesses) {
            await readDependencies();
        } else {
            const initiatorStr = await rl.question('Enter the initiator Process ID: ');
            initiator = parseInt(initiatorStr);
            if (isNaN(initiator) || initiator < 0 || initiator >= numProcesses) {
                console.error('Invalid input. Please enter a valid initiator process ID.');
                process.exit(1);
            }
            rl.close();
        }
    };

    await readDependencies();
    return { numProcesses, dependencies, initiator };
}

module.exports = {
    readInput: readInput
};