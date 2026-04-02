import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  ogImage?: string;
  schema?: object;
}

export const SEO = ({
  title,
  description,
  canonical,
  robots = 'index, follow',
  ogImage = 'https://nationalbenefitalliance.com/og-image.jpg',
  schema
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content="National Benefit Alliance" />
      <meta property="og:description" content="Check eligibility for benefits assistance programs quickly and easily." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
