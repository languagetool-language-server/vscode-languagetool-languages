# Language Support Packages for vscode-languagetool - ARCHIVED

## Project Archival

[Adam Voss](https://github.com/adamvoss), originator of this project, passed away on July 11, 2018. I ([David Day](https://github.com/davidlday)) inherited his [languagetool-language-server](https://github.com/languagetool-language-server) projects. I didn't know Adam at all, and I spent about a year trying to figure out what to do with this gift. I've ultimately decided to archive the LanguageTool Extension and related repositories. This extension will no longer be maintained, and will likely be removed from the [Extension Marketplace](https://marketplace.visualstudio.com/). However, I am still pursuing the idea of contributing Adam's server-side LSP code back to the [LangugeTool](https://github.com/languagetool-org/languagetool) project.

Here are some alternative extensions:

1. [LT<sub>E</sub>X](https://github.com/valentjn/vscode-ltex), which is a fork of @adamvoss original work by @valentjn and thus is preserving his code and memory, which was the most important thing that kept me hanging on to these projects.
1. [LanguageTool Linter](), which is a new extension I've authored based on the [Atom Linter LanguageTool]() extension.
1. [languagetool](https://marketplace.visualstudio.com/items?itemName=raymondcamden.languagetool), which I know nothing about.

Good luck, and Peace.

RIP Adam Voss, July 11, 2018.

## Original README

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
