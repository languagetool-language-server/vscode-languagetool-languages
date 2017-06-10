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


const Gradle = {
    exec: gradle,
    firstLevelDependencies: gradle_firstLevelDependencies,
}

module.exports = Gradle;