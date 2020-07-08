#!/usr/bin/env bash

# In Ubuntu, this would be used
# inotifywait -m -e modify -e create --format '%w' src/**/index.tex
set -euxo pipefail
inotifywait -m -e modify -e create --format '%w' /src/**/*.tex | while read -r file
do
    indexfile=$(dirname "$file")/index.tex
    if ! test -f "$indexfile"
    then
        echo "WARNING $indexfile does not exist"
        continue
    fi

    outdir=/out
    dir=$(dirname "$file")
    jobname=$(basename "$dir")
    (
        cd "$dir"
        echo "Working directory: $dir"
        xelatex -interaction=nonstopmode -jobname="$jobname" -output-directory="$outdir" "$indexfile"
    )
done
