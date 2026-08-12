# Europe 2026 photos

Drop trip photos here, then list them in `src/data/europe2026.js` under the
matching place.

## Naming

`<slug>-01.jpg`, `<slug>-02.jpg`, … where `<slug>` is the key in the `places`
object — e.g. `vienna-01.jpg`, `bovec-01.jpg`, `zdiar-01.jpg`.

## Wiring them up

```js
vienna: {
  name: 'Vienna',
  // ...
  blurb: 'Three days of coffee houses and one very long museum queue.',
  photos: [
    { src: '/images/europe2026/vienna-01.jpg', caption: 'optional' },
    { src: '/images/europe2026/vienna-02.jpg' },
  ],
},
```

The page works fine with `photos: []` — the journal shows placeholder cards
rather than a broken grid, so these can be added a city at a time.

## Before committing

Resize to roughly **1400px on the long edge, under 200 KB each**. These are
served straight from `public/` with no build-time processing, so whatever you
put here is what visitors download.

If a photo isn't 3:2, pass explicit dimensions so the grid doesn't reflow as it
loads:

```js
{ src: '/images/europe2026/venice-01.jpg', width: 1400, height: 1750 }
```
