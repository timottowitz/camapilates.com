import React from 'react';
import { User } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuthorInfoProps {
  author: BlogPost['author'];
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ author }) => {
  return (
    <EnhancedCard variant="glass" className="p-6 bg-gray-50/80">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
          {author.avatar ? (
            <AvatarImage src={author.avatar} alt={author.name} />
          ) : (
            <AvatarFallback className="bg-bennett-navy text-white">
              <User className="w-8 h-8" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-bennett-navy mb-2">
            {author.name}
          </h3>
          {author.bio && (
            <p className="text-bennett-slate leading-relaxed">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
};

export default AuthorInfo;