"""
Cognova Voice — Agent 4: Assessment Agent
Generates adaptive active recall assessments across any academic topic (HTML, ML,
Data Science, Binary Search, Python, SQL, Java, Bayes, DWDM) or directly from
uploaded document chunks.
Evaluates submissions, diagnoses specific misconceptions, and triggers adaptation loop.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime
import re

from app.models.models import Assessment, Question, TopicPerformance, StudyPlan, StudyTask, CareerProfile, AgentActivity, Document, DocumentChunk

class AssessmentAgent:
    name: str = "Assessment Agent"

    def generate_quiz(self, db: Session, user_id: int, topic: str, difficulty: str = "Adaptive") -> Assessment:
        """Generates an adaptive assessment specifically matching the requested topic."""
        if not topic or not topic.strip() or topic.strip().lower() in ["none", "topic", "core academic concept"]:
            raise ValueError("Please specify or select an academic topic for your adaptive quiz.")

        clean_topic_name = topic.strip()
        lower = clean_topic_name.lower()

        # ----------------- 1. Check for Document-Grounded Quiz -----------------
        if "notes" in lower or "document" in lower or "uploaded" in lower:
            doc = None
            if "notes:" in lower:
                search_title = re.sub(r'^notes:\s*', '', clean_topic_name, flags=re.IGNORECASE).strip()
                doc = db.query(Document).filter(Document.user_id == user_id, Document.title.ilike(f"%{search_title}%")).first()
            if not doc:
                doc = db.query(Document).filter(Document.user_id == user_id).first()
            
            if doc:
                chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).all()
                if chunks:
                    from app.rag.engine import rag_engine
                    chunk_list = [{"content": c.content, "page_number": c.page_number} for c in chunks]
                    raw_doc_questions = rag_engine.generate_document_quiz(doc.title, chunk_list)
                    
                    assessment = Assessment(
                        user_id=user_id,
                        topic=f"Notes: {doc.title}",
                        difficulty="Document Grounded",
                        total_questions=len(raw_doc_questions),
                        score=0,
                        percentage=0.0
                    )
                    db.add(assessment)
                    db.commit()
                    db.refresh(assessment)

                    for q in raw_doc_questions:
                        db.add(Question(
                            assessment_id=assessment.id,
                            prompt=q["prompt"],
                            options=q["options"],
                            correct_answer=q["correct"],
                            explanation=q["explanation"]
                        ))
                    db.commit()
                    db.refresh(assessment)
                    return assessment

        # ----------------- 2. Standard Curriculum Assessments -----------------
        assessment = Assessment(
            user_id=user_id,
            topic=clean_topic_name,
            difficulty=difficulty,
            total_questions=3,
            score=0,
            percentage=0.0
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        # A. HTML & Web Technologies (Fix 2 Requirement: HTML quiz must NEVER return Bayes theorem)
        if any(w in lower for w in ["html", "html tag", "html tags", "web tag", "markup", "dom"]):
            q_data = [
                {
                    "prompt": "Which HTML tag represents the top-level, highest importance heading in semantic markup?",
                    "options": ["<h1>", "<h6>", "<heading>", "<header>"],
                    "correct": "<h1>",
                    "explanation": "<h1> defines the primary, largest semantic heading in standard HTML."
                },
                {
                    "prompt": "What is the key defining characteristic of an HTML 'void element' such as <img> or <br>?",
                    "options": [
                        "It has no closing tag and cannot contain child content",
                        "It requires JavaScript to execute",
                        "It must always be placed within the <head> container",
                        "It renders invisible on the screen"
                    ],
                    "correct": "It has no closing tag and cannot contain child content",
                    "explanation": "Void elements like <img>, <br>, <hr>, and <input> are self-closing and prohibit end tags."
                },
                {
                    "prompt": "Which HTML attribute specifies the target destination URL for an anchor (<a>) tag?",
                    "options": ["href", "src", "link", "target"],
                    "correct": "href",
                    "explanation": "The 'href' (Hypertext Reference) attribute indicates the hyperlink's target URL."
                }
            ]

        # B. Binary Search & Algorithms
        elif any(w in lower for w in ["binary search", "binary_search", "bsearch", "divide and conquer"]):
            q_data = [
                {
                    "prompt": "What is the worst-case and average-case time complexity of Binary Search on an array of size N?",
                    "options": ["O(log N)", "O(N)", "O(N log N)", "O(1)"],
                    "correct": "O(log N)",
                    "explanation": "Binary search halves the search space at each step, yielding logarithmic O(log N) time complexity."
                },
                {
                    "prompt": "What essential prerequisite must the input dataset satisfy before executing Binary Search?",
                    "options": [
                        "The elements must be sorted in ascending or descending order",
                        "The array must only contain unique integers",
                        "The array length must be an exact power of 2",
                        "Elements must be stored as a linked list"
                    ],
                    "correct": "The elements must be sorted in ascending or descending order",
                    "explanation": "Binary search relies on the monotonicity of sorted order to determine which half to discard."
                },
                {
                    "prompt": "During Binary Search, if target > arr[mid], how should the search boundaries be adjusted?",
                    "options": [
                        "left = mid + 1 (search the right half)",
                        "right = mid - 1 (search the left half)",
                        "mid = mid / 2",
                        "Terminate search immediately"
                    ],
                    "correct": "left = mid + 1 (search the right half)",
                    "explanation": "Because the array is sorted, if target > arr[mid], the target can only reside in indices greater than mid."
                }
            ]

        # C. Python Programming & Prime Numbers
        elif any(w in lower for w in ["python", "prime", "decorator", "generator"]):
            if "prime" in lower:
                q_data = [
                    {
                        "prompt": "What is the mathematical upper bound for divisors when testing if an integer N is prime?",
                        "options": ["sqrt(N)", "N / 2", "N - 1", "log(N)"],
                        "correct": "sqrt(N)",
                        "explanation": "If N has a factor greater than sqrt(N), its matching factor must be less than sqrt(N), so testing up to sqrt(N) is sufficient."
                    },
                    {
                        "prompt": "Why is the integer 1 mathematically classified as neither prime nor composite?",
                        "options": [
                            "By definition, prime numbers must have exactly two distinct positive divisors (1 and itself)",
                            "Because 1 is an imaginary unit",
                            "Because 1 cannot be divided by 2",
                            "Because 1 is a negative integer"
                        ],
                        "correct": "By definition, prime numbers must have exactly two distinct positive divisors (1 and itself)",
                        "explanation": "Primes require exactly two distinct positive factors; 1 has only one factor (itself)."
                    },
                    {
                        "prompt": "What is the only even prime number in mathematics?",
                        "options": ["2", "0", "4", "There are no even prime numbers"],
                        "correct": "2",
                        "explanation": "2 is the only even prime; every other even number is divisible by 2 and therefore composite."
                    }
                ]
            else:
                q_data = [
                    {
                        "prompt": "What is the primary function of a Python decorator?",
                        "options": [
                            "To modify or extend a function's behavior without altering its source code",
                            "To compile Python script into C binary",
                            "To allocate GPU memory",
                            "To encrypt variables"
                        ],
                        "correct": "To modify or extend a function's behavior without altering its source code",
                        "explanation": "Decorators wrap functions, adding transparent pre- or post-execution logic."
                    },
                    {
                        "prompt": "Which keyword in Python defines a generator function that yields a stream of values lazily?",
                        "options": ["yield", "return", "stream", "defer"],
                        "correct": "yield",
                        "explanation": "'yield' produces values on-the-fly and pauses execution state without allocating full lists in memory."
                    },
                    {
                        "prompt": "What is the average time complexity of looking up a key in a standard Python dictionary?",
                        "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                        "correct": "O(1)",
                        "explanation": "Python dictionaries utilize optimized hash tables, yielding O(1) constant average lookup time."
                    }
                ]

        # D. Machine Learning
        elif any(w in lower for w in ["machine learning", "ml", "supervised learning"]):
            q_data = [
                {
                    "prompt": "In Supervised Machine Learning, what essential data component must be paired with input features (X)?",
                    "options": [
                        "Ground-truth target labels (y)",
                        "Unlabeled clustering centroids",
                        "GPU cluster credentials",
                        "A secret cryptographic key"
                    ],
                    "correct": "Ground-truth target labels (y)",
                    "explanation": "Supervised learning explicitly requires target labels (y) to calculate loss and guide weight updates."
                },
                {
                    "prompt": "What optimization algorithm iteratively adjusts model parameters in the direction of the negative gradient?",
                    "options": ["Gradient Descent", "Binary Search", "Dijkstra's Algorithm", "Apriori Rule"],
                    "correct": "Gradient Descent",
                    "explanation": "Gradient Descent updates parameters theta = theta - alpha * grad(Loss) to reach local/global loss minima."
                },
                {
                    "prompt": "What is the fundamental difference between parameters (W, b) and hyperparameters (alpha)?",
                    "options": [
                        "Parameters are learned during training; hyperparameters are configured before training",
                        "Hyperparameters are learned automatically; parameters are manually guessed",
                        "Parameters only apply to decision trees; hyperparameters only apply to SQL",
                        "There is no difference"
                    ],
                    "correct": "Parameters are learned during training; hyperparameters are configured before training",
                    "explanation": "Parameters (weights, biases) are fitted by optimization; hyperparameters (learning rate, depth) govern the training process."
                }
            ]

        # E. Data Science
        elif any(w in lower for w in ["data science", "eda", "data scientist"]):
            q_data = [
                {
                    "prompt": "What is the primary objective of Exploratory Data Analysis (EDA) in the Data Science lifecycle?",
                    "options": [
                        "To discover distributions, detect anomalies, and test hypotheses before modeling",
                        "To immediately deploy unvalidated models to production",
                        "To delete all rows with missing values without inspection",
                        "To convert all categorical data into random numbers"
                    ],
                    "correct": "To discover distributions, detect anomalies, and test hypotheses before modeling",
                    "explanation": "EDA informs feature engineering by illuminating distribution shapes, outliers, and data discrepancies."
                },
                {
                    "prompt": "Which visualization technique is most effective for displaying numerical quartiles and identifying outliers?",
                    "options": ["Box Plot (Whisker Plot)", "Pie Chart", "Line Chart", "Word Cloud"],
                    "correct": "Box Plot (Whisker Plot)",
                    "explanation": "Box plots display the median, Q1, Q3, and represent points beyond 1.5 * IQR as explicit outliers."
                },
                {
                    "prompt": "In statistical hypothesis testing, what does a p-value less than 0.05 typically indicate?",
                    "options": [
                        "Sufficient statistical evidence to reject the null hypothesis",
                        "The model has exactly 95% training accuracy",
                        "The dataset is invalid and must be discarded",
                        "5% of the data was corrupted"
                    ],
                    "correct": "Sufficient statistical evidence to reject the null hypothesis",
                    "explanation": "A p-value < 0.05 signifies that the observed phenomenon has less than 5% probability under the null hypothesis."
                }
            ]

        # F. SQL & Relational Databases
        elif any(w in lower for w in ["sql", "join", "joins", "database", "dbms", "rdbms"]):
            q_data = [
                {
                    "prompt": "Which SQL JOIN retains all rows from the left table and inserts NULL for unmatched rows from the right table?",
                    "options": ["LEFT JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT JOIN"],
                    "correct": "LEFT JOIN",
                    "explanation": "LEFT JOIN preserves every record from the left table regardless of right-side matches."
                },
                {
                    "prompt": "What index structure is most widely implemented in relational databases to support O(log N) lookups?",
                    "options": ["B-Tree Index", "Linked List", "Bloom Filter", "FIFO Queue"],
                    "correct": "B-Tree Index",
                    "explanation": "Balanced B-Trees maintain sorted order and support search, sequential access, insertions, and deletions in logarithmic time."
                },
                {
                    "prompt": "What does the 'I' in the ACID transaction guarantees stand for?",
                    "options": ["Isolation", "Integrity", "Indexing", "Iteration"],
                    "correct": "Isolation",
                    "explanation": "Isolation guarantees that concurrent database transactions execute without uncommitted interference."
                }
            ]

        # G. Java Programming
        elif any(w in lower for w in ["java", "palindrome", "jvm", "jre"]):
            q_data = [
                {
                    "prompt": "What intermediate format does the Java Compiler (javac) generate from .java source code?",
                    "options": ["Bytecode (.class files)", "Machine Binary (.exe)", "Assembly Code (.asm)", "Python Bytecode"],
                    "correct": "Bytecode (.class files)",
                    "explanation": "Java compiles to platform-independent bytecode (.class), which is executed by the Java Virtual Machine (JVM)."
                },
                {
                    "prompt": "What is the optimal time complexity of verifying if a string of length N is a Palindrome using two pointers?",
                    "options": ["O(N)", "O(N^2)", "O(log N)", "O(2^N)"],
                    "correct": "O(N)",
                    "explanation": "Two pointers moving inward compare pairs in N/2 operations, giving linear O(N) time with O(1) space."
                },
                {
                    "prompt": "Which keyword in Java prevents a class from being subclassed or inherited?",
                    "options": ["final", "static", "private", "sealed"],
                    "correct": "final",
                    "explanation": "Marking a class 'final' prevents inheritance; on a variable, it prevents reassignment."
                }
            ]

        # H. Bayes' Theorem & Probability
        elif any(w in lower for w in ["bayes", "naive bayes", "conditional probability"]):
            q_data = [
                {
                    "prompt": "In Bayes' Theorem P(A|B) = [P(B|A) * P(A)] / P(B), what is P(A|B) called?",
                    "options": [
                        "Posterior Probability",
                        "Prior Probability",
                        "Likelihood Ratio",
                        "Marginal Evidence"
                    ],
                    "correct": "Posterior Probability",
                    "explanation": "P(A|B) is the posterior probability: the updated belief in hypothesis A after observing evidence B."
                },
                {
                    "prompt": "If a rare medical condition affects 1 in 10,000 people and a test is 99% accurate, why is a positive result not 99% certain?",
                    "options": [
                        "Because false positives from the large healthy population outnumber true positives from the small sick population",
                        "Because medical tests cannot use percentages",
                        "Because Bayes' Theorem only applies to coins and dice",
                        "Because likelihood must always be zero"
                    ],
                    "correct": "Because false positives from the large healthy population outnumber true positives from the small sick population",
                    "explanation": "When base prevalence (prior) is extremely small, even a 1% false positive rate produces more false alarms than real detections."
                },
                {
                    "prompt": "What 'naive' mathematical assumption empowers the Naive Bayes text classifier?",
                    "options": [
                        "Strong conditional independence between all input features given the class",
                        "All words have identical frequencies",
                        "Data must follow a uniform distribution",
                        "Emails must contain at least 10 words"
                    ],
                    "correct": "Strong conditional independence between all input features given the class",
                    "explanation": "Naive Bayes assumes all feature attributes conditionally independent given the target label."
                }
            ]

        # I. Dynamic Subject Quiz (For any other subject)
        else:
            clean_name = clean_topic_name.title()
            q_data = [
                {
                    "prompt": f"Which of the following represents the core academic foundation and primary operational role of {clean_name}?",
                    "options": [
                        f"A systematic technical framework used to model, analyze, and optimize solutions in {clean_name}",
                        "An obsolete procedure with no practical modern relevance",
                        "A randomized estimation technique without mathematical foundation",
                        "An administrative standard restricted solely to internal compliance"
                    ],
                    "correct": f"A systematic technical framework used to model, analyze, and optimize solutions in {clean_name}",
                    "explanation": f"Core academic definition and primary function of {clean_name}."
                },
                {
                    "prompt": f"When implementing {clean_name} in practical problem-solving, what critical step ensures reliable outcomes?",
                    "options": [
                        "Verifying boundary constraints, baseline assumptions, and testing edge cases",
                        "Ignoring baseline data and extrapolating without validation",
                        "Assuming zero variance across all dynamic environmental conditions",
                        "Relying solely on arbitrary heuristic guesses"
                    ],
                    "correct": "Verifying boundary constraints, baseline assumptions, and testing edge cases",
                    "explanation": f"Rigorous validation and constraint verification are essential when implementing {clean_name}."
                },
                {
                    "prompt": f"What is a primary advantage of achieving mastery in {clean_name} for engineering and career readiness?",
                    "options": [
                        "Enables structured problem-solving, theoretical clarity, and practical employability",
                        "Eliminates the need for critical thinking or algorithmic analysis",
                        "Guarantees 100% certainty in non-deterministic environments",
                        "Permanently replaces all other analytical methods"
                    ],
                    "correct": "Enables structured problem-solving, theoretical clarity, and practical employability",
                    "explanation": f"Mastery of {clean_name} equips students with systematic problem-solving capability."
                }
            ]

        for q in q_data:
            db.add(Question(
                assessment_id=assessment.id,
                prompt=q["prompt"],
                options=q["options"],
                correct_answer=q["correct"],
                explanation=q["explanation"]
            ))

        db.commit()
        db.refresh(assessment)
        return assessment

    def evaluate_quiz(self, db: Session, assessment_id: int, user_answers: Dict[str, str]) -> Dict[str, Any]:
        """Evaluates student submission, calculates score, and triggers multi-agent adaptation loop."""
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError("Assessment not found")

        correct_count = 0
        total = len(assessment.questions)
        mistakes = []

        for q in assessment.questions:
            student_ans = user_answers.get(str(q.id), "").strip()
            q.user_answer = student_ans
            is_correct = (student_ans.lower() == q.correct_answer.lower())
            q.is_correct = is_correct

            if is_correct:
                correct_count += 1
            else:
                mistakes.append({
                    "question": q.prompt,
                    "student_answer": student_ans or "Skipped",
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation
                })

        percentage = round((correct_count / max(total, 1)) * 100, 1)
        assessment.score = correct_count
        assessment.percentage = percentage
        db.commit()

        # Log Assessment Activity
        db.add(AgentActivity(
            user_id=assessment.user_id,
            agent_name=self.name,
            action_type="evaluation_completed",
            description=f"Evaluated assessment for '{assessment.topic}': {correct_count}/{total} ({percentage}%)"
        ))

        # TRIGGER AGENT 5: Performance Agent (Recalculate Mastery)
        from app.agents.performance import performance_agent
        perf_result = performance_agent.update_mastery(db, assessment.user_id, assessment.topic, percentage)

        # TRIGGER AGENT 6: Adaptive Planner Agent (If low score, auto-schedule revision!)
        planner_action = None
        if percentage < 65.0:
            from app.agents.planner import planner_agent
            planner_action = planner_agent.add_adaptive_revision_task(
                db, assessment.user_id, assessment.topic,
                reason=f"Scored {percentage}% on recent quiz. 20-min targeted review recommended."
            )

        # TRIGGER AGENT 7: Career Readiness Agent (Update career readiness score)
        from app.agents.career import career_agent
        career_update = career_agent.recalculate_readiness(db, assessment.user_id)

        db.commit()

        return {
            "score": correct_count,
            "total": total,
            "percentage": percentage,
            "mistakes": mistakes,
            "performance_update": perf_result,
            "adaptive_task_scheduled": planner_action,
            "career_readiness_percentage": career_update.get("readiness_percentage")
        }

assessment_agent = AssessmentAgent()
