#!/bin/bash
until $(curl -s --head http://example.com:8000 | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null); do
    printf '.'; sleep 1
done
