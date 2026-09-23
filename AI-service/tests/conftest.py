import pytest
from fastapi.testclient import TestClient

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_valid_api_key(monkeypatch):
    monkeypatch.setattr("app.config.settings.AI_SERVICE_API_KEY", "test-api-key")
    return "test-api-key"

@pytest.fixture
def mock_ollama_json(monkeypatch):
    """Mocks ollama.Client.chat to return a specific JSON content."""
    def _make_mock(json_content):
        class MockResponse:
            def __init__(self, content):
                self.resp = {"message": {"content": content}}
            def __getitem__(self, item):
                return self.resp[item]

        def mock_chat(*args, **kwargs):
            return MockResponse(json_content)
            
        monkeypatch.setattr("app.services.llm_service._client.chat", mock_chat)
    return _make_mock
