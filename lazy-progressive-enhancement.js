/* @license
lazy-progressive-enhancement.js
https://github.com/tvler/lazy-progressive-enhancement
The MIT License (MIT)
Copyright (c) 2016 Tyler Deitz
*/

/**
 * Loads media, hooking an optional onload function,
 * optionally loading when scrolled into the viewport.
 *
 * @param {String | NodeList | Element} [media]
 *        String - (optional) A CSS selector targeting the noscript elements to be loaded.
 *        NodeList - (optional) A nodelist of noscript elements to be loaded.
 *        Element - (optional) A singular noscript element to be loaded.
 *        If not defined, targets every 'noscript' element on the page.
 * @param {Function} [onloadfn] - (optional) The onload function fired for each targeted element.
 * @param {Boolean} [scroll] - (optional) Load image when scrolled into the viewport.
 */
function loadMedia(media, onloadfn, scroll) {

   'use strict';

   function parseMedia(media) {
      if (media == null) {
         media = document.querySelectorAll('noscript');
      } else if (media instanceof Element) {
         media = [media];
      } else if (typeof media === 'string') {
         media = document.querySelectorAll(media);
      }
      return media;
   }

   function intervalFn (el, isSrcset) {
      return window.setInterval(function() {
         var rect = el.getBoundingClientRect(),
             offset = 300;
         if (
            (rect.bottom >= -offset && rect.top - window.innerHeight < offset) &&
            (rect.right >= -offset && rect.left - window.innerWidth < offset)
         ) {
            window.clearInterval(el.getAttribute('data-intervalid'));
            el.onload = onloadfn;
            isSrcset && (el.srcset = isSrcset);
            el.src = el.getAttribute('data-src');
         }
      }, 100);
   }

   function replaceNoscript(media) {
      var noscript, img, srcset,

      // Smallest data URI image possible for a transparent image
      // @see http://stackoverflow.com/questions/6018611/smallest-data-uri-image-possible-for-a-transparent-image
      // @author layke
      tempSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

      for (var i = 0; i < (media = parseMedia(media)).length; i++) {
         // Create an img element in a DOMParser so the image won't load.
         img = (new DOMParser()).parseFromString((noscript = media[i]).textContent, 'text/html').body.firstElementChild;

         if (scroll) {
            img.setAttribute('data-src', img.getAttribute('src'));
            (srcset = img.getAttribute('srcset')) && img.setAttribute('data-srcset', srcset);
            img.src = tempSrc;
            img.removeAttribute('srcset');
            noscript.parentElement.replaceChild(img, noscript);
            img.setAttribute('data-intervalid', intervalFn(img, srcset));
         } else {
            noscript.parentElement.replaceChild(img, noscript);
            img.onload = onloadfn;
         }
      }
   }

    // Fires replaceNoscript either on DOMContentLoaded or after
    // @see https://gist.github.com/tvler/8fd53d11ed775ebc72419bb5d96b8696
    // @author tvler
    var onwheneva = function() {
      replaceNoscript(media);
    }

   if (document.readyState !== 'loading') {
      onwheneva();
   } else {
      document.addEventListener('DOMContentLoaded', onwheneva);
   }
}
