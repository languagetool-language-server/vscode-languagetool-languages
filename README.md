# Language Support Packages for vscode-languagetool

Code for generating Visual Studio Code extension packages for every LanguageTool Language.  For use with [LanguageTool for Visual Studio Code](https://github.com/adamvoss/vscode-languagetool).

# Tests

Run:

```
npm install
./gradlew -p test/resources installDist # Helps prevent timeout
npm test
```

# Usage

Run:
```sh
npm install
npm start
```

# Version changes

Currently version information both of these packages and dependencies are stored more places than they should.  To update a version, do a text search to find the values to change.

# Requirements

Node.js v8.0 or newer is required