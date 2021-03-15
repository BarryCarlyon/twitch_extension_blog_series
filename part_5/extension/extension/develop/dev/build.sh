#!/bin/bash

rm -r ../../release/*
mkdir ../../release/panel/
mkdir ../../release/config/
mkdir ../../release/assets/

cp -r assets/* ../../release/assets/

# config
uglifycss  \
    common/reset.css \
    config/style.css \
    > ../../build/config/config.min.css

uglifyjs \
    config/config.js \
    > ../../release/config/config.min.js

cp config/*html ../../release/config/.

# panel
uglifycss  \
    panel/style.css \
    > ../../release/panel/panel.min.css

uglifyjs \
    --compress drop_console=true \
    panel/ui.js \
    panel/player.js \
    panel/run.js \
    > ../../release/panel/panel.min.js

cp panel/*html ../../release/panel/.

cd ../../release/
zip -r assets.zip *
