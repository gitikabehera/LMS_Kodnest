import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { Subject } from '@/api';

interface Props {
  course: Subject;
}

export default function CourseCard({ course }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="card cursor-pointer hover:border-primary-500 hover:bg-gray-700/50 transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary-600/20 rounded-lg">
          <BookOpen className="text-primary-400" size={22} />
        </div>
        <ChevronRight className="text-gray-600 group-hover:text-primary-400 transition" size={18} />
      </div>
      <h3 className="text-white font-semibold text-base mb-1 group-hover:text-primary-300 transition">
        {course.title}
      </h3>
      <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
    </div>
  );
}
