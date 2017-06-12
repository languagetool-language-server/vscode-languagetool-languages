"use strict";

const {promisify} = require('util');

const RegExpExecAll = function (regexp, string) {
    var match = null;
    var matches = new Array();
    while (match = regexp.exec(string)) {
        var matchArray = [];
        matches.push(match[1]);
    }
    return matches;
};

async function execute(command, callback) {
    const exec = promisify(require('child_process').exec);

    const { stdout, stderr } = await exec(command)
    return stdout
}

function Gradle(projectPath) {
    const gradle = {
        exec: function (gradleArgs) {
            return execute('./gradlew ' + (projectPath ? `-p ${projectPath} ` : '') + gradleArgs)
        },
        firstLevelDependencies: async function () {
            const output = await this.exec('dependencies --configuration default')
            const firstLevel = /^     [\\+]--- (.*)$/mg
            const matches = RegExpExecAll(firstLevel, output)
            return matches
        }
    }

    return gradle;
}

module.exports = Gradle;