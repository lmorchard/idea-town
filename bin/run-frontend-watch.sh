#!/bin/sh

# Remove host-side node_modules, just in case. If present, it will override
# /root/node_modules and cause various unpleasantries
rm -rf /app/node_modules

# Be very specific about starting up a gulp process that uses modules from
# /root/node_modules and restarts whenever gulpfile.js is changed
while [ 1 ]; do
    NODE_PATH=/root/node_modules/ NODE_ENV=development /root/node_modules/gulp/bin/gulp.js django-default
    sleep 3
done
