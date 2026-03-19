import { useState } from 'react';
import { MessageSquare, ThumbsUp, Clock, Tag, Search, Plus } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  body: string;
  author: string;
  course: string;
  tag: string;
  likes: number;
  replies: number;
  time: string;
}

const DEMO_POSTS: Post[] = [
  { id: 1, title: 'How does useEffect cleanup work?',         body: 'I am confused about when the cleanup function runs in useEffect. Can someone explain?',                    author: 'Alice J.',  course: 'Web Development',    tag: 'React',      likes: 12, replies: 5, time: '2h ago' },
  { id: 2, title: 'Best way to learn AWS from scratch?',     body: 'I just enrolled in Cloud Computing. What order should I watch the videos in?',                            author: 'Bob M.',    course: 'Cloud Computing',    tag: 'AWS',        likes: 8,  replies: 3, time: '4h ago' },
  { id: 3, title: 'Python list comprehension vs loops',      body: 'When should I use list comprehension over a regular for loop? Performance difference?',                   author: 'Carol S.',  course: 'Python Programming', tag: 'Python',     likes: 15, replies: 7, time: '1d ago' },
  { id: 4, title: 'Pandas groupby not working as expected',  body: 'My groupby is returning unexpected results when I have NaN values. How do I handle this?',               author: 'David K.',  course: 'Data Science',       tag: 'Pandas',     likes: 6,  replies: 2, time: '1d ago' },
  { id: 5, title: 'What is the difference between IaaS, PaaS and SaaS?', body: 'The cloud concepts video was great but I still get confused between the three service models.', author: 'Eva P.',  course: 'Cloud Computing',    tag: 'Concepts',   likes: 20, replies: 9, time: '2d ago' },
];

const TAG_COLORS: Record<string, string> = {
  React:    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  AWS:      'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Python:   'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Pandas:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Concepts: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
};

export default function Forum() {
  const [query, setQuery]   = useState('');
  const [newPost, setNewPost] = useState(false);
  const [draft, setDraft]   = useState({ title: '', body: '' });

  const filtered = DEMO_POSTS.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.course.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Discussion Forum</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Ask questions, share knowledge</p>
        </div>
        <button onClick={() => setNewPost(!newPost)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700
                     text-white text-sm font-semibold rounded-xl transition">
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* New post form */}
      {newPost && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                        rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Create a new post</h3>
          <input type="text" placeholder="Post title..."
            className="input mb-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <textarea rows={3} placeholder="Describe your question or topic..."
            className="input resize-none mb-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary text-sm">Post Question</button>
            <button onClick={() => setNewPost(false)}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder="Search discussions..."
          className="input pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[p.tag] ?? 'bg-slate-100 text-slate-600'}`}>
                    <Tag size={9} className="inline mr-1" />{p.tag}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{p.course}</span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1
                               group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {p.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">{p.body}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-medium text-slate-600 dark:text-slate-400">{p.author}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {p.time}</span>
              <span className="flex items-center gap-1"><ThumbsUp size={11} /> {p.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare size={11} /> {p.replies} replies</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No discussions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
