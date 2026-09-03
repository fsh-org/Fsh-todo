/* Utility functions */
const dateFormats = {
  t: { timeStyle: 'short' },
  T: { timeStyle: 'medium' },
  d: { day: '2-digit', month: '2-digit', year: 'numeric' },
  D: { dateStyle: 'long' },
  f: { dateStyle: 'long', timeStyle: 'short' },
  F: { dateStyle: 'full', timeStyle: 'short' },
  s: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  S: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
};
function download(filename, text) {
  let link = document.createElement('a');
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
function updateDataVer(dat, num) {
  if (num===1) {
    return updateDataVer({
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
    }, 2);
  } else if (num===2) {
    dat.version = 3;
    Object.keys(dat.spaces)
      .forEach(key=>{
        dat.spaces[key].contents = dat.spaces[key].contents.map(task=>{
          task.type = 'simple';
          task.body = task.desc;
          delete task.desc;
          task.attachments = [];
          task.time = null;
          return task;
        });
      });
    return dat;
  } else if (num===3) {
    return dat;
  }
  throw new Error('Unknown version');
}
function getLocalData() {
  // Load localStorage object
  let dat = localStorage.getItem('todo');
  // If doesn't exist set default
  if (!dat) {
    setLocalData({
      version: 3,
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
  return name.trim().toLowerCase().replaceAll(/( |\t|-)/g, '_');
}

/* Settings */
if (!localStorage.getItem('order')) localStorage.setItem('order', 'newest');
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
  let name = document.getElementById('space_add_name').value.trim();
  let norm = nameNormalize(name);
  if (norm.length<1) {
    alert('You must type something for the name');
    return;
  }
  let oname = nameNormalize(document.getElementById('space_add_text').innerText.split('"').slice(1,-1).join('"'));
  if (tasks.spaces[norm]&&norm!==oname) {
    alert('Space with this name already exists');
    return;
  }
  let color = document.getElementById('hsl-selector').getAttribute('value');
  color = Number(color??0);
  let cont = [];
  if (document.getElementById('space_add_button').innerText === 'Edit') {
    cont = tasks.spaces[oname].contents;
    delete tasks.spaces[oname];
    if (space === oname) space = norm;
  }
  tasks.spaces[norm] = {
    name,
    color,
    contents: cont
  };
  space = norm;
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
    document.getElementById('spaces').innerHTML = `<button onclick="space_add()" class="add" aria-label="Create space">Create a space&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><rect x="103" width="50" height="256" rx="25"></rect><rect y="103" width="256" height="50" rx="25"></rect></svg></button>`;
    document.getElementById('toolbar').innerHTML = '';
    document.getElementById('tasks').innerHTML = '';
    return;
  }
  // Spaces
  document.getElementById('spaces').innerHTML = Object.keys(tasks.spaces).map(s=>{
  return `<button style="--color:${tasks.spaces[s].color}"${s===space?' selected':''} onclick="space='${s}';reload();">${tasks.spaces[s].name}<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" onclick="space_edi('${s}')" viewBox="0 0 256 256"><path d="M35.1323 255.15C33.0948 255.784 31.0651 254.148 31.252 252.023L36 198L87.0001 239L35.1323 255.15Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36 198L87 239L213.98 78.9254L162.073 38.0231L36 198ZM170.11 27.8256L222.067 68.7302L239.674 46.5338C241.391 44.3703 241.028 41.2251 238.864 39.509L194.819 4.57489C192.651 2.85513 189.498 3.22383 187.785 5.39749L170.11 27.8256Z"/></svg></button>`;
}).join('') + `<button onclick="space_add()" class="add" aria-label="Create space"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><rect x="103" width="50" height="256" rx="25"></rect><rect y="103" width="256" height="50" rx="25"></rect></svg></button>`;

  if (!tasks.spaces[space]) {
    document.getElementById('toolbar').innerHTML = 'Select space';
    document.getElementById('tasks').innerHTML = '';
    return;
  }

  // Toolbar
  let currentSpaceContents = tasks.spaces[space].contents;
  document.getElementById('toolbar').innerHTML = `<div class="open-tasks">${currentSpaceContents.filter(t=>t.open).length}/${currentSpaceContents.length} Open tasks</div>
${Object.values(tasks.spaces).length===1?'':`<div class="total-tasks">${Object.values(tasks.spaces).map(e=>e.contents.filter(t=>t.open)).flat().length}/${Object.values(tasks.spaces).map(e=>e.contents).flat().length} Total open tasks</div>`}
<span></span>
<button onclick="localStorage.setItem('order', '${{newest:'oldest',oldest:'az',az:'za',za:'newest'}[localStorage.getItem('order')]}');reload()">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path d="M8.86307 31.6022C5.13517 26.3016 8.92652 19 15.4068 19H240.593C247.073 19 250.865 26.3016 247.137 31.6022L160 155.5L134.544 191.696C131.357 196.226 124.643 196.226 121.456 191.696L96 155.5L8.86307 31.6022Z"/><path d="M95 123C95 118.582 98.5817 115 103 115H153C157.418 115 161 118.582 161 123V229.767C161 232.681 157.983 234.617 155.333 233.403L98.5001 207.354C96.3674 206.377 95 204.246 95 201.9V123Z"/></svg>
  <p>${{newest:'Newest',oldest:'Oldest',az:'A to Z',za:'Z to A'}[localStorage.getItem('order')]}</p>
</button>`;

  // Tasks
  let cont = structuredClone(tasks.spaces[space].contents);
  switch (localStorage.getItem('order')) {
    case 'newest':
      cont.reverse();
      break;
    case 'az':
      cont.sort((a,b)=>a.title!==b.title?a.title.localeCompare(b.title):a.body.localeCompare(b.body));
      break;
    case 'za':
      cont.sort((a,b)=>b.title!==a.title?b.title.localeCompare(a.title):b.body.localeCompare(a.body));
      break;
  }
  cont.sort((a,b)=>b.open-a.open);
  document.getElementById('tasks').innerHTML = cont.map(r => `<div class="task${document.getElementById('c-'+r.id) ? '' : ' appear'}" id="c-${r.id}" data-open="${r.open}">
  <label class="container">
    <input type="checkbox" onchange="task_sta(${r.id})" autocomplete="off" name="check"${r.open?'':' checked'}>
    <span class="checkmark"></span>
  </label>
  <div>
    <b>${r.title}</b>
    <span>${MDParse(r.body)}</span>
    ${r.time?`<span class="clock">
  <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0.000488281C198.692 0.000488281 256 57.308 256 128C255.999 198.693 198.692 256 128 256C57.3076 256 1.97489e-05 198.693 -0.000244141 128C-0.000244141 57.3081 57.3074 0.000620227 128 0.000488281ZM128 38.3999C78.5152 38.4 38.4001 78.5159 38.4001 128C38.4004 177.485 78.5153 217.6 128 217.6C177.484 217.6 217.6 177.485 217.6 128C217.6 78.5158 177.484 38.3999 128 38.3999ZM128 49.2593C134.075 49.2593 138.999 54.1844 139 60.2593V121.094L174.802 138.418C180.27 141.065 182.558 147.643 179.912 153.112C177.266 158.58 170.688 160.868 165.219 158.222L123.53 138.049C122.736 137.696 121.992 137.253 121.311 136.73C121.3 136.722 121.29 136.713 121.279 136.705C121.154 136.608 121.03 136.509 120.909 136.407C120.867 136.371 120.826 136.334 120.784 136.297C120.703 136.227 120.621 136.156 120.542 136.083C120.47 136.016 120.4 135.949 120.33 135.881C120.276 135.829 120.222 135.777 120.17 135.724C120.095 135.649 120.024 135.572 119.952 135.495C119.901 135.44 119.849 135.385 119.799 135.329C119.732 135.254 119.667 135.178 119.602 135.102C119.555 135.046 119.508 134.99 119.462 134.933C119.395 134.851 119.33 134.768 119.265 134.684C119.221 134.626 119.176 134.567 119.133 134.508C119.073 134.428 119.016 134.345 118.959 134.263C118.914 134.199 118.869 134.133 118.826 134.068C118.775 133.99 118.725 133.912 118.676 133.833C118.629 133.76 118.583 133.686 118.539 133.611C118.493 133.533 118.449 133.455 118.405 133.376C118.363 133.301 118.32 133.226 118.28 133.15C118.241 133.076 118.202 133 118.165 132.925C118.119 132.835 118.075 132.744 118.032 132.652C118.004 132.593 117.977 132.533 117.95 132.473C117.905 132.372 117.861 132.271 117.819 132.168C117.788 132.092 117.758 132.014 117.728 131.936C117.699 131.861 117.671 131.785 117.643 131.709C117.604 131.601 117.568 131.492 117.532 131.382C117.514 131.327 117.495 131.271 117.478 131.214C117.436 131.078 117.398 130.94 117.361 130.801C117.355 130.777 117.348 130.753 117.342 130.729C117.081 129.717 116.964 128.665 117 127.607V60.2593C117 54.1845 121.925 49.2594 128 49.2593Z"/></svg>
  <span>${r.time.afterEnd||new Date(r.time.date).getTime()>Date.now()?new Date(r.time.date).toLocaleString(navigator.languages, dateFormats[r.time.format]):'Time ended'}</span>
</span>`:''}
  </div>
  ${r.open ?
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" onclick="task_edi(${r.id})" viewBox="0 0 256 256"><path d="M35.1323 255.15C33.0948 255.784 31.0651 254.148 31.252 252.023L36 198L87.0001 239L35.1323 255.15Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36 198L87 239L213.98 78.9254L162.073 38.0231L36 198ZM170.11 27.8256L222.067 68.7302L239.674 46.5338C241.391 44.3703 241.028 41.2251 238.864 39.509L194.819 4.57489C192.651 2.85513 189.498 3.22383 187.785 5.39749L170.11 27.8256Z"/></svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" onclick="task_del(${r.id})" viewBox="0 0 256 256"><path d="M77.0892 18.9306C79.4013 18.9306 81.5077 17.6021 82.5038 15.5156L88.281 3.41493C89.2771 1.32846 91.3835 0 93.6956 0H162.304C164.617 0 166.723 1.32847 167.719 3.41494L173.496 15.5156C174.492 17.6021 176.599 18.9306 178.911 18.9306H222C226.418 18.9306 230 22.5123 230 26.9306V39C230 43.4183 226.418 47 222 47H34C29.5817 47 26 43.4183 26 39V26.9306C26 22.5123 29.5817 18.9306 34 18.9306H77.0892Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M42.4949 62.0605C39.7335 62.0605 37.4949 64.2991 37.4949 67.0605V241C37.4949 249.284 44.2106 256 52.4949 256H203.505C211.789 256 218.505 249.284 218.505 241V67.0605C218.505 64.2991 216.266 62.0605 213.505 62.0605H42.4949ZM78.8686 87.9194C71.728 87.9194 65.9393 93.708 65.9393 100.849V215.919C65.9393 223.06 71.728 228.849 78.8686 228.849C86.0093 228.849 91.7979 223.06 91.7979 215.919V100.849C91.7979 93.708 86.0093 87.9194 78.8686 87.9194ZM128 87.9194C120.859 87.9194 115.071 93.708 115.071 100.849V215.919C115.071 223.06 120.859 228.849 128 228.849C135.141 228.849 140.929 223.06 140.929 215.919V100.849C140.929 93.708 135.141 87.9194 128 87.9194ZM164.202 100.849C164.202 93.708 169.991 87.9194 177.131 87.9194C184.272 87.9194 190.061 93.708 190.061 100.849V215.919C190.061 223.06 184.272 228.849 177.131 228.849C169.991 228.849 164.202 223.06 164.202 215.919V100.849Z"/></svg>`
  }
</div>`).join('');
}

/* Modify size of task creation textarea */
let DescTextarea = document.getElementById('desc');
DescTextarea.oninput = ()=>{
  DescTextarea.setAttribute('rows', Math.min(Math.max(DescTextarea.value.split('\n').length, 2), 10));
};

/* Add task */
function task_add() {
  let TitleInput = document.getElementById('title');
  let timeInclude = document.getElementById('time-include');
  tasks.spaces[space].contents.push({
    id: Math.floor(Math.random()*1000000),
    open: true,
    type: 'simple',
    labels: [],
    title: TitleInput.value,
    body: DescTextarea.value,
    time: timeInclude.checked ? {
      date: document.getElementById('time-date').value,
      format: document.getElementById('time-format').value||'f',
      afterEnd: document.getElementById('time-past').checked||false
    } : null
  });
  TitleInput.value = '';
  DescTextarea.value = '';
  if (timeInclude.checked) timeInclude.checked = false;
  DescTextarea.oninput();
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
function task_edi(id) {
  let task = document.querySelector(`#c-${id}`);
  let data = tasks.spaces[space].contents.find(t=>t.id===id);
  task.querySelector('input[type="checkbox"]').disabled = true;
  task.querySelector('div > b').innerHTML = `<input value="${data.title}">`;
  task.querySelector('div > span').innerHTML = `<textarea>${data.body}</textarea>`;
  let textarea = task.querySelector('div > span > textarea');
  textarea.setAttribute('rows', Math.min(Math.max(textarea.value.split('\n').length, 2), 10));
  textarea.oninput = ()=>{
    textarea.setAttribute('rows', Math.min(Math.max(textarea.value.split('\n').length, 2), 10));
  };
  task.querySelector('svg[onclick]').innerHTML = `<rect x="125" y="10" width="32" height="70" rx="8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20 0C8.95431 0 0 8.95431 0 20V236C0 247.046 8.95431 256 20 256H236C247.046 256 256 247.046 256 236V128V72.2843C256 66.9799 253.893 61.8929 250.142 58.1421L197.858 5.85786C194.107 2.10714 189.02 0 183.716 0H180C174.477 0 170 4.47715 170 10V80C170 85.5229 165.523 90 160 90H65C59.4772 90 55 85.5229 55 80V20C55 8.95431 46.0457 0 35 0H20ZM62 160C50.9543 160 42 168.954 42 180V215C42 226.046 50.9543 235 62 235H194C205.046 235 214 226.046 214 215V180C214 168.954 205.046 160 194 160H62Z"/>`;
  task.querySelector('svg[onclick]').onclick = ()=>{
    task.querySelector('input[type="checkbox"]').disabled = false;
    data.title = task.querySelector('div > b input').value;
    data.body = task.querySelector('div > span textarea').value;
    setLocalData(tasks);
  }
}
/* Make the time modal work */
let timeDate = document.getElementById('time-date');
let timeNow = new Date();
timeDate.onchange = (evt)=>{
  let date = new Date(evt.target.value);
  document.querySelectorAll('#time-format option').forEach(opt=>opt.innerText=date.toLocaleString(navigator.languages, dateFormats[opt.value]));
};
timeDate.value = `${timeNow.getFullYear()}-${timeNow.getMonth().toString().padStart(2,'0')}-${timeNow.getDay().toString().padStart(2,'0')}T${timeNow.getHours().toString().padStart(2,'0')}:${timeNow.getMinutes().toString().padStart(2,'0')}`;
timeDate.onchange();
/* Data export/import */
function file_exp() {
  download('tasks.ftodo', JSON.stringify(tasks));
}
function file_imp() {
  document.getElementById('file_upload').click();
}
document.getElementById('file_upload').onchange = (evt)=>{
  if (!evt.target.files[0]) return;
  evt.target.files[0].text().then(con=>{
    localStorage.setItem('todo', con);
    getLocalData();
  });
};

/* Show cards at load and when data changes (for cross tab changes) */
reload();
window.addEventListener('storage', ()=>{reload()});

/* Confetti */
window.addEventListener('click', (event) => {
  if (event.target.tagName !== 'INPUT' || event.target.type !== 'checkbox' || event.target.getAttribute('name') !== 'check' || !event.target.checked) return;
  let t = event.target.getBoundingClientRect();
  let b = document.body.getBoundingClientRect();
  confetti({
    origin: {
      x: t.x / b.width,
      y: t.y / b.height
    },
    shapes: ['circle', 'square', 'star'],
    disableForReducedMotion: true
  });
});