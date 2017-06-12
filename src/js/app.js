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
    return util.promisify(fs.writeFile)('./staging/build.gradle', templateReplace('package', packageName, text), 'utf8')
}

async function readAllJars() {
    return util.promisify(fs.readdir)('./staging/build/install/staging/lib/')
}

async function getCoreFiles() {
    await writeGradleBuild("org.languagetool:languagetool-core:3.7");

    await gradle.exec('-p staging/ installDist');

    return readAllJars();
}

async function writeVscodeignore(coreFiles, shortCode) {
    const currentFiles = await util.promisify(fs.readdir)('./staging/build/install/staging/lib/')

    const difference = (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) == -1);

    const filesToInclude = difference(currentFiles, coreFiles)

    const excludeEverything = "*\n" + "*/**\n"

    await util.promisify(fs.writeFile)('staging/.vscodeignore',
        "*\n" +
        "*/**\n" +
        "!README.md\n" +
        "!LICENSE.txt\n" +
        "!ACKNOWLEDGMENTS.md\n" +
        "!package.json" +
        `!${templateReplace('short code', shortCode, iconTemplate)}\n` +
        filesToInclude.map(s => '!lib/' + s).join('\n'))
}

function getLanguageShortCode(packageName) {
    const re = /language-(.*):/
    return re.exec(packageName)[1]
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
        await gradle.exec('-p staging/ installDist')
        await writeVscodeignore(coreFiles, shortCode)
        await gradle.exec('-p staging/ run')
        console.log(shortCode)

        // Temporary see https://github.com/Microsoft/vscode-vsce/issues/177
        const exec = util.promisify(require('child_process').exec);
        await exec("rm -Rf staging/lib")
        await exec("cp -R staging/build/install/staging/lib staging/")

        await createVSIX({ cwd: 'staging/', packagePath: `vscode-languagetool-${shortCode}-${version}.vsix` })
    }
}


module.exports.templateReplace = templateReplace;
module.exports.gradle = gradle;
module.exports.writeGradleBuild = writeGradleBuild;
module.exports.writeVscodeignore = getCoreFiles;
module.exports.main = main;