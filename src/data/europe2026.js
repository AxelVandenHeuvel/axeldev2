/**
 * EUROPE 2026
 * -----------
 * Content for the scroll cutscene. This is the file to edit -- everything
 * else derives from it.
 *
 * Two structures, because Prague was visited twice and a flat list of stops
 * would mean duplicating its photos:
 *
 *   places    - unique locations, keyed by slug. Coordinates, blurb, photos.
 *   itinerary - the ordered journey. Entries may repeat a place.
 *
 * ADDING A BLURB
 *   Find the place in `places` and fill in `blurb`. Supports \n for breaks.
 *
 * ADDING PHOTOS
 *   Drop files in public/images/europe2026/ and list them:
 *
 *     photos: [
 *       { src: '/images/europe2026/vienna-01.jpg', caption: 'optional' },
 *     ]
 *
 *   Leave the array empty and the journal shows a placeholder card instead of
 *   a broken grid, so it's fine to add these gradually.
 *
 * ITINERARY FIELDS
 *   via.mode   'plane' | 'train' | 'bus' -- how you arrived from the previous stop
 *   via.geo    'gc' forces a true great-circle arc (only worth it transatlantic)
 *   via.segments  for mixed-mode legs; each hop gets its own mode, so the
 *                 drawn line visibly changes character at the transfer
 *   hero       gives this stop a full camera settle rather than a pass-through
 *   visit      disambiguates repeat visits in the journal header
 */

export const meta = {
  title: 'Europe 2026',
  subtitle: 'twenty legs · twenty-one stops',
  dates: 'summer 2026',
}

export const places = {
  seattle: {
    name: 'Seattle',
    country: 'United States',
    lon: -122.3321,
    lat: 47.6062,
    blurb: '',
    photos: [],
  },
  reykjavik: {
    name: 'Reykjavík',
    country: 'Iceland',
    lon: -21.9426,
    lat: 64.1466,
    blurb: '',
    photos: [],
  },
  amsterdam: {
    name: 'Amsterdam',
    country: 'Netherlands',
    lon: 4.9041,
    lat: 52.3676,
    blurb: '',
    photos: [],
  },
  berlin: {
    name: 'Berlin',
    country: 'Germany',
    lon: 13.405,
    lat: 52.52,
    blurb: '',
    photos: [],
  },
  munich: {
    name: 'Munich',
    country: 'Germany',
    lon: 11.582,
    lat: 48.1351,
    blurb: '',
    photos: [],
  },
  salzburg: {
    name: 'Salzburg',
    country: 'Austria',
    lon: 13.055,
    lat: 47.8095,
    blurb: '',
    photos: [],
  },
  vienna: {
    name: 'Vienna',
    country: 'Austria',
    lon: 16.3738,
    lat: 48.2082,
    blurb: '',
    photos: [],
  },
  prague: {
    name: 'Prague',
    country: 'Czechia',
    lon: 14.4378,
    lat: 50.0755,
    blurb: '',
    photos: [],
  },
  ljubljana: {
    name: 'Ljubljana',
    country: 'Slovenia',
    lon: 14.5058,
    lat: 46.0569,
    transfer: true,
  },
  bovec: {
    name: 'Bovec',
    country: 'Slovenia',
    lon: 13.5522,
    lat: 46.3383,
    blurb: '',
    photos: [],
  },
  // Transfer point on the Bohinj railway. Roughly on the line Bovec -> Bled,
  // so the drawn route reads as one journey rather than a detour.
  bohinjska: {
    name: 'Bohinjska Bistrica',
    country: 'Slovenia',
    lon: 13.9447,
    lat: 46.2761,
    transfer: true,
  },
  bled: {
    name: 'Bled',
    country: 'Slovenia',
    lon: 14.1136,
    lat: 46.3683,
    blurb: '',
    photos: [],
  },
  venice: {
    name: 'Venice',
    country: 'Italy',
    lon: 12.3155,
    lat: 45.4408,
    blurb: '',
    photos: [],
  },
  florence: {
    name: 'Florence',
    country: 'Italy',
    lon: 11.2558,
    lat: 43.7696,
    blurb: '',
    photos: [],
  },
  rome: {
    name: 'Rome',
    country: 'Italy',
    lon: 12.4964,
    lat: 41.9028,
    blurb: '',
    photos: [],
  },
  naples: {
    name: 'Naples',
    country: 'Italy',
    lon: 14.2681,
    lat: 40.8518,
    blurb: '',
    photos: [],
  },
  heidelberg: {
    name: 'Heidelberg',
    country: 'Germany',
    lon: 8.6724,
    lat: 49.3988,
    blurb: '',
    photos: [],
  },
  krakow: {
    name: 'Kraków',
    country: 'Poland',
    lon: 19.945,
    lat: 50.0647,
    blurb: '',
    photos: [],
  },
  zdiar: {
    name: 'Ždiar',
    country: 'Slovakia',
    lon: 20.2833,
    lat: 49.2708,
    blurb: '',
    photos: [],
  },
  budapest: {
    name: 'Budapest',
    country: 'Hungary',
    lon: 19.0402,
    lat: 47.4979,
    blurb: '',
    photos: [],
  },
  frankfurt: {
    name: 'Frankfurt',
    country: 'Germany',
    lon: 8.6821,
    lat: 50.1109,
    blurb: '',
    photos: [],
  },
  interlaken: {
    name: 'Interlaken',
    country: 'Switzerland',
    lon: 7.8632,
    lat: 46.6863,
    blurb: '',
    photos: [],
  },
}

/** 21 entries -> 20 legs. Entry i is reached FROM entry i-1 by entry i's `via`. */
export const itinerary = [
  { place: 'seattle', hero: true },
  { place: 'reykjavik', hero: true, via: { mode: 'plane', geo: 'gc' } },
  { place: 'amsterdam', hero: true, via: { mode: 'plane', geo: 'gc' } },
  { place: 'berlin', via: { mode: 'train' } },
  { place: 'munich', via: { mode: 'train' } },
  { place: 'salzburg', via: { mode: 'train' } },
  { place: 'vienna', hero: true, via: { mode: 'train' } },
  { place: 'prague', visit: 1, via: { mode: 'train' } },
  {
    place: 'bovec',
    hero: true,
    via: {
      mode: 'multi',
      segments: [
        { to: 'ljubljana', mode: 'train' },
        { to: 'bovec', mode: 'bus' },
      ],
    },
  },
  {
    place: 'bled',
    via: {
      mode: 'multi',
      segments: [
        { to: 'bohinjska', mode: 'bus' },
        { to: 'bled', mode: 'train' },
      ],
    },
  },
  { place: 'venice', hero: true, via: { mode: 'train' } },
  { place: 'florence', via: { mode: 'train' } },
  { place: 'rome', hero: true, via: { mode: 'train' } },
  { place: 'naples', via: { mode: 'train' } },
  { place: 'heidelberg', via: { mode: 'plane' } },
  { place: 'prague', visit: 2, via: { mode: 'train' } },
  { place: 'krakow', hero: true, via: { mode: 'train' } },
  { place: 'zdiar', via: { mode: 'bus' } },
  { place: 'budapest', via: { mode: 'train' } },
  { place: 'frankfurt', via: { mode: 'plane' } },
  { place: 'interlaken', hero: true, via: { mode: 'train' } },
]
