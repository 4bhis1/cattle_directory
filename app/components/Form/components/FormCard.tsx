export const FormCard = ({children}: {children: React.ReactNode}) => {
    return (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
      {children}
            
        </div>
    );
};

export const FormCardHeader = ({Icon, title, containerStyle, titleStyle}: {Icon: React.ReactNode, title: string, containerStyle?: string, titleStyle?: string}) => {
    return (
       <div className={`flex items-center gap-4 mb-6 ${containerStyle}`}>
       {Icon && Icon}
        <h2 className={`text-lg font-bold text-slate-800 dark:text-white ${titleStyle}`}>
          {title}
        </h2>
      </div>
    );
};