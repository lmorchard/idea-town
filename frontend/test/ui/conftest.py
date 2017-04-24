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
def firefox_options(firefox_options):
    firefox_options.set_preference(
        'extensions.install.requireBuiltInCerts', False)
    firefox_options.set_preference('xpinstall.signatures.required', False)
    firefox_options.set_preference('extensions.webapi.testing', True)
    return firefox_options
