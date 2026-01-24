
import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-slate-700 animate-spin"></div>
        <p className="text-slate-400 font-medium tracking-wide">Architecting your solution...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Your analysis results will appear here after processing.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 custom-scrollbar">
      {/* Summary Header */}
      <section>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
          Executive Summary
        </h2>
        <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          {result.summary}
        </p>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-xs uppercase font-bold tracking-tighter mb-1">Cognitive Complexity</span>
          <span className={`text-3xl font-black ${result.complexityScore > 7 ? 'text-red-400' : result.complexityScore > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
            {result.complexityScore}/10
          </span>
        </div>
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-xs uppercase font-bold tracking-tighter mb-1">Security Status</span>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${result.securityConcerns.length > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-green-500/20 text-green-400 border border-green-500/40'}`}>
            {result.securityConcerns.length > 0 ? `${result.securityConcerns.length} Flags Found` : 'Clean'}
          </span>
        </div>
      </div>

      {/* Logic Breakdown */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Logic Breakdown</h3>
        <div className="space-y-4">
          {result.explanations.map((exp, idx) => (
            <div key={idx} className="group">
              <h4 className="text-indigo-400 font-semibold mb-1 group-hover:text-indigo-300 transition-colors"># {exp.section}</h4>
              <p className="text-slate-400 text-sm">{exp.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Concerns */}
      {result.securityConcerns.length > 0 && (
        <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <h3 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Security Alerts
          </h3>
          <ul className="list-disc list-inside text-sm text-red-300/80 space-y-2">
            {result.securityConcerns.map((con, idx) => (
              <li key={idx}>{con}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Refactoring Suggestions */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Architectural Recommendations</h3>
        <ul className="space-y-3">
          {result.suggestions.map((sug, idx) => (
            <li key={idx} className="flex items-start space-x-3 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg text-sm text-indigo-100/80">
              <span className="mt-1 text-indigo-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AnalysisDisplay;
