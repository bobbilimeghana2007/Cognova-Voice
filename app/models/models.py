"""
Cognova Voice — Database Relational Models
Comprehensive schema for multi-agent mentor system.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Student")
    preferred_language = Column(String(50), default="English") # English | Telugu | Bilingual
    target_career = Column(String(100), default="Data Scientist")
    study_streak = Column(Integer, default=3)
    xp = Column(Integer, default=240)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    topic_performances = relationship("TopicPerformance", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    career_profile = relationship("CareerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activities = relationship("AgentActivity", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    page_count = Column(Integer, default=1)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    embedding_id = Column(String(255), nullable=True)

    document = relationship("Document", back_populates="chunks")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Study Mentorship Session")
    current_topic = Column(String(100), default="General")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender = Column(String(50), nullable=False) # 'user' | 'agent'
    agent_name = Column(String(100), default="Tutor Agent") # Orchestrator, Tutor, RAG, etc.
    text = Column(Text, nullable=False)
    language = Column(String(50), default="English") # English, Telugu, Mixed
    sources_used = Column(JSON, nullable=True) # list of page/notes citations
    suggested_actions = Column(JSON, nullable=True) # quick action buttons
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard, Adaptive
    total_questions = Column(Integer, default=3)
    score = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    options = Column(JSON, nullable=True) # list of strings for MCQ
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    user_answer = Column(String(255), nullable=True)
    is_correct = Column(Boolean, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")


class TopicPerformance(Base):
    __tablename__ = "topic_performance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), default="Machine Learning")
    topic_name = Column(String(100), nullable=False)
    mastery_percentage = Column(Float, default=50.0)
    total_attempts = Column(Integer, default=1)
    is_weak = Column(Boolean, default=False)
    last_practiced = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="topic_performances")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_title = Column(String(255), default="VORTEX AI Preparation")
    daily_minutes = Column(Integer, default=90)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="study_plans")
    tasks = relationship("StudyTask", back_populates="plan", cascade="all, delete-orphan")


class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("study_plans.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    task_type = Column(String(50), default="learn") # learn, revise, quiz, practice
    duration_minutes = Column(Integer, default=30)
    is_completed = Column(Boolean, default=False)
    added_by_agent = Column(String(100), default="Adaptive Planner Agent")
    reasoning = Column(Text, nullable=True) # Explainable AI note
    scheduled_date = Column(String(50), default="Today")

    plan = relationship("StudyPlan", back_populates="tasks")


class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    target_career = Column(String(100), default="Data Scientist")
    readiness_percentage = Column(Float, default=68.0)
    identified_gaps = Column(JSON, default=list) # e.g. ["SQL", "Statistics", "GenAI"]
    recommended_roadmap = Column(JSON, default=list) # step by step array
    last_analyzed = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="career_profile")
    skills = relationship("CareerSkill", back_populates="career_profile", cascade="all, delete-orphan")


class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_profile_id = Column(Integer, ForeignKey("career_profiles.id"), nullable=False)
    skill_name = Column(String(100), nullable=False) # e.g. "Python", "SQL"
    current_level = Column(Float, default=50.0) # 0 to 100
    target_level = Column(Float, default=85.0)

    career_profile = relationship("CareerProfile", back_populates="skills")


class AgentActivity(Base):
    __tablename__ = "agent_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")
