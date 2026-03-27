'use client';

type Axis = 'front' | 'rear' | 'both';

interface AxisSelectorProps {
  selected: Axis;
  onChange: (axis: Axis) => void;
}

const axes: { key: Axis; label: string; icon: JSX.Element }[] = [
  { 
    key: 'front', 
    label: 'Передняя ось', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ) // Mock icon, using some generic shapes 
  },
  { 
    key: 'rear', 
    label: 'Задняя ось', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    ) 
  },
  { 
    key: 'both', 
    label: 'Две оси', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    ) 
  },
];

export default function AxisSelector({ selected, onChange }: AxisSelectorProps) {

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">ДИАГНОСТИКА</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {axes.map((axis) => {
          const isSelected = selected === axis.key;
          const isBoth = axis.key === 'both';
          
          if (isBoth) {
            return (
              <button
                key={axis.key}
                onClick={() => onChange(axis.key)}
                className={`col-span-2 flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-light border-2 border-brand text-brand'
                    : 'bg-brand-light border-2 border-transparent text-text hover:bg-brand-light/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={isSelected ? 'text-brand' : 'text-text-muted'}>
                    {axis.icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[15px] font-black">
                      {axis.label}
                    </span>
                    <span className="text-[10px] text-text-muted/80 leading-tight mt-0.5">
                      если у вас пневмо- или адаптивная подвеска, на цену это не влияет
                    </span>
                  </div>
                </div>
                {/* Radio button icon */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-brand' : 'border-text-muted/30'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
              </button>
            );
          }

          // Стиль для передней и задней оси (квадратные карточки)
          return (
            <button
              key={axis.key}
              onClick={() => onChange(axis.key)}
              className={`flex flex-col items-start justify-between p-4 h-[110px] rounded-2xl transition-all duration-200 ${
                isSelected
                  ? 'bg-brand-light border-2 border-brand text-brand'
                  : 'bg-brand-light border-2 border-transparent text-text hover:bg-brand-light/80'
              }`}
            >
              <div className={`mb-auto ${isSelected ? 'text-brand' : 'text-text-muted'}`}>
                {axis.icon}
              </div>
              <span className={`text-[13px] font-black text-left leading-tight mt-4 ${isSelected ? 'text-brand' : 'text-text'}`}>
                {axis.label.replace(' ', '\n')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
