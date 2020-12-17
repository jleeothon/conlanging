#!/usr/bin/env fish

set inputFile data/word-list.yaml
set t (mktemp)
bin/sort.js < $inputFile > $t
mv $t $inputFile