'use client';

export function ArticleImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const fallbacks: Record<string, string> = {
    sedo: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=400',
    domain: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=400',
    marketplace: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=400',
    godaddy: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=400',
    auction: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=400',
    afternic: 'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=400',
    dan: 'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=400',
    namecheap: 'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=400',
    ai: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=400',
    default: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=400',
  };

  const getFallback = (altText: string) => {
    const lower = (altText || '').toLowerCase();
    for (const [key, url] of Object.entries(fallbacks)) {
      if (key !== 'default' && lower.includes(key)) return url;
    }
    return fallbacks.default;
  };

  return (
    <img
      src={src}
      alt={alt || ''}
      {...props}
      className={className || 'w-full rounded-lg'}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.onerror = null;
        img.src = getFallback(alt || '');
      }}
    />
  );
}
