import React, { useState, useCallback } from 'react';
import { Brain, Loader2, BookOpen, Code2, Send, AlertCircle, RefreshCcw, Upload } from 'lucide-react';
import { extractSkills, summarizeJobDescription, matchSkills, type SkillMatch } from '../services/jobAnalyzer';
import { SkillTag } from './SkillTag';
import { ResultCard } from './ResultCard';
import { ResumeUploader } from './ResumeUploader';

interface AnalysisResult {
  requiredSkills: SkillMatch[];
  resumeSkills: string[];
  summary: string;
  matchRate: number;
}

function JobAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleResumeUpload = useCallback((resumeText: string) => {
    if (!jobDescription) {
      setError('Please enter a job description first');
      return;
    }

    const requiredSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(resumeText);
    const matchedSkills = matchSkills(requiredSkills, resumeSkills);
    const matchRate = (matchedSkills.filter(s => s.matched).length / matchedSkills.length) * 100;

    setResult(prev => ({
      ...prev!,
      requiredSkills: matchedSkills,
      resumeSkills,
      matchRate
    }));
  }, [jobDescription]);

  const analyzeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const requiredSkills = extractSkills(jobDescription);
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      
      if (!apiKey) {
        throw new Error('Hugging Face API key is not configured. Please add it to your .env file.');
      }

      const summary = await summarizeJobDescription(jobDescription, apiKey);
      
      setResult({
        requiredSkills: requiredSkills.map(skill => ({ skill, matched: false })),
        resumeSkills: [],
        summary,
        matchRate: 0
      });
      setRetryCount(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setError(errorMessage);
      
      if (errorMessage.includes('Model is loading')) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    analyzeJob(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">Skills Match Analyzer</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <form onSubmit={analyzeJob}>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Paste your job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Analyze Requirements
                    </>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </div>
                  {error.includes('Model is loading') && retryCount < 3 && (
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 text-red-700 hover:text-red-800 font-medium"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Retry Analysis
                    </button>
                  )}
                </div>
              </div>
            )}

            {result && (
              <ResultCard title="Job Summary" icon={BookOpen}>
                <p className="text-gray-600 leading-relaxed">{result.summary}</p>
              </ResultCard>
            )}
          </div>

          <div className="space-y-6">
            <ResumeUploader onUpload={handleResumeUpload} disabled={!result} />

            {result && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Skills Analysis</h2>
                  </div>
                  {result.matchRate > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {Math.round(result.matchRate)}%
                      </div>
                      <div className="text-sm text-gray-500">Match Rate</div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.requiredSkills.map((skill, index) => (
                        <SkillTag key={index} skill={skill.skill} matched={skill.matched} />
                      ))}
                    </div>
                  </div>

                  {result.resumeSkills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Skills Found</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.resumeSkills
                          .filter(skill => !result.requiredSkills.some(req => req.skill.toLowerCase() === skill.toLowerCase()))
                          .map((skill, index) => (
                            <SkillTag key={index} skill={skill} additional />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobAnalyzer;