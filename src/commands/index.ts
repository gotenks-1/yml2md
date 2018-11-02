#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as yamljs from 'js-yaml';
// fs.writeFileSync(path.resolve(process.cwd(), './out/abc'), 'hello world');

let srcDir = './sample';
let srcPath = path.resolve(process.cwd(), srcDir);
console.log(srcPath);


let files = fs.readdirSync(srcPath);
console.log(files);

let file = files[2];
let fc = fs.readFileSync(path.resolve(srcPath, file));
let json = yamljs.safeLoad(fc.toString());
console.log(json);

function getItems(items: any[]) {
    let tempStructure = {};

    for (let i = 0; i < items.length; i++) {
        let curItem = items[i];
        tempStructure[curItem.uid] = curItem;
    }

    for (let i = 0; i < items.length; i++) {
        let curItem = items[i];
        switch (curItem.type) {
            case 'class':
        }
    }
}

function getClassInfo(classDetails, uidItems) {
    let classinfo = {
        description: classDetails.summary,
        properties: [],
        methods: [],
        constructor: []
    };

    if (classDetails.children && classDetails.children.length) {
        for (let i = 0; i <= classDetails.children.length; i++) {

        }
    }
}

function getMethodInfo(methodDetails) {
    let methodInfo = {
        description: methodDetails.summary,
        signature: '',
        parameters: [],
        return: 'void'
    };

    if (methodDetails.syntax) {
        // methodInfo.signature = 
    }
}

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// stop from exiting node process
rl.on('line', async (inp) => {
    if (inp == "close") {
        console.log('closing now');
        rl.close();
        process.exit();
    } else {
        console.log(inp);
    }
});

console.log('c success');
