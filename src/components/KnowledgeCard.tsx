import { ExternalLink } from "lucide-react";

interface KnowledgeCardProps {
  title: string;
  description: string;
  url: string;
  className?: string;
}

const KnowledgeCard = ({ title, description, url, className = '' }: KnowledgeCardProps) => {
  return (
    <div className={`knowledge-card my-8 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <span>🎯 查看知识卡片</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default KnowledgeCard;