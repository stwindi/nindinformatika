const subjectColors = {
  Matematika:       'bg-blue-100 text-blue-700',
  Fisika:           'bg-purple-100 text-purple-700',
  Kimia:            'bg-green-100 text-green-700',
  Biologi:          'bg-emerald-100 text-emerald-700',
  'Bahasa Indonesia': 'bg-red-100 text-red-700',
  'Bahasa Inggris': 'bg-pink-100 text-pink-700',
  Sejarah:          'bg-yellow-100 text-yellow-700',
  Geografi:         'bg-teal-100 text-teal-700',
  Ekonomi:          'bg-orange-100 text-orange-700',
  Sosiologi:        'bg-indigo-100 text-indigo-700',
  PKN:              'bg-cyan-100 text-cyan-700',
  TIK:              'bg-violet-100 text-violet-700',
  Seni:             'bg-rose-100 text-rose-700',
  Olahraga:         'bg-lime-100 text-lime-700',
  Umum:             'bg-gray-100 text-gray-700',
};

export default function SubjectBadge({ subject, size = 'sm' }) {
  const colorClass = subjectColors[subject] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${
      size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
    } ${colorClass}`}>
      {subject || 'Umum'}
    </span>
  );
}
