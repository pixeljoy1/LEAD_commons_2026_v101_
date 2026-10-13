/* LEAD · photos (Unsplash). Slots are named per role so any file can be swapped for a real UMO or UXINDIA photo.
 * People photos are illustrative stock. Each carries a caption on the page and a credit in the footer. */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});
  const U = (user) => `https://unsplash.com/@${user}?utm_source=lead_commons&utm_medium=referral`;
  const P = (slot, src, alt, by, user, id) => ({ slot, src, alt, by, link: U(user), page: `https://unsplash.com/photos/${id}`, people: true });
  const list = [
    P('hero', 'assets/photos/hero.jpg', 'Four design students gather around a laptop and talk through an idea', 'Mimi Thian', 'mimithian', 'vdXMSiX-n6M'),
    P('story-identify', 'assets/photos/story-identify.jpg', 'Hands arranging yellow sticky notes on a table during a workshop', 'FORTYTWO', 'byfortytwo', 'MDu-53qRVr4'),
    P('story-apply', 'assets/photos/story-apply.jpg', 'Three teammates look at a laptop together', 'Maxim Tolchinskiy', 'shaikhulud', 'Z6nN1A0zAA0'),
    P('story-mentor', 'assets/photos/story-mentor.jpg', 'A mentor smiles while guiding a student at a laptop', 'NEXT Academy', 'next_academy', 'JyJwO0K5fWM'),
    P('story-validate', 'assets/photos/story-validate.jpg', 'A group in a meeting room reviews work on a large screen', 'Flipsnack', 'flipsnack', 'LUqSTRx3_Ig'),
    P('door-student', 'assets/photos/door-student.jpg', 'Students laugh together over a laptop', 'Priscilla Du Preez', 'priscilladupreez', 'XkKCui44iM0'),
    P('door-faculty', 'assets/photos/door-faculty.jpg', 'A teacher explains an idea beside a whiteboard', 'Centre for Ageing Better', 'ageing_better', 'cPyO3GEYjZ4'),
    P('door-college', 'assets/photos/door-college.jpg', 'Students walk across a college campus', 'Zoshua Colah', 'zoshuacolah', 'kaZHJj-DhC4'),
    P('door-industry', 'assets/photos/door-industry.jpg', 'A team meets in a bright co-working office', 'Smartworks Coworking', 'smartworkscoworking', 'cW4lLTavU80'),
    P('door-mentor', 'assets/photos/door-mentor.jpg', 'Two people talk while looking at a laptop', 'KOBU Agency', 'kobuagency', '7okkFhxrxNw'),
    P('door-open', 'assets/photos/door-open.jpg', 'A young woman learns on her laptop at home', 'Good Faces', 'goodfacesagency', 'gy5SlRW9OGA'),
  ];
  LEAD.photos = { list, bySlot: Object.fromEntries(list.map((p) => [p.slot, p])) };
})(typeof globalThis !== 'undefined' ? globalThis : this);
