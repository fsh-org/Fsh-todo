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

/* Show cards */
function reload() {
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  document.getElementById('preview').innerHTML = data.map(r => `<div class="card" id="c-${r.id}"${document.getElementById('c-'+r.id) ? '' : ' style="animation-name: appear;animation-duration: 1s;animation-iteration-count: 1;"'}>
  <label class="container">
    <input type="checkbox" onchange="del(${r.id})">
    <span class="checkmark"></span>
  </label>
  <div style="flex:1"><b>${r.title}</b><br>${r.desc.replace('\n','<br>')}</div>
  <svg onclick="edit(${r.id})" style="height:15px;margin-bottom:auto;margin-top:auto;margin-right:10px;fill:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
</div>`).join('')
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
      console.log('ff')
      let json = JSON.parse(con);
      console.log('gg')
      if (!Array.isArray(json)) throw new Error('Not a array');
      console.log('hh')
      localStorage.setItem('todo', con);
      console.log('jj')
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
