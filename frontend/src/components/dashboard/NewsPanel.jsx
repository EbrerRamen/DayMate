const NewsPanel = ({ articles }) => (
  <div className="p-6 h-[380px] rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex flex-col">
    <h2 className="text-2xl font-semibold text-cyan-300 mb-4">📰 Top News</h2>
    <ul className="space-y-4 text-indigo-100 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent hover:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-rounded-xl transition-all duration-300">
      {articles.slice(0, 5).map((article, idx) => (
        <li key={idx} className="bg-white/5 p-3 rounded-xl flex gap-3">
          <img src={article.urlToImage || "https://via.placeholder.com/80"} alt="news" className="w-20 h-20 object-cover rounded-lg" />
          <a href={article.url} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition font-medium">
            {article.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default NewsPanel;

