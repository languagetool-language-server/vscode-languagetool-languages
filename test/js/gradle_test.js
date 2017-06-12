"use strict";
const rewire = require('rewire');
const chai = require('chai');
const assert = chai.assert;

const Gradle = rewire('../../src/js/gradle.js');
const gradle = Gradle('test/resources/');

const execute = Gradle.__get__('execute');

describe('execute', function () {
  it('should pass output', async function () {
    const output = await execute("echo -n hello")
    return assert.equal(output, 'hello');
  })
})

it('should fail on unknown command', function () {
  return assert.isRejected(execute('thiscommanddoesnotexist'));
})

// describe('gradle', function () {
//   it('command should be found', async function () {
//     const output = await gradle.exec('--version');
//     return assert.match(output, /Gradle \d+.\d+/);
//   })
// })

describe('gradle_firstLevelDependencies', function () {
  it('should contain items matching expected pattern', async function () {
    const packages = await gradle.firstLevelDependencies()
    packages.forEach(function (element) {
      assert.match(element, /^org.languagetool:language-(.*):3.\d+$/)
    }, this);
    assert.isNotEmpty(packages)
    return;
  })
})