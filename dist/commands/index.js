#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var readline = require("readline");
var yamljs = require("js-yaml");
// fs.writeFileSync(path.resolve(process.cwd(), './out/abc'), 'hello world');
var srcDir = 'sample';
var srcPath = path.resolve(process.cwd(), srcDir);
var outDir = 'outmds';
var r = readDir('sample', process.cwd());
console.log(r);
var z = r[17]['res'][2]['res'];
console.log(z);
console.log(mapClassToMd(z.classes[0]));
function mapClassToMd(classInfo) {
    var mappedClass = [];
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
            ul: classInfo.properties.map(function (prop) { return prop.id; })
        });
    }
    return mappedClass;
}
function mapFunction(funInfo) {
    var mappedFun = [];
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
    if (funInfo.parameters && funInfo.parameters.length) {
        mappedFun.push({
            h3: 'Props..'
        });
        mappedFun = mappedFun.concat(mapAllParmProps(funInfo.parameters));
    }
    // return
    mappedFun = mappedFun.concat(mapParmProp(funInfo["return"]));
    return mappedFun;
}
function mapParmProp(parmInfo) {
    var mappedParmProp = [];
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
    var mappedParmProps = [];
    if (propsArray && propsArray.length) {
        propsArray.forEach(function (prop) {
            mappedParmProps = mappedParmProps.concat(mapParmProp(prop));
        });
    }
    return mappedParmProps;
}
function readDir(targetDirPath, parentDir) {
    var res = [];
    var dirPath = path.resolve(parentDir, targetDirPath);
    var filePaths = fs.readdirSync(dirPath);
    for (var i = 0; i < filePaths.length; i++) {
        var filePath = filePaths[i];
        var stat = fs.lstatSync(path.resolve(dirPath, filePath));
        var curRes = void 0;
        if (stat.isDirectory()) {
            curRes = readDir(filePath, dirPath);
        }
        else if (stat.isFile()) {
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
    var filePath = path.resolve(dirPath, sourceFilePath);
    // console.log(filePath, fs.lstatSync(filePath).isFile());
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
        return {};
    }
    var fc = fs.readFileSync(filePath);
    var json = yamljs.safeLoad(fc.toString());
    var info = getItemsInfo(json.items);
    // console.log('imp', info);
    return info;
}
function getItemsInfo(items) {
    var tempStructure = {};
    var itemsInfo = {
        classes: [],
        interfaces: [],
        functions: []
    };
    if (!items) {
        return itemsInfo;
    }
    for (var i = 0; i < items.length; i++) {
        var curItem = items[i];
        tempStructure[curItem.uid] = curItem;
    }
    for (var i = 0; i < items.length; i++) {
        var curItem = items[i];
        switch (curItem.type) {
            case 'class':
                var cInfo = getClassInfo(curItem, tempStructure);
                itemsInfo.classes.push(cInfo);
                break;
            case 'interface':
                var iInfo = getClassInfo(curItem, tempStructure);
                itemsInfo.interfaces.push(iInfo);
                break;
            case 'function':
                var fInfo = getFuntionInfo(curItem);
                itemsInfo.functions.push(fInfo);
        }
    }
    return itemsInfo;
}
function getClassInfo(classDetails, uidItems) {
    var classInfo = {
        description: classDetails.summary,
        properties: [],
        methods: [],
        constructor: [],
        name: classDetails.name,
        package: classDetails.package
    };
    if (classDetails.children && classDetails.children.length) {
        for (var i = 0; i < classDetails.children.length; i++) {
            var child = uidItems[classDetails.children[i]];
            // console.log('child', child);
            // console.log('uids', uidItems); 
            // console.log('uids', );
            switch (child.type) {
                case 'method':
                    var method = getMethodInfo(child);
                    classInfo.methods.push(method);
                    break;
                case 'constructor':
                    var cons = getMethodInfo(child);
                    classInfo.constructor.push(cons);
                    break;
                case 'property':
                    var prop = getPropertyInfo(child);
                    classInfo.properties.push(child);
                    break;
            }
        }
    }
    if (classDetails["extends"] && classDetails["extends"].name) {
        classInfo['extends'] = classDetails["extends"].name;
    }
    return classInfo;
}
function getFuntionInfo(funtionDetails) {
    var mInfo = getMethodInfo(funtionDetails);
    mInfo['package'] = funtionDetails.package;
    mInfo['name'] = funtionDetails.name;
    return mInfo;
}
function getMethodInfo(methodDetails) {
    var methodInfo = {
        name: methodDetails.name,
        description: methodDetails.summary,
        signature: '',
        parameters: [],
        "return": 'void'
    };
    if (methodDetails.syntax) {
        methodInfo.signature = methodDetails.syntax.content;
        if (methodDetails.syntax.parameters) {
            methodDetails.syntax.parameters.forEach(function (parm) {
                methodInfo.parameters.push({
                    id: parm.id,
                    type: (parm.type && parm.type.length) ? parm.type[0] : 'any',
                    description: parm.description,
                    optional: parm.optional || false
                });
            });
        }
        if (methodDetails.syntax["return"] && methodDetails.syntax["return"].type && methodDetails.syntax["return"].type.length) {
            methodInfo["return"] = methodDetails.syntax["return"].type[0];
        }
    }
    return methodInfo;
}
function getPropertyInfo(propDetail) {
    return {
        id: propDetail.uid,
        type: (propDetail.syntax && propDetail.syntax["return"] && propDetail.syntax["return"].type && propDetail.syntax["return"].type.length) ? propDetail.syntax["return"].type[0] : 'any',
        description: propDetail.summary,
        optional: propDetail.optional || false
    };
}
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// stop from exiting node process
rl.on('line', function (inp) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (inp == "close") {
            console.log('closing now');
            rl.close();
            process.exit();
        }
        else {
            console.log(inp);
        }
        return [2 /*return*/];
    });
}); });
console.log('c success');
