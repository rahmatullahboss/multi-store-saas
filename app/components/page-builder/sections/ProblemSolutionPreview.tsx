/**
 * Page Builder v2 - Problem Solution Section Preview
 */

interface ProblemSolutionProps {
  title?: string;
  problems?: Array<{ text: string }>;
  solution?: string;
  solutionTitle?: string;
}

export function ProblemSolutionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'আপনার সমস্যা, আমাদের সমাধান',
    problems = [
      { text: 'সমস্যা ১ এখানে লিখুন' },
      { text: 'সমস্যা ২ এখানে লিখুন' },
      { text: 'সমস্যা ৩ এখানে লিখুন' },
    ],
    solutionTitle = '✨ আমাদের সমাধান',
    solution = 'এই পণ্য দিয়ে আপনি সকল সমস্যার সমাধান পাবেন!'
  } = props as ProblemSolutionProps;
  
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center mb-10">{title}</h2>
        )}
        
        {/* Problems */}
        <div className="space-y-4 mb-10">
          {problems.map((problem, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 bg-red-500/20 rounded-lg p-4 border border-red-500/30"
            >
              <span className="text-red-400 text-xl">😞</span>
              <p className="text-gray-200">{problem.text}</p>
            </div>
          ))}
        </div>
        
        {/* Arrow */}
        <div className="text-center text-4xl mb-6">⬇️</div>
        
        {/* Solution */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">{solutionTitle}</h3>
          <p className="text-lg">{solution}</p>
        </div>
      </div>
    </section>
  );
}
