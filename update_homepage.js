const fs = require('fs');
let code = fs.readFileSync('src/components/HomePageClient.tsx', 'utf8');

// Replace featuredRooms and testimonials definitions (removing them from top level)
code = code.replace(/const featuredRooms = \[[\s\S]*?\];\n\n/, '');
code = code.replace(/const testimonials = \[[\s\S]*?\];\n\n/, '');

// Inside the component, use dict
code = code.replace(
  /export default function HomePageClient\(\{ lang, dict \}: \{ lang: string, dict: any \}\) \{/,
  'export default function HomePageClient({ lang, dict }: { lang: string, dict: any }) {\n  const featuredRooms = dict.accommodations?.featuredRooms || [];\n  const testimonials = dict.reviews?.testimonials || [];\n'
);

// Replace facilities section
code = code.replace(
  /\{ icon: BedDouble, label: "Luxury Suites", href: "\/rooms" \},/,
  '{ icon: BedDouble, label: dict.facilities?.luxurySuites || "Luxury Suites", href: `/${lang}/rooms` },'
);
code = code.replace(
  /\{ icon: Users, label: "Grand Ballroom", href: "\/conference" \},/,
  '{ icon: Users, label: dict.facilities?.grandBallroom || "Grand Ballroom", href: `/${lang}/conference` },'
);
code = code.replace(
  /\{ icon: Utensils, label: "Fine Dining", href: "\/dining" \},/,
  '{ icon: Utensils, label: dict.facilities?.fineDining || "Fine Dining", href: `/${lang}/dining` },'
);
code = code.replace(
  /\{ icon: Coffee, label: "Rooftop Lounge", href: "\/dining" \},/,
  '{ icon: Coffee, label: dict.facilities?.rooftopLounge || "Rooftop Lounge", href: `/${lang}/dining` },'
);
code = code.replace(
  /\{ icon: Waves, label: "Pool & Spa", href: "\/wellness" \},/,
  '{ icon: Waves, label: dict.facilities?.poolSpa || "Pool & Spa", href: `/${lang}/wellness` },'
);
code = code.replace(
  /\{ icon: MapPin, label: "Prime Location", href: "\/contact" \},/,
  '{ icon: MapPin, label: dict.facilities?.primeLocation || "Prime Location", href: `/${lang}/contact` },'
);

// Why Hollywood Hotel section
code = code.replace(
  /<h2 className="text-sm font-bold text-gold uppercase tracking-widest">Why Hollywood Hotel<\/h2>/,
  '<h2 className="text-sm font-bold text-gold uppercase tracking-widest">{dict.why?.label}</h2>'
);
code = code.replace(
  /A Grand Stage for<br \/><span className="text-gold underline decoration-8 underline-offset-4">Every Occasion<\/span>/,
  '{dict.why?.titleLine1}<br /><span className="text-gold underline decoration-8 underline-offset-4">{dict.why?.titleLine2}</span>'
);
code = code.replace(
  /Hollywood Hotel is more than just a place to stay\. It is a world unto itself  with over 100 rooms and suites, three event halls seating up to 350 guests, a rooftop lounge bar, a full-service spa, and an Olympic-sized swimming pool\. Whatever brings you here, we make it unforgettable\./,
  '{dict.why?.description}'
);
code = code.replace(
  /\[\s*"Over 100 luxury rooms and suites across 5 tiers",\s*"Three event halls for any occasion  from boardroom to grand gala",\s*"Rooftop Lounge & Bar with panoramic city views",\s*"Full-service Spa, Pool & Wellness Centre",\s*"Shuttle service and prime city-centre location",\s*\]\.map\(\(text, i\)/,
  '(dict.why?.features || []).map((text: string, i: number)'
);
code = code.replace(
  /Explore our suites/,
  '{dict.why?.exploreSuites}'
);
code = code.replace(
  /href="\/rooms"/,
  'href={`/${lang}/rooms`}'
);

// Our Accommodations section
code = code.replace(
  /<h2 className="text-sm font-bold text-gold uppercase tracking-widest">Our Accommodations<\/h2>/,
  '<h2 className="text-sm font-bold text-gold uppercase tracking-widest">{dict.accommodations?.label}</h2>'
);
code = code.replace(
  /Featured Suites/,
  '{dict.accommodations?.title}'
);
code = code.replace(
  /From elegant deluxe rooms to our world-class Presidential Suite, every stay is a statement\./,
  '{dict.accommodations?.description}'
);

code = code.replace(
  /\{featuredRooms\.map\(\(room, index\) => \(/,
  '{featuredRooms.map((room: any, index: number) => ('
);

code = code.replace(
  /\$room\.price\}\/night/,
  '${room.price || (index === 0 ? 120 : index === 1 ? 300 : 800)}{dict.accommodations?.perNight}'
);
code = code.replace(
  /Reserve Now/,
  '{dict.accommodations?.reserveNow}'
);
code = code.replace(
  /href=\{`\/book\?room=\$\{encodeURIComponent\(room\.name\)\}`\}/,
  'href={`/${lang}/book?room=${encodeURIComponent(room.name)}`}'
);


// Reviews section
code = code.replace(
  /<h2 className="text-sm font-bold text-gold uppercase tracking-widest">Reviews<\/h2>/,
  '<h2 className="text-sm font-bold text-gold uppercase tracking-widest">{dict.reviews?.label}</h2>'
);
code = code.replace(
  /<h3 className="text-4xl md:text-5xl font-heading font-black text-black">What Our Guests Say<\/h3>/,
  '<h3 className="text-4xl md:text-5xl font-heading font-black text-black">{dict.reviews?.title}</h3>'
);
code = code.replace(
  /Stories from guests who have experienced the Hollywood Hotel difference\./,
  '{dict.reviews?.description}'
);
code = code.replace(
  /\{testimonials\.map\(\(t, index\) => \(/,
  '{testimonials.map((t: any, index: number) => ('
);


// CTA section
code = code.replace(
  /<h2 className="text-4xl md:text-5xl font-heading font-black text-black mb-6">Ready to Experience Hollywood\?<\/h2>/,
  '<h2 className="text-4xl md:text-5xl font-heading font-black text-black mb-6">{dict.cta?.title}</h2>'
);
code = code.replace(
  /Book your stay today and step into a world where every detail is designed to impress\./,
  '{dict.cta?.description}'
);
code = code.replace(
  /<span className="relative z-10">Book Your Stay Now<\/span>/,
  '<span className="relative z-10">{dict.cta?.button}</span>'
);
code = code.replace(
  /href="\/book"/,
  'href={`/${lang}/book`}'
);

fs.writeFileSync('src/components/HomePageClient.tsx', code);
console.log('HomePageClient.tsx updated successfully!');
