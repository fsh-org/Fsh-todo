/* Utility functions */
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/* Settings */
if (!localStorage.getItem('order')) {
  localStorage.setItem('order', 'newest')
}

/* Show cards */
function reload() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  if (localStorage.getItem('order') === 'newest') data = data.reverse();
  document.getElementById('preview').innerHTML = `<p>${data.length} task${data.length === 1 ? '' : 's'} left</p>
<div class="order"${data.length===0?' style="display:none"':''}>
  <div onclick="localStorage.setItem('order', '${localStorage.getItem('order') === 'newest' ? 'oldest' : 'newest'}');reload()">
    ${localStorage.getItem('order') === 'newest' ? `<svg height="25" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><!--Fsh icons--><path d="M120.878 91.8996C123.982 86.7001 131.513 86.7001 134.617 91.8996L173.352 156.791C176.535 162.124 172.693 168.892 166.483 168.892H89.0123C82.802 168.892 78.96 162.124 82.143 156.791L120.878 91.8996Z"/></svg>` : `<svg height="25" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><!--Fsh icons--><path d="M120.878 164.992C123.982 170.192 131.513 170.192 134.617 164.992L173.352 100.1C176.535 94.7679 172.693 88 166.483 88H89.0123C82.802 88 78.96 94.7679 82.143 100.1L120.878 164.992Z"/></svg>`}
    <p>${localStorage.getItem('order') === 'newest' ? 'Newest' : 'Oldest'}</p>
  </div>
</div>
${data.map(r => `<div class="card${document.getElementById('c-'+r.id) ? '' : ' appear'}" id="c-${r.id}">
  <label class="container">
    <input type="checkbox" onchange="del(${r.id})">
    <span class="checkmark"></span>
  </label>
  <div><b>${r.title}</b>${r.desc.replaceAll('\n','<br>')}</div>
  <svg xmlns="http://www.w3.org/2000/svg" onclick="edit(${r.id})" style="margin-bottom:auto;margin-top:auto;margin-right:8px;cursor:pointer;" height="25" viewBox="0 0 256 256"><path d="M68.8002 210.595C66.7796 211.225 64.7597 209.621 64.9155 207.51L67.5 172.5L102.215 200.179L68.8002 210.595Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M67.5 172.5L102.186 200.236L187.63 92.5929L152.687 65.0577L67.5 172.5ZM158.107 58.2214L193.067 85.744L203.882 72.1188C205.599 69.9553 205.237 66.8092 203.073 65.0928L176.041 43.6524C173.877 41.9362 170.731 42.2993 169.016 44.4634L158.107 58.2214Z"/></svg>
</div>`).join('')}`;
}
/* Add card*/
function add() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  data.push({
    title: document.getElementById('title').value,
    desc: document.getElementById('desc').value,
    id: Math.floor(Math.random()*1000000)
  })
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  localStorage.setItem('todo', JSON.stringify(data))
  reload()
}
/* Save card */
let saven;
function save() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  let pos = data.indexOf(data.filter(e => {return e.id == saven})[0]);
  data[pos].title = document.getElementById('title2').value;
  data[pos].desc = document.getElementById('desc2').value;
  localStorage.setItem('todo', JSON.stringify(data))
  document.getElementById('edit').close()
  reload()
}
/* Edit menu */
function edit(id) {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  saven = id;
  document.getElementById('title2').value = data.filter(e => {return e.id == id})[0].title;
  document.getElementById('desc2').value = data.filter(e => {return e.id == id})[0].desc;
  document.getElementById('edit').showModal()
}
/* Delete card */
function del(id) {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  data = data.filter(e => e.id != id);
  localStorage.setItem('todo', JSON.stringify(data))
  reload()
}
/* Data export/import */
function file_e() {
  download('fsh-todo-tasks.json', (localStorage.getItem('todo')||'[]'))
}
function file_i() {
  document.getElementById('upload').click();
}
document.getElementById('upload').addEventListener("change", function(){
  const reader = new FileReader();
  reader.onload = (evt) => {
    let con = evt.target.result;
    try {
      let json = JSON.parse(con);
      if (!Array.isArray(json)) throw new Error('Not a array');
      localStorage.setItem('todo', con);
      reload()
    } catch(err) {
      alert('Not a valid file')
    }
  };
  reader.readAsText(this.files[0]);
});

/* Show cards at load and when data changes ( for cross tab changes )*/
reload()
window.addEventListener("storage", ()=>{reload()});

/* Confetti */
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
