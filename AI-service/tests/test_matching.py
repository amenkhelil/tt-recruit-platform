import json

def test_matching_unauthorized(client):
    response = client.post("/api/v1/matching/score", json={})
    assert response.status_code == 401

def test_matching_success(client, mock_valid_api_key, mock_ollama_json):
    request_data = {
        "resumeText": "Mock resume text",
        "resumeSkills": ["Python", "FastAPI"],
        "resumeYearsExperience": 2.5,
        "jobText": "Mock job text",
        "requiredSkills": ["Python", "Docker"],
        "experienceYearsMin": 2
    }
    
    expected_llm_response = {
        "semanticScore": 85,
        "contextMatchedSkills": ["Python", "Docker"],
        "reasoning": "Good match"
    }
    mock_ollama_json(json.dumps(expected_llm_response))
    
    response = client.post(
        "/api/v1/matching/score",
        headers={"X-API-Key": mock_valid_api_key},
        json=request_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["semanticScore"] == 85
    assert "Python" in data["matchedSkills"]
    assert "Docker" in data["matchedSkills"]
