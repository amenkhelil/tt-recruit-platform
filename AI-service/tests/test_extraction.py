import json
from io import BytesIO

def test_extract_resume_unauthorized(client):
    response = client.post("/api/v1/resume/extract", files={"file": ("test.pdf", b"test", "application/pdf")})
    assert response.status_code == 401

def test_extract_resume_unsupported_type(client, mock_valid_api_key):
    response = client.post(
        "/api/v1/resume/extract",
        headers={"X-API-Key": mock_valid_api_key},
        files={"file": ("test.txt", b"test content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_extract_resume_success(client, mock_valid_api_key, mock_ollama_json, monkeypatch):
    # Mock text extraction from file
    monkeypatch.setattr("app.services.extraction.extract_raw_text", lambda b, c: "mock resume text with sufficient length for the validation check to pass")
    
    expected_response = {
        "skills": ["Python", "FastAPI"],
        "experiences": [],
        "education": [],
        "certifications": [],
        "languages": [],
        "yearsOfExperience": 2
    }
    
    # Mock LLM to return valid JSON
    mock_ollama_json(json.dumps(expected_response))
    
    response = client.post(
        "/api/v1/resume/extract",
        headers={"X-API-Key": mock_valid_api_key},
        files={"file": ("test.pdf", b"mock pdf content", "application/pdf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["rawText"] == "mock resume text with sufficient length for the validation check to pass"
    assert "Python" in data["skills"]
    assert data["yearsOfExperience"] == 2
