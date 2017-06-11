"use strict";
const util = require('util');
const gradle = require('./gradle.js');
const fs = require('fs');

const iconTemplate = "img/png/LanguageTool-Icon-${short code}.png";

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

async function writeVscodeignore(coreFiles, shortCode) {
    const currentFiles = await util.promisify(fs.readdir)('./build/install/vscode-languagetool-languages/lib/')

    const difference = (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) == -1);

    const filesToInclude = difference(currentFiles, coreFiles)

    const excludeEverything = "*\n" + "*/**\n"

    await util.promisify(fs.writeFile)('.vscodeignore',
        "*\n" +
        "*/**\n" +
        "!README.md\n" +
        "!LICENSE.txt\n" +
        "!ACKNOWLEDGMENTS.md\n" +
        `!${templateReplace('short code', shortCode, iconTemplate)}\n` + 
        filesToInclude.map(s => '!build/install/vscode-languagetool-languages/lib/' + s).join('\n'))
}

function getLanguageShortCode(packageName) {
    const re = /language-(.*):/
    return re.exec(packageName)[1]
}

async function setPackageIcon(shortCode){
    const text = await util.promisify(fs.readFile)('package.json', 'utf8')
    const json = JSON.parse(text)
    json.icon = templateReplace('short code', shortCode, iconTemplate)
    return util.promisify(fs.writeFile)('package.json', JSON.stringify(json))
}

async function main() {
    const { createVSIX } = require('vsce')

    await writeGradleBuild("org.languagetool:language-all:3.7");
    const packages = await gradle.firstLevelDependencies();
    const coreFiles = await getCoreFiles();
    
    const json = JSON.parse(await util.promisify(fs.readFile)('package.json', 'utf8'))
    const version = json.version

    for (const packageName of packages) {
        const shortCode = getLanguageShortCode(packageName)        
        await writeGradleBuild(packageName)
        await gradle.exec('installDist')
        await writeVscodeignore(coreFiles, shortCode)
        await gradle.exec('run')
        console.log(shortCode)
        await setPackageIcon(shortCode);
        await createVSIX({packagePath: `vscode-languagetool-${shortCode}-${version}.vsix`})
    }
}


module.exports.templateReplace = templateReplace;
module.exports.gradle = gradle;
module.exports.writeGradleBuild = writeGradleBuild;
module.exports.writeVscodeignore = getCoreFiles;
module.exports.main = main;
module.exports.setPackageIcon = setPackageIcon;