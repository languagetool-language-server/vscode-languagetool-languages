"use strict";
const util = require('util');
const gradle = require('./gradle.js');
const fs = require('fs');


// https://stackoverflow.com/a/3561711/1072626
RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function templateReplace(find, replace, text){
    return text.replace(new RegExp( RegExp.escape('${' + find + '}'), 'g'), replace)
}

async function writeGradleBuild(packageName){
    const text = await util.promisify(fs.readFile)('./src/resources/template.gradle', 'utf8');
    return util.promisify(fs.writeFile)('./build.gradle', templateReplace('package',  packageName, text), 'utf8')
}

async function readAllJars() {
    return util.promisify(fs.readdir)('./build/install/vscode-languagetool-languages/lib/')
}

async function writeVscodeignore(){
    await writeGradleBuild("org.languagetool:languagetool-core:3.7");
    await gradle.exec('installDist');
    const files = await readAllJars();
    await util.promisify(fs.writeFile)('.vscodeignore', files.map(s => 'build/install/vscode-languagetool-languages/lib/' + s).join('\n'))
}

async function main(){
    const {createVSIX} = require('vsce')
    
    await writeGradleBuild("org.languagetool:language-all:3.7");
    const packages = await gradle.firstLevelDependencies();

    await writeVscodeignore();

    packages.forEach(async function(packageName) {
        await writeGradleBuild(packageName)
        // TODO: Establish .vscodeignore
        await gradle.exec('installDist')
        // TODO: Implement the following command
        await gradle.exec('run')
        // TODO: Control output name and directory
        await createVSIX()
        
    }, this);
}


module.exports.templateReplace = templateReplace;
module.exports.gradle = gradle;
module.exports.writeGradleBuild = writeGradleBuild;
module.exports.writeVscodeignore = writeVscodeignore;