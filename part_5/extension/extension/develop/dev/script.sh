#!/bin/bash

rm -r ../../build/*
mkdir ../../build/config/
mkdir ../../build/panel/
mkdir ../../build/assets/

cp -r assets/* ../../build/assets/

uglifycss  \
    common/reset.css \
    config/style.css \
    > ../../build/config/config.min.css

uglifyjs \
    config/config.js \
    > ../../build/config/config.min.js

cp config/*html ../../build/config/.

# panel
uglifycss  \
    panel/style.css \
    > ../../build/panel/panel.min.css

uglifyjs \
    panel/script.js \
    > ../../build/panel/panel.min.js

cp panel/*html ../../build/panel/.
