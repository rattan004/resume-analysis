import fs from "fs"

// Simple text extraction from resume (works with .txt and basic text content)
export const extractResumeData = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const text = fileContent.toLowerCase()

    // Extract name (usually first line or after "name:")
    const nameMatch = fileContent.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m)
    const name = nameMatch ? nameMatch[1] : "Candidate"

    // Extract email
    const emailMatch = text.match(/([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,})/)
    const email = emailMatch ? emailMatch[1] : "candidate@email.com"

    // Extract phone - matches formats like (123) 456-7890, 123-456-7890, +1 123 456 7890
    // Corrected to match (optional country code) (optional area code in parentheses) xxx-xxx-xxxx
    const phoneMatch = text.match(/(\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})/);
    const phone = phoneMatch ? phoneMatch[1] : ""

    // Extract location
    const locationMatch = text.match(/(location|based in|located in)[:\s]+([A-Z][a-z]+,?\s*[A-Z]{2})/i)
    const location = locationMatch ? locationMatch[2] : "Not specified"

    // Extract skills - look for common skill keywords
    const skillKeywords = [
      "javascript",
      "python",
      "java",
      "c++",
      "c#",
      "ruby",
      "php",
      "swift",
      "kotlin",
      "react",
      "vue",
      "angular",
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "sql",
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "elasticsearch",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "git",
      "html",
      "css",
      "typescript",
      "graphql",
      "rest api",
      "microservices",
      "agile",
      "scrum",
      "jira",
      "linux",
      "windows",
      "macos",
    ]

    const foundSkills = skillKeywords.filter((skill) => text.includes(skill))
    const skills = foundSkills.length > 0 ? foundSkills : ["Not specified"]

    // Extract experience years
    const experienceMatch = text.match(/(\d+)\s*(?:\+)?\s*years?\s*(?:of\s*)?(?:experience|exp)/i)
    const yearsOfExperience = experienceMatch ? Number.parseInt(experienceMatch[1]) : 0

    // Extract education
    const educationMatch = text.match(
      /(bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|associate)['\s]?s?\s*(?:in|of)?\s*([a-z\s]+)/i,
    )
    const education = educationMatch ? educationMatch[0] : "Not specified"

    // Calculate personality traits based on resume language patterns
    const personalityProfile = calculatePersonalityTraits(fileContent)

    // Calculate skill match percentage
    const skillsMatch = Math.min(100, 60 + foundSkills.length * 5)

    // Calculate personality fit
    const personalityFit = Math.round(
      (personalityProfile.openness.match +
        personalityProfile.conscientiousness.match +
        personalityProfile.extraversion.match +
        personalityProfile.agreeableness.match +
        personalityProfile.neuroticism.match) /
        5,
    )

    // Overall match
    const overallMatch = Math.round((skillsMatch + personalityFit) / 2)

    return {
      name,
      email,
      phone,
      location,
      skills,
      yearsOfExperience,
      education,
      skillsMatch,
      personalityFit,
      overallMatch,
      personalityProfile,
      experience: `${yearsOfExperience} years`,
      quickStats: {
        perfectSkillMatch: Math.max(1, Math.floor(foundSkills.length * 0.7)),
        partialSkillMatch: Math.max(1, Math.floor(foundSkills.length * 0.2)),
        missingSkills: Math.max(1, Math.floor(foundSkills.length * 0.1)),
      },
      skillsBreakdown: {
        perfectMatches: foundSkills.slice(0, Math.ceil(foundSkills.length * 0.7)),
        partialMatches: foundSkills.slice(Math.ceil(foundSkills.length * 0.7), Math.ceil(foundSkills.length * 0.9)),
        missingSkills: ["Docker", "Kubernetes", "Terraform"].slice(
          0,
          Math.max(1, Math.floor(foundSkills.length * 0.1)),
        ),
      },
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    throw new Error("Failed to parse resume file")
  }
}

// Calculate personality traits based on resume language patterns
const calculatePersonalityTraits = (resumeText) => {
  const text = resumeText.toLowerCase()

  // Openness: Look for innovation, creativity, learning keywords
  const opennessKeywords = [
    "innovative",
    "creative",
    "learning",
    "research",
    "explore",
    "novel",
    "experiment",
    "curious",
  ]
  const opennessScore = Math.min(100, 50 + opennessKeywords.filter((k) => text.includes(k)).length * 5)

  // Conscientiousness: Look for organization, detail, responsibility keywords
  const conscientiousnessKeywords = [
    "organized",
    "detail",
    "responsible",
    "reliable",
    "thorough",
    "meticulous",
    "systematic",
    "disciplined",
  ]
  const conscientiousnessScore = Math.min(
    100,
    50 + conscientiousnessKeywords.filter((k) => text.includes(k)).length * 5,
  )

  // Extraversion: Look for leadership, collaboration, communication keywords
  const extraversionKeywords = [
    "leadership",
    "team",
    "collaboration",
    "communication",
    "presentation",
    "mentoring",
    "networking",
    "social",
  ]
  const extraversionScore = Math.min(100, 50 + extraversionKeywords.filter((k) => text.includes(k)).length * 5)

  // Agreeableness: Look for cooperation, empathy, support keywords
  const agreeablenessKeywords = [
    "cooperation",
    "empathy",
    "support",
    "helping",
    "collaborative",
    "inclusive",
    "compassion",
    "understanding",
  ]
  const agreeablenessScore = Math.min(100, 50 + agreeablenessKeywords.filter((k) => text.includes(k)).length * 5)

  // Neuroticism (lower is better): Look for stress management, resilience keywords
  const resilienceKeywords = ["resilient", "adaptable", "flexible", "calm", "composed", "stress management", "pressure"]
  const neuroticismScore = Math.max(20, 100 - resilienceKeywords.filter((k) => text.includes(k)).length * 8)

  return {
    openness: { candidate: opennessScore, ideal: 80, match: Math.round((opennessScore / 80) * 100) },
    conscientiousness: {
      candidate: conscientiousnessScore,
      ideal: 70,
      match: Math.round((conscientiousnessScore / 70) * 100),
    },
    extraversion: { candidate: extraversionScore, ideal: 60, match: Math.round((extraversionScore / 60) * 100) },
    agreeableness: { candidate: agreeablenessScore, ideal: 90, match: Math.round((agreeablenessScore / 90) * 100) },
    neuroticism: {
      candidate: neuroticismScore,
      ideal: 70,
      match: Math.round(((100 - neuroticismScore) / (100 - 70)) * 100),
    },
  }
}

export default { extractResumeData }
