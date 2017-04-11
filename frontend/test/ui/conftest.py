import pytest

from foxpuppet import FoxPuppet


@pytest.fixture
def foxpuppet(selenium):
    return FoxPuppet(selenium)


@pytest.fixture
def capabilities(capabilities):
    capabilities['marionette'] = True
