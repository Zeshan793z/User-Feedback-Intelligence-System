type Sentiment = "positive" | "neutral" | "negative";

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const styles: Record<Sentiment, string> = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-yellow-100 text-yellow-700",
  negative: "bg-red-100 text-red-700",
};

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${styles[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}