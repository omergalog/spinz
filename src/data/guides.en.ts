import type { GuideSection } from './guides';

/**
 * הטקסט האנגלי של המדריכים, לפי slug.
 * המבנה (אייקון, תמונת הירו, סדר הבלוקים) נשאר במקור אחד ב-guides.ts —
 * כאן רק המילים, כדי שתמונה שמתחלפת תתחלף בשתי השפות בבת אחת.
 */
export type GuideTextEn = {
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  facts?: { label: string; value: string }[];
  intro: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
};

export const guidesEn: Record<string, GuideTextEn> = {
  assembly: {
    title: 'Assembling your SPINZ at home',
    summary: 'The bike arrives about 85% assembled. Final assembly takes under 20 minutes, with no prior experience.',
    metaTitle: 'How to assemble a bike at home — step by step | SPINZ',
    metaDescription: 'A complete assembly guide for the SPINZ single speed: what’s in the box, attaching the handlebars, fitting the pedals, setting saddle height and a safety check — in under 20 minutes.',
    readTime: '6 min read',
    facts: [
      { label: 'Time', value: '15–20 minutes' },
      { label: 'Difficulty', value: 'Easy' },
      { label: 'Tools', value: 'Included in the box' },
    ],
    intro:
      'Every SPINZ leaves our warehouse mostly assembled — the frame, wheels, drivetrain and brakes are already fitted and tuned. What’s left for you is attaching a few final parts and tightening them properly: fifteen to thirty minutes of work that needs no prior experience. This guide walks you through it step by step, points out what to watch for, and finishes with a short safety check before your first ride.',
    sections: [
      {
        heading: 'What’s in the box',
        blocks: [
          { type: 'paragraph', text: 'Before you start, lay everything out on a clean surface and check that nothing is missing:' },
          {
            type: 'list',
            items: [
              'The frame, with the rear wheel, drivetrain and brakes already installed.',
              'The front wheel (sometimes fitted, sometimes packed separately).',
              'The handlebars and the stem.',
              'Two pedals — marked L (left) and R (right).',
              'A small tool kit: Allen keys, plus a QR code to the assembly video.',
            ],
          },
          { type: 'tip', text: 'Keep the box and packing materials until you’ve confirmed everything is in order — they’re useful if you ever need to return or ship the bike.' },
        ],
      },
      {
        heading: 'Step by step',
        blocks: [
          {
            type: 'steps',
            items: [
              'Carefully lift the bike out of the box and remove all protective material — foam, tape and cable ties.',
              'Attach the handlebars to the stem: slide the stem into the steerer tube, line it up square to the front wheel, and tighten the Allen bolts gently and evenly (a little on each bolt, in rotation).',
              'If the front wheel came separately, fit it into the fork, close the quick release, and make sure the wheel sits centered between the fork legs.',
              'Thread in the pedals — this is the step you least want to get wrong. The right pedal (R) threads clockwise; the left pedal (L) threads counter-clockwise. Start each one by hand so you don’t cross-thread it.',
              'Set the saddle height with the quick release and close it firmly. Check that the saddle is straight and centered front to back.',
              'Check tire pressure (60–80 PSI is recommended, and it’s printed on the tire wall), then squeeze both brake levers to confirm they bite properly.',
            ],
          },
          { type: 'image', src: '/assets/photo-beige-bike.jpg', alt: 'A fully assembled SPINZ Urban, ready to ride' },
        ],
      },
      {
        heading: 'Safety check before your first ride',
        blocks: [
          { type: 'paragraph', text: 'Two minutes that will save you trouble. Run through this list before you get on:' },
          {
            type: 'list',
            items: [
              'Lift the front wheel and spin it — it should run free and true, without rubbing the brake.',
              'Hold the front wheel and try to twist the handlebars against it — they shouldn’t move. If they do, tighten the stem bolts.',
              'Squeeze each brake in turn and try to push the bike — the matching wheel should lock.',
              'Check that both pedals are threaded all the way in and don’t wobble.',
              'Push down on the saddle and handlebars to confirm they’re solid and don’t slip.',
            ],
          },
          { type: 'tip', text: 'If anything feels loose or you’re unsure, take the bike in for a quick once-over at any bike shop. Every component we use is standard and available across Israel.' },
        ],
      },
    ],
    faq: [
      { q: 'How long does assembly take?', a: '15 to 20 minutes for most people, even with no prior experience. With the included video it’s simpler still.' },
      { q: 'Do I need a mechanic?', a: 'No. Assembly is designed to be done at home and kept simple. That said, if you want complete peace of mind, a quick check at a bike shop afterwards is never a bad idea.' },
      { q: 'What tools do I need?', a: 'The Allen keys you need come in the box. For final pedal tightening you may want a 15 mm wrench or a pedal spanner, if they don’t go all the way in by hand.' },
    ],
  },

  sizing: {
    title: 'Sizing guide: choosing your frame size',
    summary: 'Two frame sizes cover most riders. Your height is the simplest and most accurate way to choose.',
    metaTitle: 'How to choose the right bike size — size chart | SPINZ',
    metaDescription: 'A sizing guide for single-speed bikes: a height chart, the difference between the 54 and 57 frames, the overlap test, and setting saddle height for a comfortable, safe ride.',
    readTime: '4 min read',
    facts: [
      { label: 'Sizes', value: '54 · 57' },
      { label: 'Height range', value: '160–190 cm' },
    ],
    intro:
      'Getting the frame size right is the difference between a ride that feels natural and one that leaves you with a sore back and less control. The SPINZ Urban geometry was designed to be universal and forgiving, which is why two frame sizes are enough to cover most people. This guide shows you how to choose with confidence based on your height, and what to do if you fall between sizes.',
    sections: [
      {
        heading: 'Size chart by height',
        blocks: [
          { type: 'paragraph', text: 'The simplest way to choose is by your height:' },
          {
            type: 'list',
            items: [
              'Size 54 (S) — fits riders 160–175 cm.',
              'Size 57 (L) — fits riders 175–190 cm.',
            ],
          },
          { type: 'paragraph', text: 'These ranges reflect population averages and are a recommendation. Your build, leg length and personal comfort can move you a size up or down.' },
        ],
      },
      {
        heading: 'What if you’re right in the overlap (175 cm)?',
        blocks: [
          { type: 'paragraph', text: 'If you’re right on the line, ask yourself:' },
          {
            type: 'list',
            items: [
              'Want a nimble feel and sharper control in traffic? Go with the 54.',
              'Want a more stretched-out position and stability at speed? Go with the 57.',
              'Long legs relative to your torso? Lean toward the 57. Shorter torso? Lean toward the 54.',
            ],
          },
          { type: 'tip', text: 'When in doubt, take the smaller size. A slightly smaller frame is easier to handle in the city, and you can always raise the saddle.' },
        ],
      },
      {
        heading: 'Setting your saddle height',
        blocks: [
          { type: 'paragraph', text: 'Saddle height is what determines pedaling efficiency and comfort, and the quick release lets you adjust it in seconds. Here’s how to get it right:' },
          {
            type: 'steps',
            items: [
              'Sit on the saddle and put your heel on the pedal at its lowest point.',
              'At the right height, your leg should be almost completely straight with your heel on the pedal.',
              'When you then pedal with the ball of your foot, you’ll have a slight, comfortable bend in the knee — that’s the right height.',
              'Close the quick release firmly and check that the saddle doesn’t sink under your weight.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'What if I’m exactly between two sizes?', a: 'Take the smaller one. It’s more nimble in the city, and the adjustable saddle height easily makes up the difference.' },
      { q: 'Does the same size work for men and women?', a: 'Yes. The geometry is universal, and the fit is dialed in through saddle and handlebar height. Both sizes suit all genders.' },
      { q: 'I’m under 160 cm or over 190 cm. What now?', a: 'Drop us a message and we’ll gladly advise you personally based on your build before you order.' },
    ],
  },

  maintenance: {
    title: 'Routine bike maintenance',
    summary: 'A little regular upkeep keeps the bike smooth, quiet and safe for years.',
    metaTitle: 'Routine bike maintenance — a single-speed guide | SPINZ',
    metaDescription: 'How to maintain a single-speed bike: chain lubrication, cleaning the frame, checking tire pressure, a weekly and monthly routine, and when to see a mechanic — a complete guide.',
    readTime: '5 min read',
    facts: [
      { label: 'Frequency', value: 'Weekly + monthly' },
      { label: 'Difficulty', value: 'Easy' },
    ],
    intro:
      'One of the great advantages of a single speed is simplicity — fewer moving parts, fewer things to go wrong. Even so, a little regular maintenance makes an enormous difference: it keeps the ride quiet, extends the life of your components, and prevents breakdowns exactly when you’re in a hurry. Here is the routine we recommend, broken down by how often to do it.',
    sections: [
      {
        heading: 'Weekly routine — 5 minutes',
        blocks: [
          {
            type: 'list',
            items: [
              'Check tire pressure and inflate as needed (60–80 PSI). Correct pressure saves energy and prevents punctures.',
              'Glance at the chain — if it looks dry or sounds squeaky, it’s time to lube it.',
              'Confirm the brakes bite properly and the levers don’t pull all the way to the bar.',
            ],
          },
        ],
      },
      {
        heading: 'Lubricating the chain — the single most important step',
        blocks: [
          { type: 'paragraph', text: 'A well-lubed chain is the heart of a smooth, quiet ride. Lube it every 2–4 weeks, or straight after riding in the rain:' },
          {
            type: 'steps',
            items: [
              'Wipe the chain with a dry rag to remove old grime.',
              'Drip bike-specific chain lube onto every link while slowly turning the cranks backwards.',
              'Keep turning for a minute so the lube works in, then wipe off the excess thoroughly — leftover lube attracts dust.',
            ],
          },
          { type: 'tip', text: 'Use bike-specific chain lube only. Regular WD-40 or motor oil damage the chain and attract dirt.' },
        ],
      },
      {
        heading: 'Cleaning and storage',
        blocks: [
          {
            type: 'list',
            items: [
              'Wipe the frame with a damp cloth after riding in rain or dust — aluminum holds up fine, but cleaning keeps it looking sharp.',
              'Avoid high-pressure washing, which can force water into the bearings.',
              'Store the bike somewhere dry and under cover. Long exposure to sun and damp shortens the life of tires and grips.',
            ],
          },
        ],
      },
      {
        heading: 'When to see a professional',
        blocks: [
          { type: 'paragraph', text: 'Most maintenance is a home job, but some things call for a mechanic: unusual noises from the bearings, a wheel that wobbles side to side (a buckled wheel), a brake that won’t adjust, or play in the headset. Every component we use is standard, so any bike shop in the country can handle it.' },
        ],
      },
    ],
    faq: [
      { q: 'How often should I lube the chain?', a: 'Every 2–4 weeks with normal use, and always straight after riding in the rain. If the chain squeaks, that’s your cue.' },
      { q: 'Can I hose the bike down?', a: 'Better not at high pressure. A damp cloth and a little mild soap are plenty, and they won’t put your bearings at risk.' },
      { q: 'I got a puncture — what now?', a: 'Our tires are puncture-resistant with an internal protection strip, but flats are still possible. Replacing an inner tube is a simple job that any bike shop does in a few minutes.' },
    ],
  },

  'brakes-drivetrain': {
    title: 'Adjusting brakes and chain tension',
    summary: 'A single speed is simple to maintain. A few basic adjustments keep braking sharp and the drivetrain quiet.',
    metaTitle: 'Brake adjustment and chain tension for single-speed bikes | SPINZ',
    metaDescription: 'An adjustment guide: how to set up V-brakes and dual-pivot calipers, tension a brake cable, check single-speed chain tension, and know when to replace pads — step by step.',
    readTime: '5 min read',
    facts: [
      { label: 'Difficulty', value: 'Moderate' },
      { label: 'Tools', value: '5 mm Allen key' },
    ],
    intro:
      'Sharp brakes and correct chain tension are a matter of safety, not just comfort. The good news: on a single speed there are no gears to fuss with, so it all comes down to a handful of simple adjustments. This guide covers brake setup, chain tension and spotting wear — all with tools you have at home.',
    sections: [
      {
        heading: 'How a properly set brake should feel',
        blocks: [
          { type: 'paragraph', text: 'The lever should bite at roughly 50% of its travel — not instantly, but well before it touches the handlebar. The pads should meet the rim squarely, without ever touching the tire itself.' },
        ],
      },
      {
        heading: 'Setting pad clearance and cable tension',
        blocks: [
          {
            type: 'steps',
            items: [
              'Spin the wheel and check that the pads aren’t rubbing it while the brake is released.',
              'If the brake feels loose (the lever pulls too far), tighten the cable: slightly loosen the anchor bolt at the caliper, pull the cable a little tighter, and clamp it again.',
              'For fine adjustment, use the barrel adjuster at the base of the lever — turning it out moves the pads closer to the rim.',
              'Make sure both pads meet the rim at the same time and flat against it. If one side sits closer, even it out with the centering screws.',
            ],
          },
          { type: 'tip', text: 'A pad that touches the tire instead of the rim is dangerous — it can wear through the sidewall. Always check the pad sits fully on the metal braking surface.' },
        ],
      },
      {
        heading: 'Chain tension on a single speed',
        blocks: [
          { type: 'paragraph', text: 'Unlike a geared bike, a single speed has a fixed chain tension that needs to be right — neither too slack nor too tight:' },
          {
            type: 'steps',
            items: [
              'Press on the chain midway between the chainring and the rear cog. It should move about 1–1.5 cm up and down.',
              'If it’s too loose (it skips) or too tight (hard to pedal), adjust the rear wheel position in the dropouts.',
              'Slightly loosen the wheel nuts, slide the wheel back to tighten or forward to loosen, check it sits centered and straight, then tighten firmly.',
            ],
          },
          { type: 'tip', text: 'Chain tension needs precision. If you’re not confident, it’s a five-minute job for any bike mechanic.' },
        ],
      },
      {
        heading: 'When to replace brake pads',
        blocks: [
          { type: 'paragraph', text: 'Brake pads have wear grooves. Once the grooves have nearly disappeared, or braking still feels weak after adjustment, it’s time to replace them. Pads are a cheap consumable available at any shop.' },
        ],
      },
    ],
    faq: [
      { q: 'My brake squeals — is that normal?', a: 'A light squeal in the wet is normal. A constant squeal points to dirty pads, a bad contact angle, or wear — clean them and readjust.' },
      { q: 'The chain skips while pedaling — what’s wrong?', a: 'In most cases the chain is too slack. Tension it by moving the rear wheel back. If it persists, the cog may be worn.' },
      { q: 'Are the parts standard?', a: 'Yes. Our brakes, chain and cogs are all standard sizes, available at any bike shop in Israel.' },
    ],
  },

  'city-safety': {
    title: 'Riding safely on city streets',
    summary: 'Safe city riding starts with the right gear, good habits and knowing the road rules.',
    metaTitle: 'Bicycle safety in the city — a complete guide | SPINZ',
    metaDescription: 'A safety guide for city cyclists: essential gear, Israeli road rules for bikes, signaling and road positioning, common hazards, and riding at night and in the rain.',
    readTime: '6 min read',
    facts: [
      { label: 'Helmet', value: 'Required under 18' },
      { label: 'Lights', value: 'Required at night' },
    ],
    intro:
      'The city is where a SPINZ belongs — but it’s also a fast-moving environment that demands attention. Most urban cycling accidents are avoidable with a few simple habits and the right gear. This guide brings together what matters most for riding the city with confidence, in line with both the law and common sense.',
    sections: [
      {
        heading: 'Essential safety gear',
        blocks: [
          {
            type: 'list',
            items: [
              'Helmet — always wear one, even for short trips. By law it’s required for riders under 18, and strongly recommended for everyone.',
              'Lights — a white front light and a red rear light are legally required after dark, and worth using on overcast days too.',
              'Reflectors on the wheels and pedals make a real difference to how visible you are.',
              'A bell — useful for warning pedestrians and other riders.',
            ],
          },
        ],
      },
      {
        heading: 'Road rules for cyclists',
        blocks: [
          {
            type: 'list',
            items: [
              'Ride with the flow of traffic, on the right-hand side of the road or in the bike lane where one exists.',
              'Stop at red lights and stop signs — the same rules apply to bikes as to motor vehicles.',
              'Riding on a pedestrian sidewalk is not allowed unless it is explicitly marked for bicycles.',
              'You may not carry a passenger on a bike not built for it, and you may not ride with earphones in both ears.',
            ],
          },
        ],
      },
      {
        heading: 'Signaling and road positioning',
        blocks: [
          {
            type: 'steps',
            items: [
              'Signal clearly with your hand before every turn or lane change — arm extended in the direction you’re going.',
              'Hold a straight, predictable line. Sudden movements confuse drivers.',
              'Make eye contact with drivers at junctions before you cross — never assume they’ve seen you.',
              'Ride at least an open-door’s width away from parked cars (the “door zone”).',
            ],
          },
          { type: 'tip', text: 'The most common urban hazard is getting “doored” — a driver opening a door without looking. Ride a little further from parked cars than feels intuitive.' },
        ],
      },
      {
        heading: 'Riding at night and in the rain',
        blocks: [
          {
            type: 'list',
            items: [
              'At night: turn your lights on, wear something light-colored or reflective, and slow down at dark junctions.',
              'In the rain: leave more braking distance — braking on a wet rim takes longer. Brake early and gently.',
              'Watch for slick surfaces: crosswalk stripes, manhole covers and road markings all get slippery when wet.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'Is a helmet legally required?', a: 'In Israel a helmet is legally required for riders under 18 everywhere, and for all ages on intercity roads. In the city it is strongly recommended for everyone.' },
      { q: 'Can I ride on the sidewalk?', a: 'As a rule no, unless the sidewalk is explicitly marked for cycling. Ride on the right-hand side of the road or in a dedicated bike lane.' },
      { q: 'What lights do I need at night?', a: 'A white front light and a red rear light are required after dark, along with reflectors. They’re cheap and they save lives.' },
    ],
  },

  'tel-aviv-routes': {
    title: 'Our favorite bike routes in Tel Aviv',
    summary: 'Four routes worth starting with to get to know the city — from the sea to the boulevards.',
    metaTitle: 'Bike routes in Tel Aviv — 4 recommended rides | SPINZ',
    metaDescription: 'Our favorite cycling routes in Tel Aviv: the seaside promenade, Yarkon Park, Rothschild Boulevard and Jaffa Port — distances, highlights and tips.',
    readTime: '5 min read',
    facts: [
      { label: 'Routes', value: '4 recommended' },
      { label: 'Level', value: 'Beginner and up' },
    ],
    intro:
      'Tel Aviv is one of the friendliest cycling cities in the world — flat, full of dedicated paths, and all of it within pedaling distance of the sea. We’ve put together four favorite routes that work well even for beginners, each with its own character. Grab a water bottle, pump up the tires, and go.',
    sections: [
      {
        heading: 'The seaside promenade — Tel Aviv Port to Jaffa',
        blocks: [
          { type: 'paragraph', text: 'The classic and most spectacular ride: an uninterrupted bike path along the shoreline, from Tel Aviv Port in the north to the old port of Jaffa in the south. About 8 km each way, completely flat, with sea views the whole way. Perfect at sunset.' },
          { type: 'image', src: '/assets/photo-olive-lifestyle.jpg', alt: 'Riding a SPINZ along the Tel Aviv seaside promenade' },
        ],
      },
      {
        heading: 'Yarkon Park — green and calm',
        blocks: [
          { type: 'paragraph', text: 'When you want to escape the traffic, Yarkon Park offers kilometers of green paths along the river, well away from cars. Great for families, for an easy cruise, and as a gentle start if you’re new to the saddle.' },
        ],
      },
      {
        heading: 'Rothschild Boulevard — the urban classic',
        blocks: [
          { type: 'paragraph', text: 'The central bike path along Rothschild is the beating heart of city riding in Tel Aviv. Bauhaus architecture on both sides, coffee kiosks along the way, and an atmosphere that is Tel Aviv at its best. Link it up with Ben Gurion Boulevard for a lovely loop.' },
        ],
      },
      {
        heading: 'Jaffa Port — finish with coffee by the sea',
        blocks: [
          { type: 'paragraph', text: 'A natural continuation of the promenade: the alleyways of Old Jaffa, the restored port, and terraces looking out over the water. A perfect place to stop for a coffee before heading back the same way or through the Neve Tzedek neighborhood.' },
          { type: 'tip', text: 'Most of these routes are flat and well suited to a single speed. Bring a water bottle, a good lock for stops, and a hat or sunscreen in summer.' },
        ],
      },
    ],
    faq: [
      { q: 'Are these routes suitable for a single speed?', a: 'Absolutely. Tel Aviv is almost entirely flat, and every route here is comfortable without gears.' },
      { q: 'Where can I park the bike along the way?', a: 'There are bike racks and cafés all along these routes. Always use a good lock when you stop in the city.' },
      { q: 'Are they good for families and beginners?', a: 'Yes — especially Yarkon Park and the seaside promenade, which are flat, separated from traffic and relaxed.' },
    ],
  },
};
