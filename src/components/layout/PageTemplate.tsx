import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/ui/scroll-to-top';
import ReadingProgress from '@/components/ui/reading-progress';
import SectionHeader from '@/components/ui/section-header';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';
import { getCalApi } from '@calcom/embed-react';

import { Button } from '../ui/button';

interface PageTemplateProps {
  children: React.ReactNode;
  showReadingProgress?: boolean;
  className?: string;
  heroSection?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  pageDescription?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  showReadingProgress = false,
  className,
  heroSection,
  sidebarContent,
  pageTitle,
  pageSubtitle,
  pageDescription,
  breadcrumbs
}) => {
  useEffect(() => {
    (async function () {
        const cal = await getCalApi({"namespace":"client-interviews","embedJsUrl":"https://calendar.bennettlegal.com/embed/embed.js"});
        cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
      })();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      {showReadingProgress && <ReadingProgress />}
      <Header />

      {heroSection}

      <main className={cn('container mx-auto px-4 py-24', className)}>
        <div className='max-w-7xl mx-auto'>
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <nav className='mb-8' aria-label='Breadcrumb'>
              <ol className='flex items-center space-x-2 text-sm text-bennett-slate'>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className='flex items-center'>
                    {index > 0 && <span className='mx-2 text-gray-400'>/</span>}
                    <a
                      href={crumb.href}
                      className='hover:text-bennett-navy transition-colors'
                    >
                      {crumb.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Page Header */}
          {pageTitle && (
            <div className='mb-16'>
              <SectionHeader
                title={pageTitle}
                subtitle={pageSubtitle}
                description={pageDescription}
                size='lg'
                accent='gold'
              />
            </div>
          )}

          {/* Content Layout */}
          <div
            className={cn(
              'grid gap-16',
              sidebarContent ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {/* Main Content */}
            <div
              className={cn(sidebarContent ? 'lg:col-span-2' : 'col-span-1')}
            >
              <div className='max-w-5xl'>{children}</div>
            </div>

            {/* Sidebar */}
            {sidebarContent && (
              <div className='lg:col-span-1'>
                <div className='sticky top-24 space-y-8'>
                  <EnhancedCard
                    variant='glass'
                    className='bg-blue-100/80 border-blue-200 p-8'
                  >
                    <div className='space-y-6'>
                      <div className='space-y-2'>
                        <h3 className='text-xl font-bold my-2'>
                          <span className='text-3xl text-red-600 italic'>
                            Scammed?
                          </span>
                        </h3>
                        <p className='font-medium'>
                          Average Loan Size of{' '}
                          <span className='text-green-600 font-bold'>
                            $65,000
                          </span>
                        </p>
                        <p className='text-bennett-navy font-bold'>
                          Pay $0 Until We Win
                        </p>
                      </div>
                      <Button
                        data-cal-namespace="client-interviews"
                        data-cal-link="ana/client-interviews"
                        data-cal-origin="https://calendar.bennettlegal.com"
                        data-cal-config='{"layout":"month_view"}'
                        className='w-full bg-bennett-navy hover:bg-bennett-navy/90 text-white font-semibold'
                      >
                        Book Your Free Call
                      </Button>
  
                    </div>
                  </EnhancedCard>

                  {sidebarContent}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default PageTemplate;
