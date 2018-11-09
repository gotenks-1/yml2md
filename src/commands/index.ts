#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as yamljs from 'js-yaml';
import * as json2md from 'json2md';
// fs.writeFileSync(path.resolve(process.cwd(), './out/abc'), 'hello world');

let srcDir = 'sample';
let srcPath = path.resolve(process.cwd(), srcDir);

let outDir = 'outmds';
let r = readDir('sample', process.cwd());
console.log(r);

let z = r[17]['res'][2]['res'];
console.log(z);

console.log(mapClassToMd(z.classes[0]));

function mapClassToMd(classInfo) {
    let mappedClass = [];
    if (!classInfo) {
        return mappedClass;
    }

    // class name heading
    mappedClass.push({
        h1: classInfo.name
    });

    // class description
    mappedClass.push({
        p: classInfo.description
    });

    if (classInfo.constructor) {
        
    }

    if (classInfo.properties && classInfo.properties.length) {
        mappedClass.push({
            h2: 'Properties'
        });
        mappedClass.push({
            ul: classInfo.properties.map(prop => prop.id)
        });
    }



    return mappedClass;
}

function mapFunction(funInfo){
    let mappedFun = [];

    // name
    mappedFun.push({
        h3: funInfo.name
    });

    // description
    mappedFun.push({
        p: funInfo.description
    });

    // signature
    mappedFun.push({
        code: {
            language: 'js',
            content: funInfo.signature
        }
    });

    // parms
    if(funInfo.parameters && funInfo.parameters.length){
        mappedFun.push({
            h3: 'Props..'
        });
        mappedFun = mappedFun.concat(mapAllParmProps(funInfo.parameters));
    }
    
    // return
    mappedFun = mappedFun.concat(mapParmProp(funInfo.return));

    return mappedFun;
}

function mapParmProp(parmInfo){
    let mappedParmProp = [];

    // name
    mappedParmProp.push({
        h4: parmInfo.id
    });

    // description
    mappedParmProp.push({
        p: parmInfo.description
    });

    // type and optional
    mappedParmProp.push({
        table: {
            headers: ['Type', 'Required'],
            rows: [{
                type: parmInfo.type,
                optional: parmInfo.optional
            }]
        }
    });

    return mapParmProp;
}

function mapAllParmProps(propsArray) {
    let mappedParmProps = [];

    if (propsArray && propsArray.length) {
        propsArray.forEach((prop) => {
            mappedParmProps = mappedParmProps.concat(mapParmProp(prop));
        });
    }

    return mappedParmProps;
}

function readDir(targetDirPath, parentDir) {
    let res = [];
    let dirPath = path.resolve(parentDir, targetDirPath);
    let filePaths = fs.readdirSync(dirPath);
    for (let i = 0; i < filePaths.length; i++) {
        let filePath = filePaths[i];
        let stat = fs.lstatSync(path.resolve(dirPath, filePath));
        let curRes;
        if (stat.isDirectory()) {
            curRes = readDir(filePath, dirPath);
        } else if (stat.isFile()) {
            curRes = readFile(filePath, dirPath);
        }
        res.push({
            fileName: filePath,
            res: curRes
        });
    }
    return res;
}

function readFile(sourceFilePath, dirPath) {
    let filePath = path.resolve(dirPath, sourceFilePath);
    // console.log(filePath, fs.lstatSync(filePath).isFile());
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
        return {};
    }
    let fc = fs.readFileSync(filePath);
    let json = yamljs.safeLoad(fc.toString());

    let info = getItemsInfo(json.items);
    // console.log('imp', info);
    return info;
}

function getItemsInfo(items: any[]) {
    let tempStructure = {};
    let itemsInfo = {
        classes: [],
        interfaces: [],
        functions: []
    };
    if (!items) {
        return itemsInfo;
    }

    for (let i = 0; i < items.length; i++) {
        let curItem = items[i];
        tempStructure[curItem.uid] = curItem;
    }

    for (let i = 0; i < items.length; i++) {
        let curItem = items[i];
        switch (curItem.type) {
            case 'class': let cInfo = getClassInfo(curItem, tempStructure);
                itemsInfo.classes.push(cInfo);
                break;

            case 'interface': let iInfo = getClassInfo(curItem, tempStructure);
                itemsInfo.interfaces.push(iInfo);
                break;

            case 'function': let fInfo = getFuntionInfo(curItem);
                itemsInfo.functions.push(fInfo);
        }
    }

    return itemsInfo;
}

function getClassInfo(classDetails, uidItems) {
    let classInfo = {
        description: classDetails.summary,
        properties: [],
        methods: [],
        constructor: [],
        name: classDetails.name,
        package: classDetails.package
    };

    if (classDetails.children && classDetails.children.length) {
        for (let i = 0; i < classDetails.children.length; i++) {
            let child = uidItems[classDetails.children[i]];
            // console.log('child', child);
            // console.log('uids', uidItems); 
            // console.log('uids', );
            switch (child.type) {
                case 'method': let method = getMethodInfo(child);
                    classInfo.methods.push(method);
                    break;

                case 'constructor': let cons = getMethodInfo(child);
                    classInfo.constructor.push(cons);
                    break;

                case 'property': let prop = getPropertyInfo(child);
                    classInfo.properties.push(child);
                    break;
            }
        }
    }

    if (classDetails.extends && classDetails.extends.name) {
        classInfo['extends'] = classDetails.extends.name;
    }

    return classInfo;
}

function getFuntionInfo(funtionDetails) {
    let mInfo = getMethodInfo(funtionDetails);
    mInfo['package'] = funtionDetails.package;
    mInfo['name'] = funtionDetails.name;
    return mInfo;
}

function getMethodInfo(methodDetails) {
    let methodInfo = {
        name: methodDetails.name,
        description: methodDetails.summary,
        signature: '',
        parameters: [],
        return: 'void'
    };

    if (methodDetails.syntax) {
        methodInfo.signature = methodDetails.syntax.content;
        if (methodDetails.syntax.parameters) {
            methodDetails.syntax.parameters.forEach(parm => {
                methodInfo.parameters.push({
                    id: parm.id,
                    type: (parm.type && parm.type.length) ? parm.type[0] : 'any',
                    description: parm.description,
                    optional: parm.optional || false
                });
            });
        }
        if (methodDetails.syntax.return && methodDetails.syntax.return.type && methodDetails.syntax.return.type.length) {
            methodInfo.return = methodDetails.syntax.return.type[0];
        }
    }
    return methodInfo;
}

function getPropertyInfo(propDetail) {
    return {
        id: propDetail.uid,
        type: (propDetail.syntax && propDetail.syntax.return && propDetail.syntax.return.type && propDetail.syntax.return.type.length) ? propDetail.syntax.return.type[0] : 'any',
        description: propDetail.summary,
        optional: propDetail.optional || false
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
