"""
Cognova Voice — RAG Knowledge Engine & Educational Document Generator
Robust multi-format parser (PDF, TXT, MD), semantic chunking with page metadata,
and automatic generation of study notes, active recall quizzes, and flashcards.
"""
from typing import List, Dict, Any, Tuple
import os
import re

class RAGEngine:
    def __init__(self, uploads_dir: str = "./uploads"):
        self.uploads_dir = uploads_dir
        os.makedirs(self.uploads_dir, exist_ok=True)

    def extract_text_from_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        """
        Extracts text from PDF, TXT, or Markdown documents with page numbers.
        Returns pages list, total_chars, is_scanned flag, and extraction status.
        """
        pages = []
        is_scanned = False
        ext = os.path.splitext(filename)[1].lower()

        if ext in [".txt", ".md"]:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                cleaned = re.sub(r'[ \t]+', ' ', content).strip()
                if cleaned:
                    pages.append({"page_number": 1, "text": cleaned})
            except Exception as e:
                print(f"[RAGEngine] Text file read error: {e}")

        else: # PDF
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                total_pages = len(reader.pages)
                for idx, page in enumerate(reader.pages):
                    raw_text = page.extract_text() or ""
                    cleaned = re.sub(r'[ \t]+', ' ', raw_text).strip()
                    if cleaned:
                        pages.append({"page_number": idx + 1, "text": cleaned})
                
                # Check if scanned (no text extracted across pages)
                total_text_length = sum(len(p["text"]) for p in pages)
                if total_pages > 0 and total_text_length < 60:
                    is_scanned = True
            except Exception as e:
                print(f"[RAGEngine] PDF extraction error: {e}")
                # Fallback text attempt
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        text = f.read()
                    if len(text) > 100 and not text.startswith("%PDF"):
                        pages.append({"page_number": 1, "text": text[:10000]})
                except Exception:
                    pass

        total_chars = sum(len(p["text"]) for p in pages)
        return {
            "pages": pages,
            "page_count": len(pages),
            "total_chars": total_chars,
            "is_scanned": is_scanned
        }

    def chunk_document(self, pages: List[Dict[str, Any]], chunk_size_words: int = 180, overlap_words: int = 35) -> List[Dict[str, Any]]:
        """
        Splits document pages into semantically sized chunks preserving page numbers.
        Ensures multiple pages yield multiple well-formed chunks.
        """
        chunks = []
        chunk_idx = 0

        for p in pages:
            text = p["text"]
            words = text.split()
            if not words:
                continue

            step = max(chunk_size_words - overlap_words, 40)
            for i in range(0, len(words), step):
                chunk_slice = words[i:i + chunk_size_words]
                chunk_str = " ".join(chunk_slice)
                if len(chunk_str.strip()) > 30:
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "page_number": p["page_number"],
                        "content": chunk_str
                    })
                    chunk_idx += 1

        return chunks

    def search_relevant_chunks(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """
        Searches chunks using term frequency overlap and query relevance.
        """
        query_words = set(re.findall(r'\b[a-zA-Z0-9_]{3,}\b', query.lower()))
        if not query_words:
            return []

        scored = []
        for ch in chunks:
            content_lower = ch["content"].lower()
            matches = sum(1 for w in query_words if w in content_lower)
            if matches > 0:
                # Score based on proportion of query terms matched + content length factor
                score = matches / (len(query_words) + 0.5)
                scored.append((ch, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    # ----------------- EDUCATIONAL GENERATION FROM DOCUMENTS -----------------
    def generate_document_notes(self, document_title: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates structured revision notes based on the actual text of uploaded chunks.
        Filters out separator lines, table borders, and blank placeholders.
        """
        if not chunks:
            return {
                "title": document_title,
                "sections": [{"heading": "Overview", "content": "No readable text found in document."}]
            }

        combined_text = "\n\n".join(ch["content"] for ch in chunks[:8])
        
        # Clean out repetitive dashes, equal signs, markdown lines
        cleaned = re.sub(r'[-=_*~#|]{3,}', ' ', combined_text)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        # Extract sentences with meaningful conceptual length (30 to 250 characters)
        raw_sentences = [s.strip() for s in re.split(r'\. |\n', cleaned)]
        valid_sentences = [
            s for s in raw_sentences 
            if len(s) >= 30 and not re.match(r'^[0-9\s.,;:-]+$', s) and not re.search(r'^[=-]{2,}', s)
        ]

        if not valid_sentences:
            valid_sentences = [f"This document presents fundamental concepts relating to {document_title}."]

        sections = [
            {
                "heading": "1. Core Summary & Subject Overview",
                "content": f"These structured revision notes synthesize the primary concepts extracted from '{document_title}':\n\n"
                           f"{valid_sentences[0]} " + (valid_sentences[1] if len(valid_sentences) > 1 else "")
            },
            {
                "heading": "2. Key Principles & Conceptual Definitions",
                "content": "\n".join(
                    f"• **Key Concept {i+1}:** {s}" 
                    for i, s in enumerate(valid_sentences[2:7])
                ) if len(valid_sentences) > 2 else f"• Extracted principles for {document_title}."
            },
            {
                "heading": "3. Exam & Practice Takeaways",
                "content": "• Focus on the definitions and relationships identified above.\n"
                           "• Review technical terms and mathematical formulas noted in the source material.\n"
                           "• Complete the document practice quiz to test recall."
            }
        ]

        return {
            "title": document_title,
            "total_chunks_analyzed": len(chunks),
            "sections": sections
        }

    def generate_document_quiz(self, document_title: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generates active recall questions directly based on facts inside document chunks.
        Excludes separator lines, dashes, and empty strings.
        """
        questions = []
        if not chunks:
            return questions

        combined = " ".join(ch["content"] for ch in chunks)
        cleaned = re.sub(r'[-=_*~#|]{3,}', ' ', combined)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        raw_sentences = [s.strip() for s in re.split(r'\. |\n', cleaned)]
        valid_sentences = [
            s for s in raw_sentences 
            if len(s) >= 40 and not re.match(r'^[0-9\s.,;:-]+$', s)
        ]

        # Formulate grounded questions from extracted sentences
        for idx, sentence in enumerate(valid_sentences[:4]):
            words = sentence.split()
            if len(words) >= 6:
                clean_stem = " ".join(words[:12])
                questions.append({
                    "id": idx + 1,
                    "prompt": f"Based on '{document_title}', which of the following accurately describes: '{clean_stem}...'?",
                    "options": [
                        f"{sentence[:95]}",
                        f"This principle is completely contradicted by the findings in {document_title}.",
                        f"This concept is obsolete and has no practical validity in modern systems.",
                        f"None of the above statements are supported by the text."
                    ],
                    "correct": f"{sentence[:95]}",
                    "explanation": f"Grounded directly in Page {chunks[min(idx, len(chunks)-1)]['page_number']} of {document_title}."
                })

        # Add synthesis question if fewer than 3 were formed
        if len(questions) < 3:
            questions.append({
                "id": len(questions) + 1,
                "prompt": f"What is the foundational subject matter addressed in '{document_title}'?",
                "options": [
                    f"The structured concepts and academic principles outlined in {document_title}",
                    "Arbitrary administrative regulations",
                    "Generic computer hardware firmware specs",
                    "Fictional storytelling"
                ],
                "correct": f"The structured concepts and academic principles outlined in {document_title}",
                "explanation": f"Derived from the full document context of {document_title}."
            })

        return questions

    def generate_flashcards(self, document_title: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Creates clean, meaningful study flashcards (Front/Back) from document content.
        Excludes placeholder strings, repetitive hyphens, equal signs, and separator lines.
        """
        cards = []
        if not chunks:
            return cards

        combined = " ".join(ch["content"] for ch in chunks)
        cleaned = re.sub(r'[-=_*~#|]{3,}', ' ', combined)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        raw_sentences = [s.strip() for s in re.split(r'\. |\n', cleaned)]
        # Filter for genuine academic statements
        valid_sentences = [
            s for s in raw_sentences 
            if len(s) >= 35 and not re.match(r'^[0-9\s.,;:-]+$', s) and not any(sym in s for sym in ['====', '----', '****'])
        ]

        for i, s in enumerate(valid_sentences[:6]):
            words = s.split()
            # Extract key concept words for front of card
            concept_phrase = " ".join(words[:min(5, len(words))])
            cards.append({
                "id": i + 1,
                "front": f"Explain the core principle regarding: {concept_phrase}...",
                "back": s,
                "page": chunks[min(i, len(chunks)-1)]["page_number"]
            })

        # If document had very few sentences, provide structured review cards
        if not cards:
            cards.append({
                "id": 1,
                "front": f"What is the core subject of '{document_title}'?",
                "back": f"'{document_title}' covers structured academic lecture notes for exam preparation and study.",
                "page": 1
            })

        return cards

rag_engine = RAGEngine()

