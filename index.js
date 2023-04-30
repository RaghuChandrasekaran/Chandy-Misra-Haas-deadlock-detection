'use strict';
const cluster = require('cluster');
const readInput = require('./readInputs').readInput;
const master = require('./master');
const worker = require('./worker');

if (cluster.isMaster) {
    console.log("Demonstrating Chandy-Misra-Haas algorithm for the AND model for distributed deadlock detection.");
    console.log("This program will assume that the process IDs start from 0 for simplicity.");
    readInput().then(({numProcesses, dependencies, initiator}) => {
        console.log(`Received Number of processess ${numProcesses} and initiator ${initiator}`);
        master.initProcesses(numProcesses, dependencies, initiator);
    });
} else {
    worker.listenForMessages();
}