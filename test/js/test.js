"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const util = require('util');

const app = require('../../src/js/app.js');
const execute = app.execute;

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
//     const output = await app.gradle('--version');
//     return assert.match(output, /Gradle \d+.\d+/);
//   })
// })

describe('gradle_firstLevelDependencies', function () {
  it('should contain items matching expected pattern', async function () {
    const packages = await app.gradle_firstLevelDependencies()
    packages.forEach(function (element) {
      assert.match(element, /^org.languagetool:language-(.*):3.\d+$/)
    }, this);
    assert.isNotEmpty(packages)
    return;
  })
})

describe('templateReplace', function () {
  it('should replace the found string', function () {
    assert.equal(app.templateReplace('package', 'com.whatever', "compile '${package}'"), "compile 'com.whatever'"
    )
  })
})

describe('writeGradleBuild', function () {
  it('should write the file correctly', async function () {
      const fs = require('fs');

      await app.writeGradleBuild('com.whatever')

      assert((await util.promisify(fs.stat)('./build.gradle')).isFile(), 'file should exist')

      assert.match(await util.promisify(fs.readFile)('./build.gradle'), /com\.whatever/)

      return util.promisify(fs.unlink)('./build.gradle')
  })

    it('should overwrite existing files', async function () {
      const fs = require('fs');

      await app.writeGradleBuild('com.whatever')
      await app.writeGradleBuild('completely.different')
      assert.match(await util.promisify(fs.readFile)('./build.gradle'), /completely\.different/)

      return util.promisify(fs.unlink)('./build.gradle')
  })
})