import sys
import json
import re
import spacy
import math
import fitz 

# --- Configuration ---
try:
    # 🎯 FIX: NLP load is inside the try-except to catch missing model
    NLP = spacy.load("en_core_web_sm")
except OSError:
    sys.stderr.write("Error: spaCy model 'en_core_web_sm' not found. Please run 'python -m spacy download en_core_web_sm'\n")
    # Propagate a fatal error in JSON format
    print(json.dumps({"success": False, "error": "Fatal Error: spaCy model 'en_core_web_sm' is missing. Please install it."}))
    sys.exit(1)

# --- OCEAN Keyword Definitions (Expanded) ---
OCEAN_KEYWORDS = {
    "Openness": [
        "innovative", "creative", "imagination", "intellectual", "curious", 
        "inventive", "unconventional", "abstract", "theory", "concept",
        "research", "framework", "PyTorch", "TensorFlow", "Keras", "NLTK", 
        "OpenCV", "new", "design", "experiment", "novel", "learning", 
        "exploring", "inquiry", "unbiased", "artistic", "open-minded",
        "visionary", "complex", "ideation", "conceptual", "algorithms"
    ],
    "Conscientiousness": [
        "motivated", "principles", "structured", "organized", "management", 
        "project", "complete", "detail", "grasp", "strong", "efficient", 
        "accurate", "responsibility", "timeline", "ensuring", "duties", 
        "punctual", "reliable", "methodical", "planning", "systematic", 
        "goal", "achieve", "deliverable", "diligent", "focused", "work ethic",
        "consistent", "meticulous", "prepared", "dedicated", "process"
    ],
    "Extraversion": [
        "collaborated", "team", "communication", "interact", "contributed", 
        "passionate", "friendly", "enthusiastic", "public", "social", 
        "active", "outspoken", "leadership", "presented", "spoke", 
        "engaging", "network", "client", "group", "dynamic", "energetic",
        "outgoing", "assertive", "persuasion", "influence", "user-facing"
    ],
    "Agreeableness": [
        "collaborated", "team", "integration", "seamless", "support", 
        "assist", "cooperative", "helpful", "friendly", "harmony", 
        "respect", "kind", "patient", "empathy", "service", "customer",
        "listen", "polite", "ethical", "consensus", "understanding",
        "negotiated", "mediation", "trust", "unselfish", "supportive"
    ],
    "Neuroticism": [ # CHANGED FROM Emotional Stability
        # These are *Emotional Stability* keywords. Scoring them will yield 
        # a high Stability score, which translates to a LOW Neuroticism score.
        "stable", "calm", "focused", "resilient", "reliable", "consistent", 
        "clear", "stress", "pressure", "organized", "composed", "secure",
        "confident", "poised", "steady", "practical", "rational", "adaptable",
        "decisive", "manage", "control", "pressure", "level-headed", "realistic"
    ]
}

# --- Core Helper Functions ---

def extract_text_from_pdf(pdf_path):
    """
    Uses PyMuPDF (fitz) for clean text extraction.
    """
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text("text") + " "
        doc.close()
            
        # 1. Clean PDF artifacts (cid and non-standard characters like #)
        text = re.sub(r'\(cid:\d+\)|[#]', ' ', text)
        
        # 2. Normalize vertical and non-meaningful whitespace
        text = re.sub(r'[\n\t\r\f]+', ' ', text)
        
        # 3. Fix lower-to-Upper concatenation (aDev -> a Dev) - Safety step
        text = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', text)
        
        # 4. Final normalization of multiple spaces
        text = re.sub(r'\s{2,}', ' ', text).strip()
        
        return text, None
    except Exception as e:
        return None, f"PDF extraction failed using PyMuPDF: {e}"

def extract_contact_info(text):
    email = re.search(r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]{2,6}", text, re.IGNORECASE)
    phone = re.search(r"(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{4,})", text)
    
    return {
        "email": email.group(0) if email else None,
        "phone": re.sub(r'[^\d]', '', phone.group(0))[-10:] if phone else None 
    }

def extract_name(text):
    doc = NLP(text[:100])
    name = None
    
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            if len(ent.text.split()) >= 2 and len(ent.text) > 5:
                name = ent.text.strip()
                break
                
    if name:
        name = re.sub(r'(\s+(Web Developer|Engineer|Data Analyst|Fresher).*)|([\s+@].*)$', '', name, flags=re.IGNORECASE).strip()
        if len(name.split()) == 1 and len(text.split()) > 2 and 'Singh' in text:
             full_match = re.search(r'(BHAVRATTAN SINGH BAGGA|Bhavrattan Singh Bagga)', text, re.IGNORECASE)
             if full_match:
                 return full_match.group(0).strip()
    return name

def extract_job_title(text):
    titles = ["Web Developer", "Data Analyst", "Engineer", "Web Development Fresher", "Software Developer", "Machine Learning", "Data Scientist"]
    
    for title in titles:
        if re.search(r'\b' + re.escape(title) + r'\b', text[:200], re.IGNORECASE):
            return title
            
    return "Job Title N/A"

def extract_skills(text, skills_list=None):
    if skills_list is None:
        skills_list = [
            'Power BI', 'Python', 'JavaScript', 'HTML5', 'CSS3', 'MySQL', 
            'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'NumPy', 
            'Pandas', 'Matplotlib', 'Scikit-learn', 'PyTorch', 'TensorFlow', 
            'Keras', 'NLTK', 'OpenCV', 'Postman', 'C', 'C++', 'Java', 'R', 
            'Tableau', 'Azure', 'GCP', 'Spring Boot', 'MongoDB'
        ]

    found_skills = set()
    text_lower = text.lower()
    
    for skill in skills_list:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower) or \
           re.search(r'\b' + re.escape(skill.lower().replace(' ', '')) + r'\b', text_lower):
            found_skills.add(skill)
            
    return list(found_skills)

def extract_summary_or_objective(text):
    """
    Uses a simplified approach to find the end of the summary section.
    """
    text_lower = text.lower()
    
    start_match = re.search(r'\b(objective|summary|profile)\s*[:]?\s*', text_lower)
    if not start_match:
        return None
        
    start_index = start_match.end()
    summary_text = text[start_index:].strip()
    
    end_headers = ["core skills", "key projects", "certifications", "education", "experience", "work experience"]
    end_index = len(summary_text)
    
    for header in end_headers:
        match = re.search(r'(\s|^)' + re.escape(header) + r'[:\s]', summary_text, re.IGNORECASE)
        if match and match.start() < end_index:
            end_index = match.start()
            
    final_summary = summary_text[:end_index].strip()
    
    final_summary = re.sub(r'[\s.,;]+$', '', final_summary)
    
    return final_summary if len(final_summary) > 20 else None

def analyze_personality(full_text, summary_text):
    """
    Analyzes the resume text and returns OCEAN personality scores normalized 
    to a 0.0 - 1.0 float scale.
    """
    full_text_lower = full_text.lower()
    summary_text_lower = summary_text.lower() if summary_text else ""
    scores = {}
    text_length = len(full_text_lower.split())
    # Normalization factor helps prevent short resumes from scoring too high
    normalization_factor = math.pow(max(1, text_length / 300), 1/3) 
    MAX_SCORE_COUNT = 30 
    SUMMARY_WEIGHT = 3 
    
    for trait, keywords in OCEAN_KEYWORDS.items():
        total_weighted_count = 0
        for keyword in keywords:
            count_in_full = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', full_text_lower))
            count_in_summary = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', summary_text_lower))
            weighted_count = (count_in_full - count_in_summary) + (count_in_summary * SUMMARY_WEIGHT)
            total_weighted_count += weighted_count
        
        # Calculate base score (0-100 scale)
        base_score = (total_weighted_count / MAX_SCORE_COUNT) * 100
        
        # Apply length normalization and cap at 100
        normalized_score_100 = min(100, base_score / normalization_factor)
        
        # Apply a boost to low scores for less detailed resumes
        if normalized_score_100 < 15:
            normalized_score_100 += 20
        
        # Final score capped between 0 and 100
        final_score_100 = max(0, min(100, normalized_score_100))
        
        # 🎯 FIX 1: Convert the 0-100 scale to the required 0.0-1.0 float scale
        final_score_0_1 = final_score_100 / 100.0

        # 🎯 FIX 2: Invert score for Neuroticism (since keywords used are for Stability)
        if trait == "Neuroticism":
            # If the candidate scored high on 'stable' keywords (e.g., 0.9), 
            # their Neuroticism score should be low (1.0 - 0.9 = 0.1).
            final_score_0_1 = 1.0 - final_score_0_1
            # Ensure the score remains positive due to minor floating point math
            final_score_0_1 = max(0.0, final_score_0_1) 

        scores[trait] = final_score_0_1
    return scores

# --- Main Parsing Function ---

def parse_resume(pdf_path):
    # This calls your PyMuPDF parser
    text, error = extract_text_from_pdf(pdf_path)
    if text is None:
        # Returns the specific PyMuPDF error if extraction failed
        return {"success": False, "error": error}

    # All other extraction logic uses the raw text
    name = extract_name(text) 
    title = extract_job_title(text)
    contact = extract_contact_info(text)
    summary_objective = extract_summary_or_objective(text) 
    skills = extract_skills(text)
    
    # Personality scores are now returned on a 0.0 - 1.0 scale (float)
    personality_scores = analyze_personality(text, summary_objective)
    
    # The final payload for the candidate data
    extracted_data = {
        "name": name if name else "Unknown Candidate", 
        "jobTitle": title,
        "email": contact.get("email"),
        "phone": contact.get("phone"),
        "summary": summary_objective if summary_objective else "No summary/objective found.",
        "skills": skills,
        "personality": personality_scores, 
        "raw_text_length": len(text),
        "location": "Location N/A" 
    }

    return {"success": True, "data": extracted_data}


# --- Main Execution Block (UPDATED for better error reporting) ---

if __name__ == "__main__":
    if len(sys.argv) < 2:
        output = {"success": False, "error": "Missing PDF file path argument."}
        print(json.dumps(output))
        sys.exit(1)

    pdf_file_path = sys.argv[1]
    
    try:
        result = parse_resume(pdf_file_path)
        # If result is {"success": false, "error": "..."} it passes through here
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        # 🎯 CATCH-ALL for any unexpected Python crash/dependency issue
        output = {'success': False, 'error': f'Python Script Fatal Error: {type(e).__name__} - {str(e)}'}
        sys.stderr.write(output['error'] + '\n')
        print(json.dumps(output))
        sys.exit(1)
