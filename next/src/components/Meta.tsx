import Head from 'next/head';

const Meta = ({
  title = defaults.title,
  description = defaults.description,
  keywords = defaults.keywords,
}: {
  title?: string;
  description?: string;
  keywords?: string;
}) => {
  return (
    <Head>
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name='theme-color' content='#fff' />
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <link rel='icon' href='/favicon.ico' />
      <link rel='apple-touch-icon' href='/logo192.png' />
      <link rel='manifest' href='/manifest.json' />
      <title>{title}</title>
    </Head>
  );
};

const defaults = {
  title: 'Big Family',
  description: 'Big Family. A multi-level-marketing experience for everyone.',
  keywords: 'Big Family, InTime, ITO, cryptocurrency, multi-level marketing',
};

export default Meta;
