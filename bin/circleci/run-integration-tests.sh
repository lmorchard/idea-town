#!/bin/bash
set -ex

npm start &
STATIC_SERVER_PID=$!

pip install -rfrontend/test/ui/requirements/requirements.txt
pip install -rfrontend/test/ui/requirements/flake8.txt

# Wait until the server is available...
until $(curl --insecure --output /dev/null --silent --head --fail https://example.com:8000); do
    printf '.'; sleep 1
done

flake8 frontend/test/ui
pytest -v --driver=Firefox --firefox-path=firefox/firefox --html=results.html frontend/test/ui \
    --base-url=https://example.com:8000

kill $STATIC_SERVER_PID
