#!/usr/bin/env fish

set SCRIPT "process.stdin.on('data', (chunk) => { process.stdout.write(chunk.toString().normalize()) })"

git ls-files -- '*.adoc' '*.yaml' | while read FILE
    echo $FILE
    set T (mktemp)
    node -e $SCRIPT < $FILE > $T
    cat $T > $FILE
    rm $T
end
