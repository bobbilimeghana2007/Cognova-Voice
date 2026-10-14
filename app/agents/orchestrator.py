"""
Cognova Voice — Agent 1: Orchestrator Agent
The central hub: understands student intent across any academic domain, extracts language,
routes to specialized agents, manages document context, and logs all multi-agent activities.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import re

from app.models.models import User, Message, Conversation, Document, DocumentChunk, AgentActivity, TopicPerformance
from app.services.llm import llm_service
from app.rag.engine import rag_engine

class OrchestratorAgent:
    name: str = "Orchestrator Agent"

    def log_activity(self, db: Session, user_id: int, agent_name: str, action_type: str, description: str):
        """Records agent action to the database for live UI timeline streaming."""
        activity = AgentActivity(
            user_id=user_id,
            agent_name=agent_name,
            action_type=action_type,
            description=description
        )
        db.add(activity)
        db.commit()

    def detect_intent(self, user_text: str, default_language: str = "English") -> Dict[str, Any]:
        """Classifies student query into intent, target topic, and language dynamically."""
        text = user_text.lower().strip()
        
        # 1. Language detection (English, Telugu, Mixed)
        telugu_keywords = ["naaku", "ardham", "cheyyi", "cheppu", "ivvu", "enti", "ela", "telugu", "undo", "prashna", "telugu lo"]
        is_telugu = (default_language.lower() == "telugu") or any(k in text for k in telugu_keywords)
        language = "Telugu" if is_telugu else ("Bilingual" if "bilingual" in default_language.lower() else "English")

        # 2. Dynamic Topic Extraction
        topic = "Core Academic Concept"

        # Explicit Subject Detection (highest priority)
        if any(w in text for w in ["binary search", "binary_search", "bsearch"]):
            topic = "Binary Search"
        elif any(w in text for w in ["prime", "prime number", "check prime"]):
            topic = "Python Prime Numbers"
        elif any(w in text for w in ["html", "html tags", "html tag", "web tag", "markup", "dom"]):
            topic = "HTML Tags & Web Development"
        elif any(w in text for w in ["machine learning", "what is ml", "what is machine learning", "supervised learning"]):
            topic = "Machine Learning"
        elif any(w in text for w in ["data science", "what is ds", "what is data science", "eda"]):
            topic = "Data Science"
        elif any(w in text for w in ["bayes", "naive bayes", "conditional probability"]):
            topic = "Bayes Theorem & Probability"
        elif any(w in text for w in ["overfit", "underfit", "regulariz", "lasso", "ridge"]):
            topic = "Model Regularization & Overfitting"
        elif any(w in text for w in ["sql", "join", "joins", "query", "rdbms", "database"]):
            topic = "SQL & Relational Databases"
        elif any(w in text for w in ["tree", "forest", "decision tree", "random forest"]):
            topic = "Decision Trees & Random Forests"
        elif any(w in text for w in ["dwdm", "data mining", "data warehouse", "apriori", "star schema"]):
            topic = "Data Warehousing & Data Mining"
        elif any(w in text for w in ["neural", "deep learning", "backprop", "cnn", "rnn"]):
            topic = "Neural Networks & Deep Learning"
        elif any(w in text for w in ["python", "decorator", "generator"]):
            topic = "Python Programming"
        elif any(w in text for w in ["java", "palindrome", "jvm", "jre"]):
            topic = "Java Programming"
        elif any(w in text for w in ["photosynthesis", "cell", "dna", "chlorophyll"]):
            topic = "Biological Sciences"
        elif any(w in text for w in ["calculus", "derivative", "integral"]):
            topic = "Mathematics & Calculus"
        else:
            # Cleanly strip operational query prefixes
            prefix_pattern = (
                r'^(explain|what is|tell me about|how does|define|summarize|give notes on|'
                r'give me a flowchart for|draw a flowchart for|give a flowchart for|give a flowchart of|'
                r'give a diagram for|draw a diagram for|write a python program for|write a program for|'
                r'write a program to|write code for|give a program to|give code for|'
                r'quiz me on|give me a quiz on|test me on|give me questions on)\s+'
            )
            clean_q = re.sub(prefix_pattern, '', user_text, flags=re.IGNORECASE).strip('?. ')
            
            # Check if cleaned query is a genuine substantive subject (not pronouns like 'that', 'it', 'this')
            pronouns = ["that", "it", "this", "them", "again", "in telugu", "briefly", "more simply"]
            if clean_q and clean_q.lower() not in pronouns and len(clean_q.split()) <= 6:
                topic = clean_q.title()

        # 3. Intent Detection
        intent = "learn"
        if any(w in text for w in ["quiz", "test", "exam", "assess", "question", "prashna"]):
            intent = "quiz"
        elif any(w in text for w in ["plan", "schedule", "routine", "tasks", "timetable"]):
            intent = "plan"
        elif any(w in text for w in ["career", "job", "readiness", "roadmap", "skill", "interview"]):
            intent = "career"
        elif any(w in text for w in ["weak", "score", "performance", "mastery", "progress"]):
            intent = "performance"

        return {
            "intent": intent,
            "topic": topic,
            "language": language,
            "raw_text": user_text
        }

    async def run(
        self,
        db: Session,
        user: User,
        conversation_id: int,
        user_text: str,
        mode: str = "combined", # 'my_notes', 'general', 'combined'
        default_language: str = "English"
    ) -> Dict[str, Any]:
        """Main Orchestrator cycle: Understand -> Retrieve -> Route -> Log -> Respond."""
        # 1. Intent Detection
        parsed = self.detect_intent(user_text, default_language=default_language)

        # Check for conversational follow-up (e.g. "explain that in telugu", "in simpler terms", "give an example", "give a flowchart")
        # ONLY trigger follow-up inheritance if the current message does NOT have its own explicit topic
        followup_cues = ["telugu", "english", "simpler", "simple", "example", "brief", "briefly", "detail", "flowchart", "code", "explain more", "cheppu", "ardham", "that", "it", "this", "again"]
        has_cue = any(re.search(r'\b' + re.escape(cue) + r'\b', user_text.lower()) for cue in followup_cues)
        
        is_pure_followup = has_cue and (
            parsed["topic"] == "Core Academic Concept" or
            parsed["topic"].lower() in ["that", "it", "this", "that in telugu", "in telugu", "briefly", "flowchart"] or
            len(user_text.split()) <= 4
        )

        effective_prompt = user_text
        if is_pure_followup:
            prev_msgs = (
                db.query(Message)
                .filter(Message.conversation_id == conversation_id)
                .order_by(Message.id.desc())
                .limit(6)
                .all()
            )
            for pm in prev_msgs:
                # Find the most recent message with substantive topic context
                if pm.sender == "user" and len(pm.text.split()) > 2 and pm.text != user_text:
                    prev_parsed = self.detect_intent(pm.text)
                    if prev_parsed["topic"] != "Core Academic Concept":
                        parsed["topic"] = prev_parsed["topic"]
                        effective_prompt = f"{user_text} regarding {prev_parsed['topic']}"
                        break
                elif pm.sender == "agent" and pm.text:
                    # Extract header title from agent's previous message
                    match = re.search(r'###\s+[^a-zA-Z0-9]*([^\n(—–]+)', pm.text)
                    if match:
                        inferred_topic = match.group(1).strip()
                        if len(inferred_topic) > 3 and "Notice" not in inferred_topic and "Warning" not in inferred_topic:
                            parsed["topic"] = inferred_topic
                            effective_prompt = f"{user_text} regarding {inferred_topic}"
                            break

        self.log_activity(
            db, user.id, self.name, "intent_routing",
            f"Detected {parsed['intent'].upper()} intent for '{parsed['topic']}' in {parsed['language']} ({mode.upper()} mode)"
        )

        # 2. Check for RAG Document Grounding (User-isolated)
        sources_used = []
        retrieved_context = ""
        
        if mode in ["my_notes", "combined"] or "notes" in user_text.lower():
            user_docs = db.query(Document).filter(Document.user_id == user.id).all()
            if user_docs:
                all_chunks = []
                for doc in user_docs:
                    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).all()
                    for ch in chunks:
                        all_chunks.append({
                            "content": ch.content,
                            "page_number": ch.page_number,
                            "title": doc.title
                        })
                if all_chunks:
                    matches = rag_engine.search_relevant_chunks(user_text, all_chunks, top_k=3)
                    if matches:
                        context_pieces = []
                        for match_chunk, score in matches:
                            context_pieces.append(match_chunk["content"])
                            sources_used.append(f"{match_chunk['title']} — Page {match_chunk['page_number']}")
                        retrieved_context = "\n\n".join(context_pieces)
                        self.log_activity(
                            db, user.id, "RAG Knowledge Agent", "retrieval",
                            f"Retrieved {len(sources_used)} grounded excerpt(s) from study notes"
                        )

        # 3. Route to Specialized Agent
        if parsed["intent"] == "quiz":
            from app.agents.assessment import assessment_agent
            assessment = assessment_agent.generate_quiz(db, user.id, parsed["topic"], "Adaptive")
            
            # Formulate friendly quiz prompt in chat
            response_text = (
                f"### 📝 Adaptive Assessment: {assessment.topic}\n\n"
                f"I have configured an active recall quiz with {len(assessment.questions)} adaptive questions on **{assessment.topic}**.\n\n"
            )
            for idx, q in enumerate(assessment.questions):
                response_text += f"**Question {idx + 1}:** {q.prompt}\n"
                for o_idx, opt in enumerate(q.options):
                    letter = chr(65 + o_idx)
                    response_text += f"- **{letter})** {opt}\n"
                response_text += "\n"
            
            response_text += "> 💡 *To submit and get diagnostic score feedback, open the **Assessments** tab or reply with your answers.*"
            suggested_actions = [
                f"Explain {parsed['topic']}",
                f"Show flowchart for {parsed['topic']}",
                f"Explain in Telugu"
            ]
        else:
            # Route to Tutor Agent
            from app.agents.tutor import tutor_agent
            response_text, suggested_actions = await tutor_agent.explain(
                prompt=effective_prompt,
                topic=parsed["topic"],
                context=retrieved_context,
                language=parsed["language"],
                mode=mode
            )

        self.log_activity(
            db, user.id, "Tutor Agent" if parsed["intent"] != "quiz" else "Assessment Agent", "response_generated",
            f"Delivered educational response for '{parsed['topic']}'"
        )

        # 4. Save to Conversation History
        agent_msg = Message(
            conversation_id=conversation_id,
            sender="agent",
            agent_name="Tutor Agent" if parsed["intent"] != "quiz" else "Assessment Agent",
            text=response_text,
            language=parsed["language"],
            sources_used=sources_used if sources_used else None,
            suggested_actions=suggested_actions
        )
        db.add(agent_msg)
        db.commit()
        db.refresh(agent_msg)

        return {
            "agent_name": agent_msg.agent_name,
            "message": response_text,
            "language": parsed["language"],
            "topic": parsed["topic"],
            "sources_used": sources_used,
            "suggested_actions": suggested_actions,
            "mode": mode
        }

orchestrator_agent = OrchestratorAgent()
