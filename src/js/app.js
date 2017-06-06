"use strict";
const util = require('util');

async function execute(command, callback) {
    const exec = util.promisify(require('child_process').exec);

    const {stdout, stderr} = await exec(command)
    return stdout
};

function gradle(gradleArgs) {
    return execute('./gradlew ' + gradleArgs)
}

RegExp.prototype.execAll = function(string) {
    var match = null;
    var matches = new Array();
    while (match = this.exec(string)) {
        var matchArray = [];
        matches.push(match[1]);
    }
    return matches;
}

async function gradle_firstLevelDependencies() {
    const output = await gradle('dependencies -p test/resources --configuration default')
    const firstLevel = /^     [\\+]--- (.*)$/mg
    const matches = firstLevel.execAll(output)
    return matches
}

// https://stackoverflow.com/a/3561711/1072626
RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function templateReplace(find, replace, text){
    return text.replace(new RegExp( RegExp.escape('${' + find + '}'), 'g'), replace)
}

async function writeGradleBuild(packageName){
    const fs = require('fs');
    const text = await util.promisify(fs.readFile)('./src/resources/template.gradle', 'utf8');
    return util.promisify(fs.writeFile)('./build.gradle', templateReplace('package',  packageName, text), 'utf8')
}

async function main(){
    const packages = await gradle_firstLevelDependencies()

    const {createVSIX} = require('vsce')

    packages.forEach(async function(packageName) {
        await writeGradleBuild(packageName)
        // TODO: Establish .vscodeignore
        await gradle('installDist')
        // TODO: Implement the following command
        await gradle('run')
        // TODO: Control output name and directory
        await createVSIX()
        
    }, this);
}

module.exports.execute = execute;
module.exports.templateReplace = templateReplace;
module.exports.gradle = gradle;
module.exports.writeGradleBuild = writeGradleBuild;
module.exports.gradle_firstLevelDependencies = gradle_firstLevelDependencies;