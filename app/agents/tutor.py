"""
Cognova Voice — Agent 2: Tutor Agent
Personalized pedagogical engine supporting Beginner, Intermediate, and Advanced tiers,
analogies, step-by-step breakdowns, diagrams, and bilingual English + Telugu explanations.
"""
from typing import Tuple, List
from app.services.llm import llm_service

class TutorAgent:
    name: str = "Tutor Agent"

    async def explain(
        self,
        prompt: str,
        topic: str,
        context: str = "",
        language: str = "English",
        mode: str = "combined"
    ) -> Tuple[str, List[str]]:
        system_prompt = (
            "You are the Cognova Voice Tutor Agent, an encouraging and expert AI educator. "
            "Explain concepts intuitively using clear structure, bullet points, real-world analogies, "
            "and visual process flowcharts. Adapt explanation to the user's explicit request. "
            "Never hallucinate. Ground your answer in provided context if available."
        )

        response = await llm_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            context=context,
            language=language,
            mode=mode
        )

        clean_topic = topic.split('&')[0].strip() if topic else "This Concept"
        suggested_actions = [
            f"Quiz me on {clean_topic}",
            "Explain with a Real-World Example",
            "Show a Step-by-Step Flowchart",
            "Explain in Telugu"
        ]

        return response, suggested_actions

tutor_agent = TutorAgent()
