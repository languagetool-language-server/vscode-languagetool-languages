"use strict";
const util = require('util');
const gradle = require('./gradle.js');
const fs = require('fs');


// https://stackoverflow.com/a/3561711/1072626
RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function templateReplace(find, replace, text) {
    return text.replace(new RegExp(RegExp.escape('${' + find + '}'), 'g'), replace)
}

/** If this returned a randomized (which it returned) packages could be build in parallel. */
async function writeGradleBuild(packageName) {
    const text = await util.promisify(fs.readFile)('./src/resources/template.gradle', 'utf8');
    return util.promisify(fs.writeFile)('./build.gradle', templateReplace('package', packageName, text), 'utf8')
}

async function readAllJars() {
    return util.promisify(fs.readdir)('./build/install/vscode-languagetool-languages/lib/')
}

async function getCoreFiles() {

    await writeGradleBuild("org.languagetool:languagetool-core:3.7");

    await gradle.exec('installDist');

    return readAllJars();
}

async function writeVscodeignore(coreFiles) {
    const currentFiles = await util.promisify(fs.readdir)('./build/install/vscode-languagetool-languages/lib/')

    const difference = (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) == -1);

    const filesToInclude = difference(currentFiles, coreFiles)

    const excludeEverything = "*\n" + "*/**\n"

    await util.promisify(fs.writeFile)('.vscodeignore',
        "*\n" +
        "*/**\n" +
        filesToInclude.map(s => '!build/install/vscode-languagetool-languages/lib/' + s).join('\n'))
}

async function main() {
    const { createVSIX } = require('vsce')

    await writeGradleBuild("org.languagetool:language-all:3.7");
    const packages = await gradle.firstLevelDependencies();
    const coreFiles = await getCoreFiles();

    console.log(packages.join("\n"));

    for (const packageName of packages) {
        await writeGradleBuild(packageName)
        await gradle.exec('installDist')
        await writeVscodeignore(coreFiles)
        // TODO: Implement the following command
        //await gradle.exec('run')
        // TODO: Control output name and directory
        await createVSIX()
    }
}


module.exports.templateReplace = templateReplace;
module.exports.gradle = gradle;
module.exports.writeGradleBuild = writeGradleBuild;
module.exports.writeVscodeignore = getCoreFiles;
module.exports.main = main;