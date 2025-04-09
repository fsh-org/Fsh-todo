let hs = document.getElementById('hsl-selector');
let hsi = document.getElementById('hsl-selector-indicator');
let hsd = false;

function updateColor(event) {
  const rect = hs.getBoundingClientRect();
  const p = Math.min(Math.max((event.clientX-rect.left)/rect.width, 0), 1);

  hsi.style.left = `${Math.min(Math.max(Math.round(rect.width*p), 10), Math.floor(rect.width)-15)}px`;
  hsi.style.borderColor = `hsl(${Math.round(p*360)}, 65%, 50%)`;
  hs.setAttribute('value', Math.round(p*360))
}

hs.addEventListener('mousedown', (event) => {
  hsd = true;
  updateColor(event);
});
window.addEventListener('mouseup', () => {
  hsd = false;
});
window.addEventListener('mousemove', (event) => {
  if (hsd) {
    updateColor(event);
  }
});
hs.addEventListener('click', (event) => {
  updateColor(event);
});