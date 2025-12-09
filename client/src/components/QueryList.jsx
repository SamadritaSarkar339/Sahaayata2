import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const languageLabel = (lang) => {
  if (lang === "hi") return "Hindi";
  if (lang === "bn") return "Bengali";
  return "English";
};

const QueryCard = ({ query, isAdmin, onDelete }) => {
  const [showFull, setShowFull] = useState(false);

  const createdDate = new Date(query.createdAt).toLocaleString();
  const answerPreview = query.aiAnswer?.slice(0, 500) ?? "";
  const hasMore = (query.aiAnswer || "").length > 500;

  return (
    <article className="query-card">
      <header className="card-header">
        <div>
          <h3>{query.location || "Location not specified"}</h3>
          <p className="meta">
            Situation from citizen: <strong>{query.name}</strong> — {createdDate}
          </p>
          <p className="meta">
            Response language: <strong>{languageLabel(query.language || "en")}</strong>
          </p>
        </div>

        <div className="card-header-right">
          {query.categories && query.categories.length > 0 && (
            <div className="tag-list">
              {query.categories.map((c) => (
                <span key={c} className="tag">{c}</span>
              ))}
            </div>
          )}
          {isAdmin && (
            <button
              type="button"
              className="danger-btn"
              onClick={() => onDelete(query._id)}
            >
              Delete
            </button>
          )}
        </div>
      </header>

      <section className="card-body">
        <p className="situation-text">
          <strong>Situation:</strong> {query.situation}
        </p>

        <div className="answer-markdown">
          <strong>AI Guidance:</strong>
          <div className="markdown-output">
            {/* If preview, show preview, else full */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              children={showFull || !hasMore ? query.aiAnswer : answerPreview}
            />
            {hasMore && !showFull && <span>...</span>}
          </div>
        </div>

        {hasMore && (
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowFull((s) => !s)}
          >
            {showFull ? "Show less" : "Read full answer"}
          </button>
        )}
      </section>
    </article>
  );
};

const QueryList = ({ queries, isAdmin = false, onDelete }) => {
  if (!queries || queries.length === 0) {
    return <p>No queries yet. Be the first to ask!</p>;
  }

  return (
    <div className="query-list">
      {queries.map((q) => (
        <QueryCard key={q._id} query={q} isAdmin={isAdmin} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default QueryList;
