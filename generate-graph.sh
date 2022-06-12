cd contracts;
for filename in *.sol; do
    [ -e "$filename" ] || continue
    npx solgraph $filename > "../graph/$filename.dot"
done

cd ../graph;
find . -maxdepth 1 -type f -empty -print -delete;
