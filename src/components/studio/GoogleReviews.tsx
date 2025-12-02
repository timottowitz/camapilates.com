import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Star, Quote, ExternalLink } from 'lucide-react';
import { hasConvex } from '@/lib/convexProvider';

interface Review {
  authorName: string;
  authorPhotoUrl: string | null;
  authorProfileUrl: string | null;
  rating: number;
  text: string;
  originalText: string | null;
  language: string;
  publishTime: string;
  relativeTime: string;
}

interface GoogleReviewsProps {
  googlePlaceId?: string;
  studioName: string;
  maxReviews?: number;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? 'fill-[#3E2723] text-[#3E2723]'
            : 'fill-none text-[#2A2624]/20'
        }`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => {
  const [showOriginal, setShowOriginal] = React.useState(false);
  const hasTranslation = review.originalText && review.originalText !== review.text;
  const displayText = showOriginal && hasTranslation ? review.originalText : review.text;

  return (
    <div className="bg-white border border-[#2A2624]/5 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Author Header */}
      <div className="flex items-start gap-4 mb-4">
        {review.authorPhotoUrl ? (
          <img
            src={review.authorPhotoUrl}
            alt={review.authorName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#2A2624]/10 flex items-center justify-center">
            <span className="text-lg font-medium text-[#2A2624]">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {review.authorProfileUrl ? (
              <a
                href={review.authorProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#2A2624] hover:underline truncate"
              >
                {review.authorName}
              </a>
            ) : (
              <span className="font-medium text-[#2A2624] truncate">
                {review.authorName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-xs text-[#5D5550]">{review.relativeTime}</span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="relative">
        <Quote className="absolute -top-1 -left-1 w-6 h-6 text-[#2A2624]/10" />
        <p className="text-[#5D5550] font-light leading-relaxed pl-5">
          {displayText}
        </p>
      </div>

      {/* Translation Toggle */}
      {hasTranslation && (
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="mt-3 text-xs text-[#3E2723] hover:underline flex items-center gap-1"
        >
          {showOriginal ? 'Ver traducción' : 'Ver original'}
        </button>
      )}
    </div>
  );
};

// Inner component that uses hooks (only rendered when Convex is available)
const GoogleReviewsInner: React.FC<{ googlePlaceId: string; maxReviews: number }> = ({
  googlePlaceId,
  maxReviews,
}) => {
  // Always call hook unconditionally
  const reviews = useQuery(api.studioEnrichment.getStudioReviews, { googlePlaceId });

  // Don't render anything if loading or no reviews
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const displayReviews = reviews.slice(0, maxReviews);

  return (
    <section className="scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif italic text-3xl text-[#2A2624]">
          What Clients Say
        </h2>
        <a
          href={`https://search.google.com/local/reviews?placeid=${googlePlaceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] flex items-center gap-2 transition-colors"
        >
          All Reviews <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayReviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>

      {/* Google Attribution */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#5D5550]/60">
        <img
          src="/powered-by-google.png"
          alt="Powered by Google"
          className="h-4"
        />
        <span>Reviews from Google</span>
      </div>
    </section>
  );
};

// Wrapper component that checks Convex availability before rendering hooks
export const GoogleReviews: React.FC<GoogleReviewsProps> = ({
  googlePlaceId,
  studioName,
  maxReviews = 5,
}) => {
  // Early return before any hooks if Convex isn't available or no placeId
  if (!hasConvex || !googlePlaceId) {
    return null;
  }

  return (
    <GoogleReviewsInner
      googlePlaceId={googlePlaceId}
      maxReviews={maxReviews}
    />
  );
};

export default GoogleReviews;
