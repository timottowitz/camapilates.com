import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Star, Quote, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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

class GoogleReviewsBoundary extends React.Component<{ children: React.ReactNode; resetKey: string }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; resetKey: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error('GoogleReviews render error:', error);
  }

  componentDidUpdate(prevProps: { children: React.ReactNode; resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
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
const GoogleReviewsInner: React.FC<{ googlePlaceId: string; reviewsPerPage: number }> = ({
  googlePlaceId,
  reviewsPerPage,
}) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  
  // Always call hook unconditionally
  const reviews = useQuery(api.studioEnrichment.getStudioReviews, { googlePlaceId });

  // Don't render anything if loading or no reviews
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = currentPage * reviewsPerPage;
  const displayReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  const goToPrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const hasMultiplePages = totalPages > 1;

  return (
    <section className="scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif italic text-3xl text-[#2A2624]">
          What Clients Say
        </h2>
        <div className="flex items-center gap-4">
          {hasMultiplePages && (
            <span className="text-xs text-[#5D5550]">
              {startIndex + 1}-{Math.min(startIndex + reviewsPerPage, reviews.length)} of {reviews.length}
            </span>
          )}
          <a
            href={`https://search.google.com/local/reviews?placeid=${googlePlaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] flex items-center gap-2 transition-colors"
          >
            All Reviews <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Reviews Grid with Navigation */}
      <div className="relative">
        {/* Navigation Arrows */}
        {hasMultiplePages && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-[#2A2624]/10 shadow-lg flex items-center justify-center hover:bg-[#F9F8F6] hover:border-[#2A2624]/20 transition-all"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-5 h-5 text-[#2A2624]" />
            </button>
            <button
              onClick={goToNext}
              className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-[#2A2624]/10 shadow-lg flex items-center justify-center hover:bg-[#F9F8F6] hover:border-[#2A2624]/20 transition-all"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-5 h-5 text-[#2A2624]" />
            </button>
          </>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayReviews.map((review, index) => (
            <ReviewCard key={`${currentPage}-${index}`} review={review} />
          ))}
        </div>
      </div>

      {/* Page Dots Indicator */}
      {hasMultiplePages && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentPage
                  ? 'bg-[#2A2624] w-4'
                  : 'bg-[#2A2624]/20 hover:bg-[#2A2624]/40'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}

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
  maxReviews = 4,
}) => {
  // Early return before any hooks if Convex isn't available or no placeId
  if (!hasConvex || !googlePlaceId) {
    return null;
  }

  return (
    <GoogleReviewsBoundary resetKey={googlePlaceId}>
      <GoogleReviewsInner
        googlePlaceId={googlePlaceId}
        reviewsPerPage={maxReviews}
      />
    </GoogleReviewsBoundary>
  );
};

export default GoogleReviews;
