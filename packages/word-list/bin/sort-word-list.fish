#!/usr/bin/env fish

set inputFile data/word-list.yaml
set t (mktemp)

bin/sort.ts < $inputFile > $t
or exit 1

mv $t $inputFile
