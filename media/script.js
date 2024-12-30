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
function updateDataVer(dat, num) {
  if (num===1) {
    return {
      version: 2,
      spaces: {
        main: {
          name: 'Main',
          color: 230,
          contents: dat.map(t=>{
            t.type = 'simple';
            t.labels = [];
            t.status = 'open';
            return t;
          })
        }
      }
    }
  } else if (num===2) {
    return dat;
  } else {
    throw new Error('Unknown version')
  }
}
function getLocalData() {
  // Load localStorage object
  let dat = localStorage.getItem('todo');
  // If doesn't exist set default
  if (!dat) {
    setLocalData({
      version: 2,
      spaces: {
        main: {
          name: 'Main',
          color: 230,
          contents: []
        }
      }
    });
    return;
  }
  // Parse
  try {
    dat = JSON.parse(dat);
  } catch(err) {
    dat = [];
    alert('Could not load tasks');
  }
  // Update version
  if (Array.isArray(dat) || !dat.version) {
    dat = updateDataVer(dat, 1);
  } else {
    dat = updateDataVer(dat, dat.version);
  }
  // Save
  setLocalData(dat);
}
function setLocalData(dat) {
  tasks = dat;
  localStorage.setItem('todo', JSON.stringify(dat));
  reload();
}
function nameNormalize(name) {
  return name.toLowerCase().replaceAll(/( |\t|-)/g, '_');
}

/* Settings */
if (!localStorage.getItem('order')) {
  localStorage.setItem('order', 'newest')
}
var tasks;
let space = 'main';
getLocalData();

/* Interactions */
function space_add() {
  document.getElementById('space_add').showModal();
}
function space_create() {
  let name = document.getElementById('space_add_name').value;
  let norm = nameNormalize(name);
  if (tasks.spaces[norm]) {
    alert('A space with a similar name alredy exists');
    return;
  }
  let color = document.getElementById('hsl-selector').getAttribute('value');
  color = Number(color??0);
  tasks.spaces[norm] = {
    name,
    color,
    contents: []
  };
  document.getElementById('space_add').close();
  reload();
}

/* Show tasks */
function reload() {
  // Spaces
  document.getElementById('spaces').innerHTML = Object.keys(tasks.spaces).map(s=>{
  return `<button style="--color:${tasks.spaces[s].color}${s===space?';background:hsl(var(--color), 65%, 50%);':''}" onclick="space='${s}';reload();">${tasks.spaces[s].name}</button>`;
}).join('') + `<button onclick="space_add()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><rect x="103" width="50" height="256" rx="25"></rect><rect y="103" width="256" height="50" rx="25"></rect></svg></button>`;

  // Toolbar
  document.getElementById('toolbar').innerHTML = `<div class="open-tasks">${tasks.spaces[space].contents.filter(t=>t.status=='open').length}/${tasks.spaces[space].contents.length} Open tasks</div>
<div class="total-tasks">${tasks.spaces[space].contents.filter(t=>t.status=='open').length}/${tasks.spaces[space].contents.length} Total open tasks</div>
<span></span>
<button onclick="localStorage.setItem('order', '${localStorage.getItem('order') === 'newest' ? 'oldest' : 'newest'}');reload()">
  ${localStorage.getItem('order') === 'newest' ? `<svg height="25" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M120.878 91.8996C123.982 86.7001 131.513 86.7001 134.617 91.8996L173.352 156.791C176.535 162.124 172.693 168.892 166.483 168.892H89.0123C82.802 168.892 78.96 162.124 82.143 156.791L120.878 91.8996Z"/></svg>` : `<svg height="25" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><!--Fsh icons--><path d="M120.878 164.992C123.982 170.192 131.513 170.192 134.617 164.992L173.352 100.1C176.535 94.7679 172.693 88 166.483 88H89.0123C82.802 88 78.96 94.7679 82.143 100.1L120.878 164.992Z"/></svg>`}
  <p>${localStorage.getItem('order') === 'newest' ? 'Newest' : 'Oldest'}</p>
</button>`;

  let cont = structuredClone(tasks.spaces[space].contents);
  if (localStorage.getItem('order') === 'newest') {
    cont.reverse()
  }
  // Tasks
  document.getElementById('tasks').innerHTML = cont.map(r => `<div class="task${document.getElementById('c-'+r.id) ? '' : ' appear'}" id="c-${r.id}">
  <label class="container">
    <input type="checkbox" onchange="task_del(${r.id})" autocomplete="off" name="check">
    <span class="checkmark"></span>
  </label>
  <div><b>${r.title}</b>${r.desc.replaceAll('\n','<br>')}</div>
  <svg xmlns="http://www.w3.org/2000/svg" onclick="edit(${r.id})" style="margin-bottom:auto;margin-top:auto;margin-right:8px;cursor:pointer;" height="25" viewBox="0 0 256 256"><path d="M68.8002 210.595C66.7796 211.225 64.7597 209.621 64.9155 207.51L67.5 172.5L102.215 200.179L68.8002 210.595Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M67.5 172.5L102.186 200.236L187.63 92.5929L152.687 65.0577L67.5 172.5ZM158.107 58.2214L193.067 85.744L203.882 72.1188C205.599 69.9553 205.237 66.8092 203.073 65.0928L176.041 43.6524C173.877 41.9362 170.731 42.2993 169.016 44.4634L158.107 58.2214Z"/></svg>
</div>`).join('');
}

/* Add task */
function task_add() {
  tasks.spaces[space].contents.push({
    id: Math.floor(Math.random()*1000000),
    type: 'simple',
    labels: [],
    status: 'open',
    title: document.getElementById('title').value,
    desc: document.getElementById('desc').value
  });
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  setLocalData(tasks);
}
/* Delete task */
function task_del(id) {
  tasks.spaces[space].contents = tasks.spaces[space].contents.filter(t=>t.id!==id)
  setLocalData(tasks);
}
/* Save card */
let saven;
function save() {/*
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  let pos = data.indexOf(data.filter(e => {return e.id == saven})[0]);
  data[pos].title = document.getElementById('title2').value;
  data[pos].desc = document.getElementById('desc2').value;
  localStorage.setItem('todo', JSON.stringify(data))
  document.getElementById('edit').close()
  reload()*/
}
/* Edit menu */
function edit(id) {/*
  let data = JSON.parse(localStorage.getItem('todo')) || [];
  saven = id;
  document.getElementById('title2').value = data.filter(e => {return e.id == id})[0].title;
  document.getElementById('desc2').value = data.filter(e => {return e.id == id})[0].desc;
  document.getElementById('edit').showModal()*/
}
/* Data export/import */
function file_e() {
  download('tasks.ftodo', JSON.stringify(tasks))
}
function file_i() {
  document.getElementById('upload').click();
}
document.getElementById('upload').addEventListener("change", function(){/*
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
  reader.readAsText(this.files[0]);*/
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