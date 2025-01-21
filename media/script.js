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
            t.open = true;
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
  document.getElementById('space_add_text').innerText = 'Create a new space';
  document.getElementById('space_add_button').innerText = 'Create';
  document.getElementById('space_del_button').style.display = 'none';
  document.getElementById('space_add').showModal();
}
function space_edi(id) {
  let space = tasks.spaces[id];
  document.getElementById('space_add_name').value = space.name;
  document.getElementById('hsl-selector').setAttribute('value', space.color);
  document.getElementById('hsl-selector-indicator').style.borderColor = `hsl(${space.color}, 65%, 50%)`;
  document.getElementById('space_add_text').innerText = 'Edit "'+space.name+'"';
  document.getElementById('space_add_button').innerText = 'Edit';
  document.getElementById('space_del_button').style.display = '';
  document.getElementById('space_del_button').setAttribute('data-id', id);
  document.getElementById('space_add').showModal();
  let rect = document.getElementById('hsl-selector').getBoundingClientRect();
  document.getElementById('hsl-selector-indicator').style.left = `${Math.min(Math.max(Math.round(rect.width*(space.color/360)), 10), Math.floor(rect.width)-15)}px`;
}
function space_act() {
  let name = document.getElementById('space_add_name').value;
  let norm = nameNormalize(name);
  if (norm.length<1) {
    alert('You must type something for the name');
    return;
  }
  if (tasks.spaces[norm]) {
    if (!confirm('A space with a this name alredy exists, are you sure?')) return;
  }
  let color = document.getElementById('hsl-selector').getAttribute('value');
  color = Number(color??0);
  let cont = [];
  if (document.getElementById('space_add_button').innerText === 'Edit') {
    let oname = nameNormalize(document.getElementById('space_add_text').innerText.split('"').slice(1,-1).join('"'));
    cont = tasks.spaces[oname].contents;
    delete tasks.spaces[oname];
    if (space === oname) space = name;
  }
  tasks.spaces[norm] = {
    name,
    color,
    contents: cont
  };
  document.getElementById('space_add').close();
  document.getElementById('space_add_name').value = '';
  document.getElementById('hsl-selector').setAttribute('value', 0);
  document.getElementById('hsl-selector-indicator').style.left = '10px';
  document.getElementById('hsl-selector-indicator').style.borderColor = 'hsl(0, 65%, 50%)';
  setLocalData(tasks);
}
function space_del() {
  if (!confirm('Are you sure you want to delete this space?')) return;
  let id = document.getElementById('space_del_button').getAttribute('data-id');
  delete tasks.spaces[id];
  if (space === id) space = Object.keys(tasks.spaces)[0];
  document.getElementById('space_add').close();
  setLocalData(tasks);
}

/* Show tasks */
function reload() {
  if (Object.keys(tasks.spaces).length<1) {
    document.getElementById('spaces').innerHTML = Object.keys(tasks.spaces).map(s=>{
      return `<button style="--color:${tasks.spaces[s].color}"${s===space?' selected':''} onclick="space='${s}';reload();">${tasks.spaces[s].name}<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" onclick="space_edi('${s}')" viewBox="0 0 256 256"><path d="M35.1323 255.15C33.0948 255.784 31.0651 254.148 31.252 252.023L36 198L87.0001 239L35.1323 255.15Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36 198L87 239L213.98 78.9254L162.073 38.0231L36 198ZM170.11 27.8256L222.067 68.7302L239.674 46.5338C241.391 44.3703 241.028 41.2251 238.864 39.509L194.819 4.57489C192.651 2.85513 189.498 3.22383 187.785 5.39749L170.11 27.8256Z"/></svg></button>`;
    }).join('') + `<button onclick="space_add()" class="add"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><rect x="103" width="50" height="256" rx="25"></rect><rect y="103" width="256" height="50" rx="25"></rect></svg></button>`;
    document.getElementById('toolbar').innerHTML = '';
    document.getElementById('tasks').innerHTML = '';
    return;
  }
  // Spaces
  document.getElementById('spaces').innerHTML = Object.keys(tasks.spaces).map(s=>{
  return `<button style="--color:${tasks.spaces[s].color}"${s===space?' selected':''} onclick="space='${s}';reload();">${tasks.spaces[s].name}<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" onclick="space_edi('${s}')" viewBox="0 0 256 256"><path d="M35.1323 255.15C33.0948 255.784 31.0651 254.148 31.252 252.023L36 198L87.0001 239L35.1323 255.15Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36 198L87 239L213.98 78.9254L162.073 38.0231L36 198ZM170.11 27.8256L222.067 68.7302L239.674 46.5338C241.391 44.3703 241.028 41.2251 238.864 39.509L194.819 4.57489C192.651 2.85513 189.498 3.22383 187.785 5.39749L170.11 27.8256Z"/></svg></button>`;
}).join('') + `<button onclick="space_add()" class="add"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><rect x="103" width="50" height="256" rx="25"></rect><rect y="103" width="256" height="50" rx="25"></rect></svg></button>`;

  // Toolbar
  let currentSpaceContents = tasks.spaces[space].contents;
  document.getElementById('toolbar').innerHTML = `<div class="open-tasks">${currentSpaceContents.filter(t=>t.open).length}/${currentSpaceContents.length} Open tasks</div>
<div class="total-tasks">${Object.values(tasks.spaces).map(e=>e.contents.filter(t=>t.open)).flat().length}/${Object.values(tasks.spaces).map(e=>e.contents).flat().length} Total open tasks</div>
<span></span>
<button onclick="localStorage.setItem('order', '${localStorage.getItem('order') === 'newest' ? 'oldest' : 'newest'}');reload()">
  ${localStorage.getItem('order') === 'newest' ? `<svg height="25" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M120.878 91.8996C123.982 86.7001 131.513 86.7001 134.617 91.8996L173.352 156.791C176.535 162.124 172.693 168.892 166.483 168.892H89.0123C82.802 168.892 78.96 162.124 82.143 156.791L120.878 91.8996Z"/></svg>` : `<svg height="25" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><!--Fsh icons--><path d="M120.878 164.992C123.982 170.192 131.513 170.192 134.617 164.992L173.352 100.1C176.535 94.7679 172.693 88 166.483 88H89.0123C82.802 88 78.96 94.7679 82.143 100.1L120.878 164.992Z"/></svg>`}
  <p>${localStorage.getItem('order') === 'newest' ? 'Newest' : 'Oldest'}</p>
</button>`;

  // Tasks
  let cont = structuredClone(tasks.spaces[space].contents);
  if (localStorage.getItem('order') === 'newest') {
    cont.reverse()
  }
  cont.sort((a,b)=>b.open-a.open);
  document.getElementById('tasks').innerHTML = cont.map(r => `<div class="task${document.getElementById('c-'+r.id) ? '' : ' appear'}" id="c-${r.id}" data-open="${r.open}">
  <label class="container">
    <input type="checkbox" onchange="task_sta(${r.id})" autocomplete="off" name="check"${r.open?'':' checked'}>
    <span class="checkmark"></span>
  </label>
  <div><b>${r.title}</b><span>${r.desc.replaceAll('\n','<br>')}</span></div>
  ${r.open ?
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" onclick="task_edi(${r.id}, '${r.type}')" viewBox="0 0 256 256"><path d="M35.1323 255.15C33.0948 255.784 31.0651 254.148 31.252 252.023L36 198L87.0001 239L35.1323 255.15Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36 198L87 239L213.98 78.9254L162.073 38.0231L36 198ZM170.11 27.8256L222.067 68.7302L239.674 46.5338C241.391 44.3703 241.028 41.2251 238.864 39.509L194.819 4.57489C192.651 2.85513 189.498 3.22383 187.785 5.39749L170.11 27.8256Z"/></svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" onclick="task_del(${r.id})" viewBox="0 0 256 256"><path d="M77.0892 18.9306C79.4013 18.9306 81.5077 17.6021 82.5038 15.5156L88.281 3.41493C89.2771 1.32846 91.3835 0 93.6956 0H162.304C164.617 0 166.723 1.32847 167.719 3.41494L173.496 15.5156C174.492 17.6021 176.599 18.9306 178.911 18.9306H222C226.418 18.9306 230 22.5123 230 26.9306V39C230 43.4183 226.418 47 222 47H34C29.5817 47 26 43.4183 26 39V26.9306C26 22.5123 29.5817 18.9306 34 18.9306H77.0892Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M42.4949 62.0605C39.7335 62.0605 37.4949 64.2991 37.4949 67.0605V241C37.4949 249.284 44.2106 256 52.4949 256H203.505C211.789 256 218.505 249.284 218.505 241V67.0605C218.505 64.2991 216.266 62.0605 213.505 62.0605H42.4949ZM78.8686 87.9194C71.728 87.9194 65.9393 93.708 65.9393 100.849V215.919C65.9393 223.06 71.728 228.849 78.8686 228.849C86.0093 228.849 91.7979 223.06 91.7979 215.919V100.849C91.7979 93.708 86.0093 87.9194 78.8686 87.9194ZM128 87.9194C120.859 87.9194 115.071 93.708 115.071 100.849V215.919C115.071 223.06 120.859 228.849 128 228.849C135.141 228.849 140.929 223.06 140.929 215.919V100.849C140.929 93.708 135.141 87.9194 128 87.9194ZM164.202 100.849C164.202 93.708 169.991 87.9194 177.131 87.9194C184.272 87.9194 190.061 93.708 190.061 100.849V215.919C190.061 223.06 184.272 228.849 177.131 228.849C169.991 228.849 164.202 223.06 164.202 215.919V100.849Z"/></svg>`
  }
</div>`).join('');
}

/* Add task */
function task_add() {
  tasks.spaces[space].contents.push({
    id: Math.floor(Math.random()*1000000),
    type: 'simple',
    labels: [],
    open: true,
    title: document.getElementById('title').value,
    desc: document.getElementById('desc').value
  });
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  setLocalData(tasks);
}
/* Status change task */
function task_sta(id) {
  let elem = tasks.spaces[space].contents.find(t=>t.id===id);
  elem.open = !elem.open;
  setLocalData(tasks);
}
/* Delete task */
function task_del(id) {
  tasks.spaces[space].contents = tasks.spaces[space].contents.filter(t=>t.id!==id);
  setLocalData(tasks);
}
/* Edit task */
function task_edi(id, type) {
  let task = document.querySelector(`#c-${id}`);
  if (type === 'simple') {
    task.querySelector('div > b').innerHTML = '<input value="'+task.querySelector('div > b').innerText+'">';
    task.querySelector('div > span').innerHTML = '<textarea>'+task.querySelector('div > span').innerHTML.replaceAll('<br>','\n')+'</textarea>';
    task.querySelector('svg').innerHTML = `<rect x="125" y="10" width="32" height="70" rx="8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20 0C8.95431 0 0 8.95431 0 20V236C0 247.046 8.95431 256 20 256H236C247.046 256 256 247.046 256 236V128V72.2843C256 66.9799 253.893 61.8929 250.142 58.1421L197.858 5.85786C194.107 2.10714 189.02 0 183.716 0H180C174.477 0 170 4.47715 170 10V80C170 85.5229 165.523 90 160 90H65C59.4772 90 55 85.5229 55 80V20C55 8.95431 46.0457 0 35 0H20ZM62 160C50.9543 160 42 168.954 42 180V215C42 226.046 50.9543 235 62 235H194C205.046 235 214 226.046 214 215V180C214 168.954 205.046 160 194 160H62Z"/>`;
    task.querySelector('svg').onclick = function(){
      let t = tasks.spaces[space].contents.find(t=>t.id===id);
      t.title = task.querySelector('div > b input').value;
      t.desc = task.querySelector('div > span textarea').value.replaceAll('\n','<br>');
      setLocalData(tasks);
    }
  }
}
/* Data export/import */
function file_exp() {
  download('tasks.ftodo', JSON.stringify(tasks))
}
function file_imp() {
  document.getElementById('file_upload').click();
}
document.getElementById('file_upload').addEventListener("change", function(){
  const reader = new FileReader();
  reader.onload = (evt) => {
    localStorage.setItem('todo', evt.target.result);
    getLocalData();
  };
  reader.readAsText(this.files[0]);
});

/* Show cards at load and when data changes (for cross tab changes) */
reload();
window.addEventListener("storage", ()=>{reload()});

/* Confetti */
window.addEventListener("click", (event) => {
  if (event.target.tagName == 'INPUT' && event.target.type == 'checkbox' && event.target.checked) {
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