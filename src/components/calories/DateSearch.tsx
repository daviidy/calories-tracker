import { format } from 'date-fns';

interface DateSearchProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

const DateSearch = ({ onDateSelect, selectedDate }: DateSearchProps) => {
  return (
    <div className="relative">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateSelect(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
        max={format(new Date(), 'yyyy-MM-dd')}
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
};

export default DateSearch; 