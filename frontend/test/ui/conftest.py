import pytest

from foxpuppet import FoxPuppet


@pytest.fixture
def foxpuppet(selenium):
    return FoxPuppet(selenium)


@pytest.fixture
def capabilities(capabilities):
    capabilities['marionette'] = True
    capabilities['acceptInsecureCerts'] = True
    return capabilities


@pytest.fixture
def firefox_profile(firefox_profile):
    firefox_profile.set_preference(
        'extensions.install.requireBuiltInCerts', 'false')
    firefox_profile.set_preference('xpinstall.signatures.required', 'false')
    firefox_profile.set_preference('extensions.webapi.testing', 'false')
    firefox_profile.set_preference('testpilot.dev', 'local')
    return firefox_profile
