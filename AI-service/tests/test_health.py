def test_health_check_ollama_mocked(client, monkeypatch):
    # Mock check_ollama_connection to avoid actually hitting the LLM locally during tests
    monkeypatch.setattr(
        "app.routes.health.check_ollama_connection", 
        lambda: {"status": "connected", "model": "qwen2.5:7b", "modelAvailable": True}
    )
    
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ollamaStatus" in data
    assert data["ollamaStatus"]["status"] == "connected"
