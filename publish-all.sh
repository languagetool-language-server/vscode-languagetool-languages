#!/bin/bash
for file in *.vsix
do
    echo Publishing: $file
    node_modules/.bin/vsce publish -p $VSCE_TOKEN --packagePath $file
done
