import { useEffect, useState } from 'react';
import { awardsApi, type Award } from '@/api';
import Spinner from '@/components/Spinner';
import { Award as AwardIcon, GraduationCap, Calendar } from 'lucide-react';

export default function Certificates() {
  const [awards, setAwards]   = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    awardsApi.list()
      .then((r) => setAwards(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Certificates</h1>
        <p className="text-slate-500 text-sm mt-1">Certificates earned from completed courses.</p>
      </div>

      {loading && <Spinner />}

      {!loading && awards.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-amber-400" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-2">No certificates yet</h3>
          <p className="text-slate-400 text-sm">Complete a course to earn your first certificate.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {awards.map((a) => (
          <div key={a.id}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200
                       rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AwardIcon size={24} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-bold text-base leading-snug">{a.title}</p>
              <p className="text-slate-600 text-sm mt-0.5">{a.subject_title}</p>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                <Calendar size={11} />
                {new Date(a.issued_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
