"""
Cognova Voice — Agent 6: Adaptive Planner Agent
Dynamically creates and alters study tasks based on real-time performance feedback,
weak-topic signals, and upcoming deadlines with explainable AI reasoning.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.models import StudyPlan, StudyTask, AgentActivity

class PlannerAgent:
    name: str = "Adaptive Planner Agent"

    def add_adaptive_revision_task(self, db: Session, user_id: int, topic: str, reason: str) -> Dict[str, Any]:
        """Automatically injects an urgent targeted revision session into the active plan."""
        plan = db.query(StudyPlan).filter(StudyPlan.user_id == user_id, StudyPlan.is_active == True).first()
        if not plan:
            plan = StudyPlan(user_id=user_id, goal_title="Personalized AI Study Path", daily_minutes=90)
            db.add(plan)
            db.commit()
            db.refresh(plan)

        # Check if task already exists for this topic to prevent duplicates
        existing = db.query(StudyTask).filter(
            StudyTask.plan_id == plan.id,
            StudyTask.topic == topic,
            StudyTask.is_completed == False
        ).first()

        if existing:
            existing.reasoning = f"Priority elevated: {reason}"
            db.commit()
            return {"task_id": existing.id, "title": existing.title, "action": "updated_priority"}

        task = StudyTask(
            plan_id=plan.id,
            topic=topic,
            title=f"20-min Targeted Revision: {topic}",
            task_type="revise",
            duration_minutes=20,
            is_completed=False,
            added_by_agent=self.name,
            reasoning=f"Explainable AI: {reason}",
            scheduled_date="Today"
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        # Log Activity
        db.add(AgentActivity(
            user_id=user_id,
            agent_name=self.name,
            action_type="plan_adapted",
            description=f"Auto-injected 20-min revision for '{topic}' into daily schedule"
        ))
        db.commit()

        return {
            "task_id": task.id,
            "title": task.title,
            "duration": task.duration_minutes,
            "reasoning": task.reasoning,
            "action": "task_injected"
        }

    def toggle_task(self, db: Session, task_id: int) -> StudyTask:
        task = db.query(StudyTask).filter(StudyTask.id == task_id).first()
        if not task:
            raise ValueError("Task not found")

        task.is_completed = not task.is_completed
        db.commit()
        db.refresh(task)
        return task

planner_agent = PlannerAgent()
