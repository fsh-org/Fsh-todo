function g(id) {
  return document.getElementById(id)
}
function reload() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  g('preview').innerHTML = data.map(r => `<div class="card">
  <input type="checkbox" onchange="del(${r.id})">
  <div style="flex:1">${r.title}<br>${r.desc}</div>
  <svg onclick="edit(${r.id})" style="height:15px;margin-bottom:auto;margin-top:auto;margin-right:10px;fill:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
</div>`).join('')
}
function del(id) {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  data = data.filter(e => e.id != id);
  localStorage.setItem('todo', JSON.stringify(data))
  reload()
}
let saven;
function save() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  let pos = data.indexOf(data.filter(e => {return e.id == saven})[0]);
  data[pos].title = g('title2').value;
  data[pos].desc = g('desc2').value;
  localStorage.setItem('todo', JSON.stringify(data))
  reload()
}
function edit(id) {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  saven = id;
  g('title2').value = data.filter(e => {return e.id == id})[0].title;
  g('desc2').value = data.filter(e => {return e.id == id})[0].desc;
  g('edit').showModal()
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
