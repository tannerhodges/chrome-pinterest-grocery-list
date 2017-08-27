// ------------------------------
// Helpers
// ------------------------------

/**
 * Merge two JavaScript objects.
 * @see https://plainjs.com/javascript/utilities/merge-two-javascript-objects-19/
 * @param  {Object}  obj
 * @param  {Object}  src
 * @return {Boolean}
 */
function extend(obj, src) {
  Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
  return obj;
}

/**
 * Plain JavaScript event delegation. Add a handler for whenever an element's
 * children trigger a specified event.
 * @see http://bdadam.com/blog/plain-javascript-event-delegation.html
 * @param  {String}    parentSelector
 * @param  {String}    eventName
 * @param  {String}    childSelector
 * @param  {Function}  fn
 * @return {Boolean}
 */
function on(parentSelector, eventName, childSelector, fn) {
  let element = document.querySelector(parentSelector);

  if (!element) {
    return false;
  }

  element.addEventListener(eventName, function(event) {
    let possibleTargets = element.querySelectorAll(childSelector);
    let target = event.target;

    for (let i = 0, l = possibleTargets.length; i < l; i++) {
      let el = target;
      let p = possibleTargets[i];

      while (el && el !== element) {
        if (el === p) {
          return fn.call(p, event);
        }

        el = el.parentNode;
      }
    }
  });

  return true;
}



// ------------------------------
// Pinterest Grocery List
// ------------------------------

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pinSelector = '.BoardPinGrid [data-grid-item="true"]';
const dayBlockSelector = '#pinterestGroceryList [data-day]';

// Add dashboard to bottom of the page
let dashboard = document.createElement('div');
dashboard.id = 'pinterestGroceryList';

// Load
let data = localStorage.getItem('pinterestGroceryList');
if (data) {
  dashboard.innerHTML = data;
// First Time
} else {
  days.forEach(day => dashboard.innerHTML += `<div data-day="${day}"></div>`);
  dashboard.innerHTML += `<div class="actions">
    <p>Email these recipes to:</p>
    <label for="pinterestGroceryList-email-input" class="visually-hidden">Email Address</label>
    <input id="pinterestGroceryList-email-input" name="email" type="email" placeholder="email@address.com">
    <a id="pinterestGroceryList-email-button" href="">Send Email</a>
  </div>`;
}

dashboard = document.body.appendChild(dashboard);

// Make pins draggable
on('body', 'mousedown', pinSelector, (e) => {
  let pin = e.target.closest(pinSelector);

  if (pin.getAttribute('draggable') !== 'true') {
    pin.setAttribute('draggable', 'true');
  }
});

// Get dragged pin data
on('body', 'dragstart', pinSelector, (event) => {
  let pin = event.target.closest(pinSelector);
  let image = pin.querySelector('img');

  event.dataTransfer.clearData();
  event.dataTransfer.dropEffect = 'copy';
  event.dataTransfer.setDragImage(image, 10, 10);
  event.dataTransfer.setData('text/x-pin-url', pin.querySelector('a').href);
  event.dataTransfer.setData('text/x-pin-img', image.outerHTML);
});

// Send pin data to dashboard
const dragoverHandler = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};
on('body', 'dragover', dayBlockSelector, dragoverHandler);

// Add dropped pins to dashboard
const dropHandler = (event) => {
  event.preventDefault();

  let pinURL = event.dataTransfer.getData('text/x-pin-url');
  let pinImg = event.dataTransfer.getData('text/x-pin-img');

  let link = document.createElement('a');
  link.href = pinURL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.innerHTML = pinImg;
  link.querySelector('img').removeAttribute('class');

  // Which day are we dropping into?
  let dayBlock = event.target.closest('[data-day]');
  dayBlock.innerHTML = '';
  dayBlock.appendChild(link);

  // Save
  localStorage.setItem('pinterestGroceryList', dashboard.innerHTML);
};
on('body', 'drop', dayBlockSelector, dropHandler);



// Email Recipes
on('body', 'mousedown', '#pinterestGroceryList-email-button', (event) => {
  let input = document.querySelector('#pinterestGroceryList-email');

  input.setAttribute('value', input.value);

  let links = Array.from(dashboard.querySelectorAll('[data-day] a')).map(a => a.href);

  event.target.href = `mailto:${input.value}?subject=${encodeURIComponent('Pinterest Grocery List')}&body=${encodeURIComponent(links.join('\n'))}`;
  event.target.target = '_blank';
  event.target.rel = 'noopener noreferrer';

  // Save
  localStorage.setItem('pinterestGroceryList', dashboard.innerHTML);
});
