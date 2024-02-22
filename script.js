function g(id) {
  return document.getElementById(id)
}
function reload() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  g('preview').innerHTML = data.map(r => `<div class="card">
  <input type="checkbox" onchange="del(${r.id})"> ${r.title}<br>${r.desc}</div>`).join('')
}
function del(id) {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  data = data.filter(e => e.id != id);
  localStorage.setItem('todo', JSON.stringify(data))
  reload()
}
function add() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  data.push({
    title: g('title').value,
    desc: g('desc').value,
    id: Math.floor(Math.random()*1000000)
  })
  g('title').value = '';
  g('desc').value = '';
  localStorage.setItem('todo', JSON.stringify(data))
  reload()
}
reload()

window.addEventListener("click", (event) => {
  if (event.target.tagName == 'INPUT' && event.target.type == 'checkbox') {
    let t = event.target.getBoundingClientRect();
    let b = document.body.getBoundingClientRect();
    confetti({
      origin: {
        x: t.x / b.width,
        y: t.y / b.height
      },
      disableForReducedMotion: true
    });
  }
});
