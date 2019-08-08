importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {

  // always precache landing page
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '08082019' },
  ]);

  // use image in cache and revalidate asynchronously
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'image-cache',
    })
  );

  //use cached JS and CSS when network unavailable
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.NetworkFirst()
  );


} else {
  console.log(`Boo! Workbox didn't load 😬`);
}