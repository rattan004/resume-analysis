import { Link } from 'react-router-dom';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, ArrowRight, Target, FileText, Zap } from 'lucide-react';
import './GuidePage.css';

const GuidePage = () => {
  const atsGuides = [
    {
      title: "Use Standard Section Headers",
      description: "Use common headers like 'Experience', 'Education', 'Skills' that ATS systems easily recognize.",
      type: "do"
    },
    {
      title: "Include Relevant Keywords",
      description: "Use keywords from the job description naturally throughout your resume.",
      type: "do"
    },
    {
      title: "Use Simple Formatting",
      description: "Stick to standard fonts (Arial, Calibri, Times New Roman) and avoid complex layouts.",
      type: "do"
    },
    {
      title: "Save as PDF or DOCX",
      description: "These formats preserve formatting and are widely supported by ATS systems.",
      type: "do"
    },
    {
      title: "Avoid Graphics and Images",
      description: "ATS systems can't read images, logos, or graphics - stick to text only.",
      type: "dont"
    },
    {
      title: "Don't Use Headers/Footers",
      description: "Important information in headers/footers may be ignored by ATS systems.",
      type: "dont"
    },
    {
      title: "Avoid Tables and Columns",
      description: "Complex formatting can confuse ATS systems and jumble your content.",
      type: "dont"
    },
    {
      title: "Don't Use Fancy Fonts",
      description: "Creative fonts may not render properly in ATS systems.",
      type: "dont"
    }
  ];

  const optimizationTips = [
    {
      icon: <Target />,
      title: "Tailor for Each Job",
      description: "Customize your resume for each position by incorporating specific keywords and requirements from the job posting.",
      tips: [
        "Read the job description carefully",
        "Match your skills to their requirements",
        "Use similar language and terminology",
        "Highlight relevant experience prominently"
      ]
    },
    {
      icon: <FileText />,
      title: "Structure for Success",
      description: "Organize your resume with clear sections and logical flow to help both ATS systems and human recruiters.",
      tips: [
        "Use reverse chronological order",
        "Include quantifiable achievements",
        "Keep bullet points concise and impactful",
        "Maintain consistent formatting throughout"
      ]
    },
    {
      icon: <Zap />,
      title: "Optimize Content",
      description: "Craft compelling content that showcases your value while remaining ATS-friendly.",
      tips: [
        "Start bullet points with action verbs",
        "Include numbers and percentages",
        "Focus on accomplishments, not just duties",
        "Keep total length to 1-2 pages"
      ]
    }
  ];

  return (
    <div className="guide-page">
      <div className="container">
        <div className="guide-header">
          <h1>ATS-Friendly Resume Guide</h1>
          <p>Learn how to optimize your resume to pass Applicant Tracking Systems and land more interviews</p>
        </div>

        <div className="guide-content">
          {/* ATS Do's and Don'ts */}
          <section className="guide-section">
            {/* FIX 1 & 2: Escaped apostrophes in Do's and Don'ts */}
            <h2>ATS Do&apos;s and Don&apos;ts</h2> 
            <p>Follow these essential guidelines to ensure your resume gets past automated screening systems.</p>
            
            <div className="dos-donts-grid">
              {atsGuides.map((guide, index) => (
                <div key={index} className={`guide-card ${guide.type}`}>
                  <div className="guide-icon">
                    {guide.type === 'do' ? (
                      <CheckCircle className="do-icon" />
                    ) : (
                      <XCircle className="dont-icon" />
                    )}
                  </div>
                  <div className="guide-content-text">
                    <h3>{guide.title}</h3>
                    <p>{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Optimization Tips */}
          <section className="guide-section">
            <h2>Advanced Optimization Tips</h2>
            <p>Take your resume to the next level with these proven strategies.</p>
            
            <div className="tips-grid">
              {optimizationTips.map((tip, index) => (
                <div key={index} className="tip-card">
                  <div className="tip-header">
                    <div className="tip-icon">
                      {tip.icon}
                    </div>
                    <h3>{tip.title}</h3>
                    <p>{tip.description}</p>
                    </div>
                    <ul className="tip-list">
                      {tip.tips.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Keywords Section */}
          <section className="guide-section">
            <div className="keywords-card">
              <div className="keywords-header">
                <AlertCircle className="warning-icon" />
                <h2>Keyword Optimization Strategy</h2>
              </div>
              <div className="keywords-content">
                <div className="keywords-text">
                  <h3>Why Keywords Matter</h3>
                  <p>ATS systems scan for specific keywords to determine if your resume matches the job requirements. Strategic keyword placement can significantly improve your chances of getting noticed.</p>
                  
                  <h4>How to Find the Right Keywords:</h4>
                  <ul>
                    <li>Analyze the job description thoroughly</li>
                    <li>Identify recurring skills and qualifications</li>
                    <li>Include both hard and soft skills</li>
                    <li>Use industry-specific terminology</li>
                    <li>Include relevant certifications and technologies</li>
                  </ul>
                </div>
                <div className="keywords-example">
                  <h4>Example Keywords by Industry:</h4>
                  <div className="keyword-tags">
                    <span className="keyword-tag">Project Management</span>
                    <span className="keyword-tag">Data Analysis</span>
                    <span className="keyword-tag">JavaScript</span>
                    <span className="keyword-tag">Team Leadership</span>
                    <span className="keyword-tag">Agile/Scrum</span>
                    <span className="keyword-tag">Problem Solving</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="guide-cta">
            <div className="cta-card">
              <h2>Ready to Test Your Resume?</h2>
              <p>Use our AI-powered analysis tool to see how well your resume performs against ATS systems and get personalized recommendations for improvement.</p>
              <Link to="/" className="btn btn-primary cta-btn">
                Start Analysis
                <ArrowRight />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;