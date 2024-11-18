import React from 'react';

interface SkillTagProps {
  skill: string;
  matched?: boolean;
  additional?: boolean;
}

export const SkillTag: React.FC<SkillTagProps> = ({ skill, matched, additional }) => {
  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium transition-colors";
  
  if (additional) {
    return (
      <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
        {skill}
      </span>
    );
  }

  if (matched === undefined) {
    return (
      <span className={`${baseClasses} bg-indigo-100 text-indigo-700`}>
        {skill}
      </span>
    );
  }

  return (
    <span 
      className={`${baseClasses} ${
        matched 
          ? "bg-green-100 text-green-700" 
          : "bg-red-100 text-red-700"
      }`}
    >
      {skill}
    </span>
  );
};