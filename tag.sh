#!/bin/bash

RESET=`tput sgr0`
GREEN=`tput setaf 34`
BLUE=`tput setaf 32`

for tag in "$@"; do

    echo -e "$GREEN== TAG: $tag $RESET"

    echo -e "$BLUE--- Delete a local Git tag $tag ---$RESET"
    git tag -d $tag
    echo
    echo -e "$BLUE--- Delete a remote Git tag $tag ---$RESET"
    git push --delete origin $tag

    echo
    echo -e "$BLUE--- Create a new local tag $tag ---$RESET"
    git tag $tag
    echo
    echo -e "$BLUE--- Push the tag to remote $tag ---$RESET"
    git push origin $tag

done
