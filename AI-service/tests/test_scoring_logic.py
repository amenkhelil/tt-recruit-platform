from app.services.matching import compute_skill_score, compute_experience_score

def test_calculate_skill_score():
    # 2 out of 4 skills matched = 50%
    score, matched, missing = compute_skill_score(
        required_skills=["Python", "Docker", "Kubernetes", "AWS"],
        candidate_skills={"python", "fastapi", "docker"}
    )
    assert score == 50.0
    assert set(matched) == {"Python", "Docker"}
    assert set(missing) == {"Kubernetes", "AWS"}
    
    # Empty required skills
    score, matched, missing = compute_skill_score([], {"python"})
    assert score == 100.0

def test_calculate_experience_score():
    # More than required
    assert compute_experience_score(5, 3) == 100.0
    # Exactly required
    assert compute_experience_score(3, 3) == 100.0
    # Less than required (2.5 out of 5 = 50%)
    assert compute_experience_score(2.5, 5) == 50.0
    # No experience required
    assert compute_experience_score(2, 0) == 100.0
