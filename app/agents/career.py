"""
Cognova Voice — Agent 7: Career Readiness Agent
Maintains industry skill matrix, evaluates employability readiness score (0-100%),
detects skill gaps, and formulates step-by-step career acceleration roadmaps.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.models import CareerProfile, CareerSkill, TopicPerformance, AgentActivity

class CareerAgent:
    name: str = "Career Readiness Agent"

    # Standard competency benchmarks
    CAREER_BENCHMARKS = {
        "Data Scientist": {
            "Python": 85.0,
            "Statistics & Probability": 80.0,
            "Machine Learning": 80.0,
            "SQL": 75.0,
            "Data Visualization": 70.0,
            "GenAI & Agents": 70.0
        },
        "AI Engineer": {
            "Python": 90.0,
            "Deep Learning & PyTorch": 85.0,
            "GenAI & Agents": 85.0,
            "Vector Databases & RAG": 80.0,
            "API Architecture": 75.0
        }
    }

    def recalculate_readiness(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Calculates current readiness score by synthesizing topic performances with career benchmark."""
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()
        if not profile:
            profile = CareerProfile(
                user_id=user_id,
                target_career="Data Scientist",
                readiness_percentage=68.0,
                identified_gaps=[],
                recommended_roadmap=[]
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # Fetch active skills
        skills = db.query(CareerSkill).filter(CareerSkill.career_profile_id == profile.id).all()
        if not skills:
            # Seed default skills for target career
            benchmark = self.CAREER_BENCHMARKS.get(profile.target_career, self.CAREER_BENCHMARKS["Data Scientist"])
            for sname, target in benchmark.items():
                sk = CareerSkill(career_profile_id=profile.id, skill_name=sname, current_level=55.0, target_level=target)
                db.add(sk)
            db.commit()
            skills = db.query(CareerSkill).filter(CareerSkill.career_profile_id == profile.id).all()

        # Update skill levels based on TopicPerformance if available
        perfs = db.query(TopicPerformance).filter(TopicPerformance.user_id == user_id).all()
        for p in perfs:
            for s in skills:
                if any(term in s.skill_name.lower() for term in p.topic_name.lower().split()):
                    # Blend topic mastery into career skill level
                    s.current_level = round((s.current_level * 0.7) + (p.mastery_percentage * 0.3), 1)

        db.commit()

        # Compute Readiness Score: Average of (current / target) capped at 100%
        ratios = [min(s.current_level / max(s.target_level, 1.0), 1.0) for s in skills]
        new_readiness = round((sum(ratios) / max(len(ratios), 1)) * 100, 1)
        profile.readiness_percentage = new_readiness

        # Identify gaps (where current is more than 20% below target)
        gaps = [s.skill_name for s in skills if s.current_level < (s.target_level - 15.0)]
        profile.identified_gaps = gaps
        profile.last_analyzed = datetime.utcnow()

        db.commit()

        # Log Activity
        db.add(AgentActivity(
            user_id=user_id,
            agent_name=self.name,
            action_type="readiness_computed",
            description=f"Updated '{profile.target_career}' readiness to {new_readiness}%. Priority gap: {gaps[0] if gaps else 'None'}"
        ))
        db.commit()

        return {
            "target_career": profile.target_career,
            "readiness_percentage": profile.readiness_percentage,
            "identified_gaps": profile.identified_gaps,
            "skills": [{"name": s.skill_name, "current": s.current_level, "target": s.target_level} for s in skills],
            "roadmap": profile.recommended_roadmap
        }

career_agent = CareerAgent()
