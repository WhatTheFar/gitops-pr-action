#!/bin/bash

RESET=`tput sgr0`
GREEN=`tput setaf 34`
BLUE=`tput setaf 32`

tag=$1

echo -e "$BLUE--- Delete a local Git tag $file ---$RESET"
git tag -d $tag
echo
echo -e "$BLUE--- Delete a remote Git tag $file ---$RESET"
git push --delete origin $tag

echo
echo -e "$BLUE--- Create a new local tag ---$RESET"
git tag $tag
echo
echo -e "$BLUE--- Push the tag to remote ---$RESET"
git push origin $tag
