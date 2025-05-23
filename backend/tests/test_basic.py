"""Tests de base pour vérifier que l'environnement de test fonctionne."""

import pytest


def test_basic_assert():
    """Test basique pour vérifier que pytest fonctionne."""
    assert True


def test_basic_math():
    """Test mathématique simple."""
    assert 2 + 2 == 4


def test_string_operations():
    """Test des opérations sur les chaînes."""
    test_string = "Hello World"
    assert test_string.lower() == "hello world"
    assert len(test_string) == 11


@pytest.mark.asyncio
async def test_async_basic():
    """Test async basique."""
    async def async_function():
        return "success"
    
    result = await async_function()
    assert result == "success" 