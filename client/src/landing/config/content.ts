// All landing-page copy and data in one place so Malika (or whoever edits the
// site) never has to dig through layout code to change a price or a sentence.

export const contact = {
  instagramHandle: 'malikascakeboutique',
  instagramUrl: 'https://www.instagram.com/malikascakeboutique/',
  email: 'orders@malikacakes.co.za',
  location: 'Midrand, Johannesburg',
  /**
   * WhatsApp number in international format without "+" or spaces, e.g. "27712345678".
   * Left empty until the real number is confirmed. While empty, the secondary CTA
   * points to Instagram instead, so customers are never sent to a wrong number.
   */
  whatsappNumber: '',
};

/** Malika's own accounts (all the same handle). Shown in the footer and the mobile menu. */
export const socials = [
  { label: 'Instagram', url: 'https://www.instagram.com/malikascakeboutique/' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@malikascakeboutique' },
  { label: 'Facebook', url: 'https://www.facebook.com/malikascakeboutique/' },
];

export const whatsappUrl = contact.whatsappNumber
  ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent("Hi Malika! I'd like to ask about a cake.")}`
  : null;

/** Base prices match the order form catalog (prisma/seed). Update both together. */
export const sizes = [
  { name: 'Bento', serves: 'Serves 1', price: 250, note: 'A mini cake, just for you' },
  { name: '15cm Round', serves: 'Serves 6–8', price: 400, note: 'Small gatherings' },
  { name: '20cm Round', serves: 'Serves 12–15', price: 550, note: 'Our most loved', featured: true },
  { name: '2-Tier', serves: 'Serves 20–25', price: 750, note: 'Two rounds, stacked' },
  { name: '3-Tier', serves: 'Serves 30–40', price: 950, note: 'For the big day' },
  { name: 'Cupcakes', serves: 'Per dozen', price: 200, note: 'Minimum one dozen' },
] as const;

export const flavours = ['Vanilla', 'Chocolate', 'Red Velvet', 'Carrot', 'Lemon', 'Strawberry'];
export const fillings = ['Vanilla Buttercream', 'Chocolate Ganache', 'Cream Cheese Frosting', 'Salted Caramel', 'Jam', 'Mousse'];
export const toppers = ['Fresh Berries', 'Fresh Flowers', 'Sprinkles', 'Edible Gold', 'Chocolate Shards', 'Macarons', 'Fondant Decoration', 'Mirror Glaze'];

export const buildSteps = [
  {
    id: 'size',
    kicker: 'Step one',
    title: 'Pick a size',
    body: 'From a bento for one to three tiers for the whole family. Every size is baked to order.',
    options: sizes.map((s) => s.name),
  },
  {
    id: 'flavour',
    kicker: 'Step two',
    title: 'Choose a flavour',
    body: 'Soft, buttery sponge in the flavour you love most.',
    options: flavours,
  },
  {
    id: 'filling',
    kicker: 'Step three',
    title: 'Add a filling',
    body: 'Layered between every tier, from silky ganache to salted caramel.',
    options: fillings,
  },
  {
    id: 'toppers',
    kicker: 'Step four',
    title: 'Top it off',
    body: 'Fresh berries, macarons, edible gold. Add as many as you like.',
    options: toppers,
  },
] as const;

export const howItWorks = [
  {
    n: '01',
    title: 'Order online',
    body: 'Design your cake at least 14 days ahead. Pay securely with PayFast. Payment is due 7 days before pickup.',
  },
  {
    n: '02',
    title: 'We bake by hand',
    body: 'Every cake is baked fresh to order and finished by hand in our Midrand kitchen.',
  },
  {
    n: '03',
    title: 'Pickup or delivery',
    body: 'Collect in Midrand (12:00 by default, any time 08:00–17:00) or have it delivered with Uber.',
  },
];

export const proofPoints = [
  { title: 'Baked fresh to order', body: 'Nothing sits on a shelf. Your cake is made for your date.' },
  { title: 'Allergy-aware', body: 'Tell us about allergies and dietary needs. We read every note.' },
  { title: 'Made in Midrand', body: 'A local, women-run boutique, not a chain.' },
];

/**
 * PLACEHOLDER testimonials — replace with real customer reviews before launch.
 * `placeholder: true` shows a small "sample" badge in development only.
 */
export const testimonials = [
  {
    quote: 'The cake was the first thing everyone talked about. It looked like a dream and tasted even better.',
    name: 'Sample customer',
    occasion: 'Birthday, 20cm Round',
    placeholder: true,
  },
  {
    quote: 'Ordering online was so easy, and pickup was right on time.',
    name: 'Sample customer',
    occasion: 'Baby shower, cupcakes',
    placeholder: true,
  },
  {
    quote: 'She got every detail right, even the allergy notes.',
    name: 'Sample customer',
    occasion: 'Anniversary, 2-Tier',
    placeholder: true,
  },
];

export const formatRand = (n: number) => `R${n.toLocaleString('en-ZA')}`;
