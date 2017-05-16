#!/bin/bash
set -ex

pip install tox mozdownload mozinstall

mozdownload --version latest --destination firefox.tar.bz2
mozinstall firefox.tar.bz2
wget -O geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v0.16.1/geckodriver-v0.16.1-linux64.tar.gz
gunzip -c geckodriver.tar.gz | tar xopf -
chmod +x geckodriver
sudo mv geckodriver /home/ubuntu/bin

firefox/firefox --version
geckodriver --version
