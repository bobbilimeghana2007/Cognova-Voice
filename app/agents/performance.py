"""
Cognova Voice — Agent 5: Performance Agent
Analyzes topic mastery, tracks decay/retention, identifies weak spots,
and publishes analytics for dashboard visualization.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.models import TopicPerformance, AgentActivity, User

class PerformanceAgent:
    name: str = "Performance Agent"

    def update_mastery(self, db: Session, user_id: int, topic_name: str, quiz_percentage: float) -> Dict[str, Any]:
        """Updates topic mastery score (0-100%) and detects weakness."""
        perf = db.query(TopicPerformance).filter(
            TopicPerformance.user_id == user_id,
            TopicPerformance.topic_name.ilike(f"%{topic_name.split('&')[0].strip()}%")
        ).first()

        if not perf:
            perf = TopicPerformance(
                user_id=user_id,
                subject="Machine Learning",
                topic_name=topic_name,
                mastery_percentage=quiz_percentage,
                total_attempts=1,
                is_weak=(quiz_percentage < 60.0),
                last_practiced=datetime.utcnow()
            )
            db.add(perf)
        else:
            # Weighted update: 60% previous mastery + 40% latest quiz
            new_mastery = round((perf.mastery_percentage * 0.6) + (quiz_percentage * 0.4), 1)
            perf.mastery_percentage = new_mastery
            perf.total_attempts += 1
            perf.is_weak = (new_mastery < 60.0)
            perf.last_practiced = datetime.utcnow()

        db.commit()

        # Award XP to user
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.xp += int(quiz_percentage * 0.5) + 15
            db.commit()

        # Log Activity
        status_label = "CRITICAL WEAKNESS DETECTED" if perf.is_weak else "TOPIC ADVANCING"
        db.add(AgentActivity(
            user_id=user_id,
            agent_name=self.name,
            action_type="mastery_updated",
            description=f"Recalculated '{perf.topic_name}' mastery to {perf.mastery_percentage}% [{status_label}]"
        ))
        db.commit()

        return {
            "topic": perf.topic_name,
            "mastery_percentage": perf.mastery_percentage,
            "is_weak": perf.is_weak,
            "attempts": perf.total_attempts
        }

    def get_dashboard_metrics(self, db: Session, user_id: int) -> Dict[str, Any]:
        perfs = db.query(TopicPerformance).filter(TopicPerformance.user_id == user_id).all()
        weak_topics = [p for p in perfs if p.is_weak]
        strong_topics = [p for p in perfs if p.mastery_percentage >= 75.0]
        avg_mastery = round(sum(p.mastery_percentage for p in perfs) / max(len(perfs), 1), 1)

        return {
            "average_mastery": avg_mastery,
            "total_topics_tracked": len(perfs),
            "weak_topics_count": len(weak_topics),
            "strong_topics_count": len(strong_topics),
            "weak_topics": [{"topic": w.topic_name, "mastery": w.mastery_percentage} for w in weak_topics],
            "all_topics": [{"topic": p.topic_name, "mastery": p.mastery_percentage, "is_weak": p.is_weak} for p in perfs]
        }

performance_agent = PerformanceAgent()
