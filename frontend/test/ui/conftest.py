import pytest

from foxpuppet import FoxPuppet


@pytest.fixture
def foxpuppet(selenium):
    return FoxPuppet(selenium)


@pytest.fixture
def capabilities(capabilities):
    capabilities['marionette'] = True
    capabilities['acceptInsecureCerts'] = True
    capabilities['platform'] = 'Windows 10'
    capabilities['version'] = 'dev'
    return capabilities


@pytest.fixture
def firefox_profile(firefox_profile):
    firefox_profile.set_preference(
        'extensions.install.requireBuiltInCerts', 'false')
    firefox_profile.set_preference('xpinstall.signatures.required', 'false')
    firefox_profile.set_preference('extensions.webapi.testing', 'true')
    firefox_profile.set_preference('testpilot.env', 'local')
    return firefox_profile
