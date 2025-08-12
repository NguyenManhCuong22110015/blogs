// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed sample posts
  const samplePosts = [
    {
      title: '10 Natural Ways to Boost Your Energy',
      slug: '10-natural-ways-boost-energy',
      content: `
        # 10 Natural Ways to Boost Your Energy

        Are you feeling tired and sluggish? Instead of reaching for another cup of coffee, try these natural energy boosters:

        ## 1. Stay Hydrated
        Dehydration is one of the leading causes of fatigue. Make sure to drink at least 8 glasses of water daily.

        ## 2. Get Moving
        Even a 10-minute walk can increase your energy levels for up to 12 hours.

        ## 3. Eat Iron-Rich Foods
        Include spinach, lentils, and lean meats in your diet to combat iron deficiency.

        ## 4. Practice Deep Breathing
        Oxygen fuels your cells. Try the 4-7-8 breathing technique for an instant energy boost.

        ## 5. Soak Up Some Sun
        Natural sunlight helps regulate your circadian rhythm and boosts vitamin D levels.
      `,
      summary: 'Discover natural methods to increase your daily energy levels without caffeine or stimulants. From hydration to sunlight exposure, these simple tips can transform your day.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2024-01-15')
    },
    {
      title: 'The Healing Power of Meditation',
      slug: 'healing-power-meditation',
      content: `
        # The Healing Power of Meditation

        Meditation isn't just about sitting quietly - it's a powerful tool for healing your mind and body.

        ## Scientific Benefits
        - Reduces cortisol levels by up to 23%
        - Improves immune function
        - Lowers blood pressure
        - Enhances emotional well-being

        ## Getting Started
        1. **Find a quiet space** - Even 5 minutes counts
        2. **Focus on your breath** - Don't try to control it, just observe
        3. **Be patient** - Your mind will wander, and that's okay
        4. **Start small** - Begin with 5 minutes daily

        ## Types of Meditation
        - **Mindfulness**: Focus on the present moment
        - **Loving-kindness**: Cultivate compassion
        - **Body scan**: Release physical tension
        - **Walking meditation**: Combine movement with mindfulness

        Remember, meditation is a practice, not perfection.
      `,
      summary: 'Learn how meditation can transform your mental and physical health through daily practice. Explore different types of meditation and discover the science-backed benefits.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2024-01-20')
    },
    {
      title: 'Building Healthy Morning Routines',
      slug: 'healthy-morning-routines',
      content: `
        # Building Healthy Morning Routines

        How you start your day sets the tone for everything that follows. Here's how to create a morning routine that energizes and centers you.

        ## The Power of Consistency
        Your body thrives on routine. When you wake up at the same time daily, your circadian rhythm synchronizes, leading to better sleep and more energy.

        ## Essential Elements
        1. **Hydration First** - Drink a glass of water before anything else
        2. **Movement** - Even 5 minutes of stretching counts
        3. **Mindfulness** - Brief meditation or gratitude practice
        4. **Nutrition** - Fuel your body with whole foods
        5. **Intention Setting** - Choose your focus for the day

        ## Sample 30-Minute Routine
        - 6:00 AM: Wake up, drink water
        - 6:05 AM: 5-minute stretch or yoga
        - 6:10 AM: 5-minute meditation
        - 6:15 AM: Healthy breakfast
        - 6:25 AM: Set intentions for the day
        - 6:30 AM: Ready to start!

        Start with just one element and gradually build your perfect morning.
      `,
      summary: 'Transform your mornings with simple, sustainable routines that boost energy and set a positive tone for your day.',
      status: 'DRAFT' as const
    },
    {
      title: 'The Science of Sleep and Recovery',
      slug: 'science-sleep-recovery',
      content: `
        # The Science of Sleep and Recovery

        Quality sleep isn't a luxury - it's essential for physical and mental recovery.

        ## Why Sleep Matters
        During sleep, your body:
        - Repairs damaged tissues
        - Consolidates memories
        - Releases growth hormones
        - Detoxifies the brain
        - Strengthens the immune system

        ## Sleep Stages Explained
        **Stage 1**: Light sleep, easy to wake
        **Stage 2**: Deeper sleep, body temperature drops
        **Stage 3**: Deep sleep, physical restoration
        **REM Sleep**: Dream stage, mental recovery

        ## Optimizing Your Sleep
        - **Temperature**: Keep bedroom cool (65-68°F)
        - **Light**: Use blackout curtains or eye mask
        - **Sound**: Consider white noise or earplugs
        - **Comfort**: Invest in quality mattress and pillows
        - **Routine**: Same bedtime and wake time daily

        ## Natural Sleep Aids
        - Magnesium supplements
        - Chamomile tea
        - Lavender aromatherapy
        - Reading before bed
        - Warm bath with Epsom salts

        Your recovery starts with quality rest.
      `,
      summary: 'Understand the science behind sleep and discover practical strategies to improve your rest and recovery naturally.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
      status: 'ARCHIVED' as const,
      publishedAt: new Date('2023-12-10')
    }
  ];

  console.log('🌱 Seeding posts...');

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
    console.log(`✅ Created post: ${post.title}`);
  }

  const totalPosts = await prisma.post.count();
  console.log(`🎉 Seeding completed! Total posts: ${totalPosts}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });