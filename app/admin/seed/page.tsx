'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, Database } from 'lucide-react';

const seedArticles = [
  {
    title: 'The Quiet Revolution: How AI Is Reshaping Creative Work',
    slug: 'ai-reshaping-creative-work',
    excerpt: 'Artificial intelligence is no longer just a tool for analysis. It is becoming a creative partner, and the implications for artists, writers, and designers are profound.',
    cover_image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'A robotic hand reaching into a digital network, symbolizing AI technology',
    category_slug: 'technology',
    tag_slugs: ['ai', 'innovation', 'design', 'culture'],
    featured: true,
    is_pinned: true,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    seo_title: 'How AI Is Reshaping Creative Work | Bliss Media',
    meta_description: 'AI is becoming a creative partner for artists and designers.',
    reading_time: 5,
    view_count: 3200,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Not long ago, the idea of a machine writing a poem or composing a melody felt like science fiction. Today, it is a daily reality. But the real story is not about machines replacing artists — it is about how they are changing what it means to create.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'A New Kind of Collaboration' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'The most interesting work happening at the intersection of AI and creativity is not about automation. It is about ' }, { type: 'text', text: 'collaboration', marks: [{ type: 'bold' }] }, { type: 'text', text: '. Designers are using generative models to explore hundreds of variations in the time it once took to sketch three.' }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The tool does not replace the craftsman. It expands the range of what the craftsman can imagine.', marks: [{ type: 'italic' }] }] }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Anxiety Beneath the Excitement' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'For every artist embracing these tools, there are many more who are wary — and rightfully so. The economic structures that sustained creative professions are under pressure.' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'What Comes Next' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'The artists who thrive will be those who treat these tools not as threats or magic, but as what they are: a new kind of instrument, demanding a new kind of skill.' }] },
    ],
  },
  {
    title: 'The Streaming Wars Enter a New Phase',
    slug: 'streaming-wars-new-phase',
    excerpt: 'As subscriber growth plateaus, platforms are pivoting to ad-supported tiers, live events, and bundling strategies. The era of unlimited streaming is ending.',
    cover_image: 'https://images.pexels.com/photos/7234386/pexels-photo-7234386.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Popcorn in a themed bucket with movie bokeh background',
    category_slug: 'entertainment',
    tag_slugs: ['streaming', 'film', 'culture'],
    featured: false,
    is_pinned: true,
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    seo_title: 'The Streaming Wars Enter a New Phase | Bliss Media',
    meta_description: 'Streaming platforms pivot to ad-supported tiers and bundling.',
    reading_time: 4,
    view_count: 1800,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'The golden age of streaming is over. What comes next will look very different.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Plateau' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'For a decade, streaming platforms chased subscriber growth at all costs. Now, the major platforms are confronting a simple reality: most households that want streaming already have it.' }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Streaming is starting to look a lot like cable — the thing it was supposed to replace.', marks: [{ type: 'italic' }] }] }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Bundling Is Back' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'The most telling sign of the new era is the return of the bundle. Platforms are partnering with each other to offer combined packages.' }] },
    ],
  },
  {
    title: 'The Art of Slow Mornings: Reclaiming the First Hour',
    slug: 'art-of-slow-mornings',
    excerpt: 'In a world of instant notifications and overflowing inboxes, a growing movement is making the case for starting the day deliberately, slowly, and without a screen.',
    cover_image: 'https://images.pexels.com/photos/14529354/pexels-photo-14529354.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'A woman enjoying coffee at a café',
    category_slug: 'lifestyle',
    tag_slugs: ['wellness', 'culture', 'design'],
    featured: false,
    is_pinned: true,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    seo_title: 'The Art of Slow Mornings | Bliss Media',
    meta_description: 'A growing movement is making the case for starting the day without a screen.',
    reading_time: 4,
    view_count: 2400,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'There is a particular kind of anxiety that comes from reaching for your phone before you have even opened your eyes. Most of us know it. Many of us do it anyway.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Case for the First Hour' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'The slow morning movement is not about productivity hacks. It is about the idea that how you start your day shapes how you experience it.' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Waking up without an alarm, when possible' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Spending the first thirty minutes without looking at a screen' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Making coffee or tea with attention, as a small ritual' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reading something physical — a book, a magazine' }] }] },
      ] },
      { type: 'paragraph', content: [{ type: 'text', text: 'None of this is revolutionary. That is the point. The slow morning is a return to something most humans did for most of history.' }] },
    ],
  },
  {
    title: 'The Startup Reset: Why Fundraising Has Fundamentally Changed',
    slug: 'startup-reset-fundraising-changed',
    excerpt: 'The era of easy money is over. Founders are navigating a landscape where profitability matters more than growth.',
    cover_image: 'https://images.pexels.com/photos/7379/startup-photos.jpg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Laptop on wooden desk with pen and notepad',
    category_slug: 'business',
    tag_slugs: ['startups', 'markets', 'innovation'],
    featured: false,
    is_pinned: true,
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    seo_title: 'The Startup Reset: How Fundraising Has Changed | Bliss Media',
    meta_description: 'Founders navigate a new landscape where profitability matters more than growth.',
    reading_time: 4,
    view_count: 1500,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'For founders who started companies in the last decade, the fundraising environment was unusually forgiving. That world is gone.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The New Priorities' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Investors have not stopped investing. But they are asking different questions. Where growth was once the primary metric, ' }, { type: 'text', text: 'unit economics and a clear path to profitability', marks: [{ type: 'bold' }] }, { type: 'text', text: ' are now at the top of the diligence checklist.' }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The best founders I see are not mourning the old days. They are building companies that do not need cheap capital to survive.', marks: [{ type: 'italic' }] }] }] },
    ],
  },
  {
    title: 'Cities on the Front Line: How Urban Centers Are Adapting to Climate Change',
    slug: 'cities-adapting-climate-change',
    excerpt: 'From flood-resistant infrastructure to urban forests, cities around the world are racing to adapt to a changing climate.',
    cover_image: 'https://images.pexels.com/photos/1461370/pexels-photo-1461370.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Skyscrapers of New York City from the Brooklyn Bridge',
    category_slug: 'news',
    tag_slugs: ['climate', 'culture', 'innovation'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    seo_title: 'Cities Adapting to Climate Change | Bliss Media',
    meta_description: 'How urban centers are racing to adapt to a changing climate.',
    reading_time: 5,
    view_count: 900,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'When the images of flooded streets appear on the news, they are almost always from cities. Urban centers are on the front lines of climate change. And they are beginning to fight back.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Rethinking the Urban Surface' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Cities are now ripping up concrete and replacing it with permeable surfaces, green roofs, and urban wetlands.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Equity Question' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Climate adaptation does not affect everyone equally. Low-income neighborhoods are often the most exposed to flooding and heat, and the least likely to have green infrastructure.' }] },
    ],
  },
  {
    title: 'The New Space Race: Private Enterprise Beyond Earth',
    slug: 'new-space-race-private-enterprise',
    excerpt: 'The commercialization of space is accelerating. With launch costs falling, the economic case for space is being rewritten.',
    cover_image: 'https://images.pexels.com/photos/586054/pexels-photo-586054.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'SpaceX rocket launch against a colorful dusk sky',
    category_slug: 'technology',
    tag_slugs: ['innovation', 'ai', 'privacy'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    seo_title: 'The New Space Race: Private Enterprise | Bliss Media',
    meta_description: 'The commercialization of space is accelerating as launch costs fall.',
    reading_time: 4,
    view_count: 1100,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'A decade ago, space was the domain of governments. Today, it is a commercial industry — and one of the fastest-growing sectors in the global economy.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Cost Revolution' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Reusable rockets have driven the cost per kilogram to orbit down by an order of magnitude, and the trend shows no sign of stopping.' }] },
    ],
  },
  {
    title: 'The Podcast Boom Is Maturing. What Comes Next?',
    slug: 'podcast-boom-maturing-whats-next',
    excerpt: 'After years of explosive growth, the podcast industry is consolidating. The platforms that survive will solve discovery and monetization.',
    cover_image: 'https://images.pexels.com/photos/31213674/pexels-photo-31213674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Professional microphone on a boom arm in a minimalist studio',
    category_slug: 'entertainment',
    tag_slugs: ['streaming', 'culture'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    seo_title: 'The Podcast Boom Is Maturing | Bliss Media',
    meta_description: 'After years of explosive growth, the podcast industry is consolidating.',
    reading_time: 3,
    view_count: 800,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'The podcast industry has grown from a niche hobby to a multi-billion dollar media sector in less than a decade. But the boom years are giving way to a more mature market.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Discovery Problem' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'There are over five million podcasts in existence. The average listener subscribes to fewer than ten. The gap between those numbers is the industry\u2019s biggest challenge.' }] },
    ],
  },
  {
    title: 'The Return of Tailored Clothing',
    slug: 'return-of-tailored-clothing',
    excerpt: 'After a decade of athleisure dominance, tailored clothing is making a comeback — more relaxed, personal, and less bound by tradition.',
    cover_image: 'https://images.pexels.com/photos/18303033/pexels-photo-18303033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Stylish woman in dark urban fashion on city street',
    category_slug: 'lifestyle',
    tag_slugs: ['culture', 'design', 'wellness'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    seo_title: 'The Return of Tailored Clothing | Bliss Media',
    meta_description: 'After a decade of athleisure, tailored clothing is back.',
    reading_time: 3,
    view_count: 600,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'For years, the trend in fashion was clear: looser, softer, more casual. Then, quietly, something shifted.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Structure Returns' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Tailored clothing is back, but it does not look like it did a decade ago. The new tailoring is softer, more relaxed, and more individual.' }] },
    ],
  },
  {
    title: 'Markets in Transition: Reading the Signals',
    slug: 'markets-in-transition-reading-signals',
    excerpt: 'Inflation is cooling, but the economic picture remains complex. Here is what the data is telling us — and what it is not.',
    cover_image: 'https://images.pexels.com/photos/16594725/pexels-photo-16594725.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Financial trading screen with colorful charts and data',
    category_slug: 'business',
    tag_slugs: ['markets', 'startups'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    seo_title: 'Markets in Transition: Reading the Signals | Bliss Media',
    meta_description: 'Inflation is cooling but the economic picture remains complex.',
    reading_time: 4,
    view_count: 700,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Reading the economy is harder than it looks. The headlines say one thing, the data says another, and the lived experience of most people says a third.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Good News' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Inflation is trending down. Employment remains relatively strong. The most apocalyptic predictions have not come to pass.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Less Good News' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Beneath the aggregate data, the picture is uneven. Many households are still feeling the cumulative effect of several years of inflation.' }] },
    ],
  },
  {
    title: 'The Housing Crisis Is a Policy Choice',
    slug: 'housing-crisis-policy-choice',
    excerpt: 'Cities around the world are facing an unprecedented housing affordability crisis. The solutions are known. What is missing is political will.',
    cover_image: 'https://images.pexels.com/photos/24589244/pexels-photo-24589244.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'NYC skyline with skyscrapers and Brooklyn Bridge at sunset',
    category_slug: 'news',
    tag_slugs: ['climate', 'culture'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    seo_title: 'The Housing Crisis Is a Policy Choice | Bliss Media',
    meta_description: 'Cities face an unprecedented housing affordability crisis. The solutions are known.',
    reading_time: 4,
    view_count: 500,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'In nearly every major city in the developed world, housing costs have outpaced incomes for decades. This is not an act of nature. It is a policy choice.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'How We Got Here' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'The crisis has many causes, but they converge on a single mechanism: ' }, { type: 'text', text: 'supply constraints', marks: [{ type: 'bold' }] }, { type: 'text', text: '. Zoning laws, permitting processes, and environmental reviews together produce a system that makes it nearly impossible to build enough housing.' }] },
    ],
  },
  {
    title: 'The Case for Digital Privacy in an Age of Surveillance',
    slug: 'case-for-digital-privacy',
    excerpt: 'As our lives move online, who controls the data we leave behind is one of the defining questions of our time.',
    cover_image: 'https://images.pexels.com/photos/25626449/pexels-photo-25626449.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Abstract representation of vectorized patterns and symbols',
    category_slug: 'technology',
    tag_slugs: ['privacy', 'ai', 'culture'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    seo_title: 'The Case for Digital Privacy | Bliss Media',
    meta_description: 'Who controls the data we leave behind is one of the defining questions of our time.',
    reading_time: 3,
    view_count: 1200,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Privacy is often framed as a trade-off: give up some of your data, get free services in return. This framing is convenient for the companies that collect the data. It is also wrong.' }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Privacy is not about having something to hide. It is about having the power to decide what the world knows about you.', marks: [{ type: 'italic' }] }] }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'The tools for reclaiming privacy are better than ever. The question is whether enough people will choose to use them.' }] },
    ],
  },
  {
    title: 'The Live Music Renaissance',
    slug: 'live-music-renaissance',
    excerpt: 'After years of disruption, live music is back — and bigger than ever. But the economics of touring are shifting.',
    cover_image: 'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    cover_alt: 'Energetic live music concert with performers on stage',
    category_slug: 'entertainment',
    tag_slugs: ['streaming', 'culture'],
    featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    seo_title: 'The Live Music Renaissance | Bliss Media',
    meta_description: 'Live music is back and bigger than ever, but the economics of touring are shifting.',
    reading_time: 3,
    view_count: 400,
    body: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Live music is experiencing a boom unlike anything the industry has seen before. Stadium tours are selling out in minutes. After years of disruption, audiences are hungry for shared experiences.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Concentration Problem' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'A handful of artists are capturing the majority of ticket revenue. Mid-tier and emerging artists are struggling to make touring economics work.' }] },
    ],
  },
];

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/seed-articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: seedArticles }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Seed failed');
        setResult(`Error: ${data.error}`);
      } else {
        toast.success(data.message || 'Articles seeded successfully');
        setResult(data.message);
      }
    } catch (e) {
      toast.error('Network error');
      setResult('Network error. Please try again.');
    }
    setSeeding(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Database className="w-6 h-6 text-gold" />
        <h1 className="font-serif text-3xl font-bold">Seed Content</h1>
      </div>
      <p className="text-muted-foreground font-sans text-sm mt-1 mb-8">
        Populate the database with sample articles to test the platform.
      </p>

      <div className="bg-card border border-border rounded-sm p-8">
        <div className="flex items-start gap-4 mb-6">
          <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-sans font-semibold mb-1">Seed Sample Articles</h2>
            <p className="text-sm text-muted-foreground font-sans">
              This will insert 12 sample articles across all five categories
              with cover images, tags, and rich text content. The articles will
              be assigned to the first admin user.
            </p>
          </div>
        </div>

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-foreground text-sm font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {seeding ? 'Seeding…' : 'Seed Articles'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-sm">
            <p className="text-sm font-sans text-foreground">{result}</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-muted/30 border border-border rounded-sm">
        <p className="text-xs text-muted-foreground font-sans">
          Note: You must create an admin account first via the Admin Setup page
          before seeding articles. The seed function assigns articles to the
          first admin user found in the database.
        </p>
      </div>
    </div>
  );
}
