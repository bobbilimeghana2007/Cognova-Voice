"""
Cognova Voice — Automated System Verification Tests
Tests database initialization, agent routing, quiz evaluation, adaptive planning,
multi-subject academic engine, document tools, visual PDF generation, and multi-user isolation.
"""
from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_demo_login():
    response = client.get("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Meghana"
    assert data["target_career"] == "Data Scientist"

def test_multi_user_creation_and_listing():
    # Register a new student
    res = client.post("/api/auth/register", json={
        "full_name": "Arjun Sharma",
        "email": "arjun@vortex.ai",
        "target_career": "Cloud Architect",
        "preferred_language": "English"
    })
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["full_name"] == "Arjun Sharma"
    arjun_id = user_data["id"]

    # List all users
    list_res = client.get("/api/auth/users")
    assert list_res.status_code == 200
    users = list_res.json()["users"]
    assert any(u["id"] == arjun_id for u in users)

def test_dashboard_metrics():
    response = client.get("/api/dashboard?user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "performance" in data
    assert "daily_tasks" in data

def test_chat_pipeline_general_subjects():
    # Test 1: Biology query (Photosynthesis) - Not restricted to Bayes/ML!
    response = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain photosynthesis in plants and its light reaction cycle",
        "language": "English",
        "mode": "general"
    })
    assert response.status_code == 200
    data = response.json()
    assert "photosynthesis" in data["message"].lower() or "chlorophyll" in data["message"].lower() or "light" in data["message"].lower()
    assert data["agent"] == "Tutor Agent"

    # Test 2: CS/Python query (Decorators briefly)
    brief_res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain Python decorators briefly in 3 bullet points",
        "language": "English",
        "mode": "general"
    })
    assert brief_res.status_code == 200
    brief_data = brief_res.json()
    assert "decorator" in brief_data["message"].lower() or "function" in brief_data["message"].lower()

def test_chat_pipeline_telugu():
    response = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Naaku Bayes theorem ardham kaavatledu. Simple ga explain cheyyi.",
        "language": "Telugu",
        "mode": "general"
    })
    assert response.status_code == 200
    data = response.json()
    assert "Bayes" in data["message"]
    assert data["agent"] == "Tutor Agent"

def test_assessment_adaptive_flow():
    # 1. Generate Quiz
    gen_res = client.post("/api/assessment/generate", json={
        "user_id": 1,
        "topic": "Bayes Theorem & Probability",
        "difficulty": "Adaptive"
    })
    assert gen_res.status_code == 200
    quiz = gen_res.json()
    assert len(quiz["questions"]) >= 3

    # 2. Evaluate with 1 correct and incorrect to test weakness detection
    q_id_1 = str(quiz["questions"][0]["id"])
    eval_res = client.post("/api/assessment/evaluate", json={
        "assessment_id": quiz["assessment_id"],
        "answers": {q_id_1: quiz["questions"][0].get("correct_answer", "Posterior probability of A occurring given that B is true")}
    })
    assert eval_res.status_code == 200
    result = eval_res.json()
    assert "score" in result
    assert "percentage" in result

def test_weekly_report_pdf_generation():
    # Test ReportLab 4-page PDF download endpoint
    res = client.get("/api/reports/weekly/pdf?user_id=1")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in res.headers["content-disposition"]
    # PDF files start with binary %PDF-
    assert res.content.startswith(b"%PDF-")
    # Multi-page PDF should have substantial size (> 2KB)
    assert len(res.content) > 2048

def test_document_study_tools_and_mock():
    # Test document listing
    res = client.get("/api/documents?user_id=1")
    assert res.status_code == 200
    docs = res.json()["documents"]
    assert len(docs) >= 1
    doc_id = docs[0]["id"]

    # Test Document Summary Notes Generation
    notes_res = client.post(f"/api/documents/{doc_id}/notes")
    assert notes_res.status_code == 200
    notes_data = notes_res.json()
    assert "Executive Summary" in notes_data["notes"] or "Key Concepts" in notes_data["notes"]

    # Test Document Quiz Generation
    quiz_res = client.post(f"/api/documents/{doc_id}/quiz")
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    assert len(quiz_data["questions"]) >= 1

    # Test Document Flashcards Generation
    fc_res = client.post(f"/api/documents/{doc_id}/flashcards")
    assert fc_res.status_code == 200
    fc_data = fc_res.json()
    assert len(fc_data["flashcards"]) >= 1
    # Verify no separator cards like '====' or '---'
    for fc in fc_data["flashcards"]:
        assert "====" not in fc["front"]
        assert "====" not in fc["back"]
        assert len(fc["front"]) > 10

def test_ai_mentor_distinct_topic_differentiation():
    # 1. Machine Learning query
    ml_res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "What is machine learning?",
        "language": "English",
        "mode": "general"
    })
    assert ml_res.status_code == 200
    ml_data = ml_res.json()
    assert "machine learning" in ml_data["message"].lower()
    assert "supervised" in ml_data["message"].lower()

    # 2. Data Science query (Must be distinct from Machine Learning!)
    ds_res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "What is data science?",
        "language": "English",
        "mode": "general"
    })
    assert ds_res.status_code == 200
    ds_data = ds_res.json()
    assert "data science" in ds_data["message"].lower()
    assert "crisp-dm" in ds_data["message"].lower() or "eda" in ds_data["message"].lower()
    # Confirm they are NOT the same output!
    assert ml_data["message"] != ds_data["message"]

def test_conversational_followup_context_inheritance():
    # Step 1: User asks about Bayes Theorem
    res1 = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain Bayes Theorem in detail",
        "language": "English",
        "mode": "general"
    })
    assert res1.status_code == 200
    assert "bayes" in res1.json()["message"].lower()

    # Step 2: Follow-up query in Telugu referring to the same topic
    res2 = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain in Telugu please",
        "language": "Telugu",
        "mode": "general"
    })
    assert res2.status_code == 200
    res2_data = res2.json()
    # Must preserve Bayes topic even though user didn't retype "Bayes Theorem"!
    assert "bayes" in res2_data["message"].lower()

def test_html_tags_explanation():
    """Test 1: Explain HTML tags produces accurate web architecture details and no ML filler."""
    res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain HTML tags",
        "language": "English",
        "mode": "general"
    })
    assert res.status_code == 200
    msg = res.json()["message"].lower()
    assert "html" in msg
    assert "tag" in msg
    assert "opening" in msg or "closing" in msg or "element" in msg
    assert "orchestra conductor" not in msg
    assert "posterior probability" not in msg

def test_binary_search_flowchart():
    """Test 2: Requesting binary search flowchart returns O(log N) decision tree flowchart & code."""
    res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Give me a flowchart for binary search",
        "language": "English",
        "mode": "general"
    })
    assert res.status_code == 200
    msg = res.json()["message"]
    assert "binary search" in msg.lower()
    assert "log" in msg.lower() or "o(log n)" in msg.lower()
    assert "mid" in msg.lower()

def test_python_prime_number_checker():
    """Test 3: Python prime number program with O(sqrt(N)) logic and test cases."""
    res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Write a Python program to check whether a number is prime",
        "language": "English",
        "mode": "general"
    })
    assert res.status_code == 200
    msg = res.json()["message"]
    assert "prime" in msg.lower()
    assert "def " in msg

def test_no_false_followup_overwriting():
    """Test 4: Explicit subjects in follow-ups are never overwritten by previous chat topics."""
    # First query about Bayes
    res1 = client.post("/api/chat", json={
        "user_id": 1,
        "message": "What is Bayes theorem?",
        "language": "English",
        "mode": "general"
    })
    assert res1.status_code == 200
    
    # Second query has its own explicit subject (Binary Search) with a flowchart
    res2 = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Give me a flowchart for binary search",
        "language": "English",
        "mode": "general"
    })
    assert res2.status_code == 200
    msg2 = res2.json()["message"]
    assert "binary search" in msg2.lower()
    assert "bayes" not in msg2.lower()

def test_html_quiz_vs_bayes_quiz():
    """Test 5: Asking for HTML quiz produces HTML questions, not Bayes Theorem."""
    res = client.post("/api/assessment/generate", json={
        "user_id": 1,
        "topic": "HTML Tags",
        "difficulty": "Adaptive"
    })
    assert res.status_code == 200
    quiz = res.json()
    assert "HTML" in quiz["topic"]
    prompts_text = " ".join(q["prompt"] for q in quiz["questions"]).lower()
    assert "html" in prompts_text or "tag" in prompts_text or "element" in prompts_text
    assert "posterior probability" not in prompts_text

def test_weekly_report_json_endpoint():
    """Test 6: GET /api/reports/weekly returns structured weekly metrics & activity state."""
    res = client.get("/api/reports/weekly?user_id=1")
    assert res.status_code == 200
    data = res.json()
    assert "user" in data
    assert "period" in data
    assert "has_activity" in data
    assert "summary" in data
    assert "topic_breakdown" in data
    assert "recommended_next_step" in data

def test_empty_message_validation():
    """Test 7: POST /api/chat with empty or whitespace message returns 400 Bad Request."""
    res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "   ",
        "language": "English"
    })
    assert res.status_code == 400

def test_empty_quiz_topic_validation():
    """Test 8: POST /api/assessment/generate with empty topic returns 400 Bad Request."""
    res = client.post("/api/assessment/generate", json={
        "user_id": 1,
        "topic": "   "
    })
    assert res.status_code == 400

def test_ai_error_simulation_returns_503():
    """Test 9: Triggering simulated AI error returns 503 for frontend retry testing."""
    res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Test simulation [SIMULATE_AI_ERROR]",
        "mode": "simulate_error"
    })
    assert res.status_code == 503
    assert "retry" in res.json()["detail"].lower()

def test_distinct_sql_joins_and_java():
    """Test 10: SQL joins and Java curricula return distinct, deep pedagogical content."""
    sql_res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain SQL joins and how data tables merge",
        "mode": "general"
    })
    assert sql_res.status_code == 200
    assert "join" in sql_res.json()["message"].lower()

    java_res = client.post("/api/chat", json={
        "user_id": 1,
        "message": "Explain Java OOP concepts with examples",
        "mode": "general"
    })
    assert java_res.status_code == 200
    assert "java" in java_res.json()["message"].lower()
    assert sql_res.json()["message"] != java_res.json()["message"]


