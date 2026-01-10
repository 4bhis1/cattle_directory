export const FormCard = ({children}: {children: React.ReactNode}) => {
    return (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
      {children}
            
        </div>
    );
};