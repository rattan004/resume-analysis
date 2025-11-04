# job_analyzer.py

import json
import sys
import re
import fitz # PyMuPDF library for PDF extraction

# --- Configuration (for analysis only) ---
# Personality Keyword Definitions - Scores are now on a 0.0 to 1.0 scale
PERSONALITY_MAPPING = {
    # Conscientiousness
    'organized': {'Conscientiousness': 0.90}, 
    'responsible': {'Conscientiousness': 0.85},
    'detail-oriented': {'Conscientiousness': 0.95}, 
    'disciplined': {'Conscientiousness': 0.80},
    
    # Openness
    'innovative': {'Openness': 0.80}, 
    'creative': {'Openness': 0.90}, 
    'curious': {'Openness': 0.75},
    
    # Extraversion
    'communicative': {'Extraversion': 0.70}, 
    'team player': {'Extraversion': 0.85},
    
    # Agreeableness
    'collaborative': {'Agreeableness': 0.85}, 
    'cooperative': {'Agreeableness': 0.80},
    
    # Neuroticism (Inverted from Emotional Stability)
    # A job requiring 'resilient' (high Emotional Stability) needs low Neuroticism.
    # We assign a low score (closer to 0.0) for 'resilient' keywords.
    'resilient': {'Neuroticism': 0.15}, 
    'stable': {'Neuroticism': 0.20}, 
}

# Common skills list for extraction
COMMON_SKILLS = [
    'python', 'sql', 'html5', 'css3', 'javascript', 'react', 'nodejs', 'express', 
    'mongodb', 'postgresql', 'git', 'docker', 'aws', 'typescript', 'java', 'c++', 
    'scikit-learn', 'tensorflow', 'keras', 'powerbi', 'pandas', 'numpy', 'matplotlib', 
    'c', 'mysql'
]
# --- End Configuration ---


# --- PDF Text Extraction (Copied from your code) ---
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
            
        # 1. Clean PDF artifacts
        text = re.sub(r'\(cid:\d+\)|[#]', ' ', text)
        
        # 2. Normalize vertical and non-meaningful whitespace
        text = re.sub(r'[\n\t\r\f]+', ' ', text)
        
        # 3. Fix lower-to-Upper concatenation
        text = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', text)
        
        # 4. Final normalization of multiple spaces
        text = re.sub(r'\s{2,}', ' ', text).strip()
        
        return text, None
    except Exception as e:
        return None, f"PDF extraction failed using PyMuPDF: {e}"

# --- Core Analysis Function ---

def extract_ideal_profile(jd_text):
    """Analyzes the job description text to extract required skills and ideal personality."""
    ideal_profile = {
        'REQUIRED_SKILLS': set(),
        'IDEAL_PERSONALITY': {
            # Default scores set to 0.50 (50% average)
            'Openness': 0.50, 'Conscientiousness': 0.50, 'Extraversion': 0.50, 
            'Agreeableness': 0.50, 
            'Neuroticism': 0.50, # CHANGED from Emotional Stability
        }
    }
    
    lower_jd = jd_text.lower()
    
    # 1. Extract Skills (Keyword Matching)
    for skill in COMMON_SKILLS:
        # Uses full word boundary match
        if re.search(r'\b' + re.escape(skill) + r'\b', lower_jd):
            ideal_profile['REQUIRED_SKILLS'].add(skill.capitalize())
            
    # 2. Extract Personality (Rule-based Keyword Mapping)
    for keyword, trait_data in PERSONALITY_MAPPING.items():
        if keyword in lower_jd:
            for trait, score in trait_data.items():
                current_score = ideal_profile['IDEAL_PERSONALITY'][trait]
                # 'score' here is now a float (e.g., 0.90)
                ideal_profile['IDEAL_PERSONALITY'][trait] = max(current_score, score)

    # Fallback if no skills are found
    if not ideal_profile['REQUIRED_SKILLS']:
        ideal_profile['REQUIRED_SKILLS'] = {'HTML5', 'CSS3', 'JavaScript'}
        
    return {
        'REQUIRED_SKILLS': list(ideal_profile['REQUIRED_SKILLS']),
        'IDEAL_PERSONALITY': ideal_profile['IDEAL_PERSONALITY'] # Output is now 0.0-1.0
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        output = {'success': False, 'error': 'Missing JD PDF file path argument.'}
        print(json.dumps(output))
        sys.exit(1)

    jd_pdf_path = sys.argv[1] 
    
    try:
        # 🎯 Step 1: Extract text using the 'fitz' function
        jd_text, error = extract_text_from_pdf(jd_pdf_path) 
        
        if jd_text is None:
            output = {'success': False, 'error': error}
            print(json.dumps(output))
            sys.exit(1)

        # 🎯 Step 2: Analyze the extracted text
        ideal_profile = extract_ideal_profile(jd_text)
        
        output = {
            'success': True,
            'data': ideal_profile
        }
        print(json.dumps(output))

    except Exception as e:
        output = {'success': False, 'error': f'Job analysis failed: {str(e)}'}
        print(json.dumps(output))
        sys.exit(1)
