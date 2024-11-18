import axios, { AxiosError } from 'axios';

const SKILLS_LIST = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Ruby", "PHP",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis",
  "React", "Angular", "Vue.js", "Node.js", "Express.js",
  "Machine Learning", "Deep Learning", "AI", "Data Science",
  "TensorFlow", "PyTorch", "Scikit-learn",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "Git", "CI/CD", "DevOps", "Agile",
  "REST API", "GraphQL", "Microservices"
];

export interface SkillMatch {
  skill: string;
  matched: boolean;
}

export const extractSkills = (text: string): string[] => {
  const lowercaseText = text.toLowerCase();
  return SKILLS_LIST.filter(skill => 
    lowercaseText.includes(skill.toLowerCase())
  );
};

export const matchSkills = (requiredSkills: string[], resumeSkills: string[]): SkillMatch[] => {
  const resumeSkillsLower = resumeSkills.map(skill => skill.toLowerCase());
  return requiredSkills.map(skill => ({
    skill,
    matched: resumeSkillsLower.includes(skill.toLowerCase())
  }));
};

interface HuggingFaceError {
  error: string;
  estimated_time?: number;
}

export const summarizeJobDescription = async (
  jobDescription: string,
  apiKey: string
): Promise<string> => {
  const apiUrl = "https://api-inference.huggingface.co/models/google/flan-t5-base";

  try {
    const response = await axios.post(
      apiUrl,
      { 
        inputs: `Summarize this job description in a concise way: ${jobDescription}`,
        parameters: { 
          max_length: 150,
          temperature: 0.7,
          top_p: 0.9,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.data.error) {
      const error = response.data as HuggingFaceError;
      if (error.estimated_time) {
        throw new Error(`Model is loading. Please wait ${Math.ceil(error.estimated_time)} seconds and try again.`);
      }
      throw new Error(error.error);
    }

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid API response format');
    }

    const summary = response.data[0]?.generated_text;
    if (!summary) {
      throw new Error('No summary was generated');
    }

    return summary;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Hugging Face API key in the .env file.');
      }
      if (error.response?.status === 503) {
        const errorData = error.response.data as HuggingFaceError;
        if (errorData.estimated_time) {
          throw new Error(`Model is loading. Please wait ${Math.ceil(errorData.estimated_time)} seconds and try again.`);
        }
        throw new Error('Service is temporarily unavailable. Please try again in a few moments.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The server took too long to respond.');
      }
      if (error.response?.data?.error) {
        throw new Error(`API Error: ${error.response.data.error}`);
      }
      throw new Error(`Network error: ${error.message}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred while generating the summary.');
  }
};