let desktop = document.querySelector('.desktop');
let windowTemplate = document.querySelector('#new-window');
let shortCutContainer = document.querySelector('.short-cuts');
let shortCuts = document.querySelectorAll('.short-cut');
let startButton = document.querySelector('.start-button');
let startMenu = document.querySelector('.start-menu');
let taskBarItems = document.querySelector('.task-bar-items');
let taskBarItemTemplate = document.querySelector('#new-task-bar-item');
let clock = document.querySelector('.clock');

shortCutContainer.addEventListener('mousedown', ({ target }) => {
  if (target !== shortCutContainer) return;
  
  deselectAll();
});

function deselectAllIcons() {
  for (let shortCut of shortCuts) {
    shortCut.classList.remove('selected');
  }
}

function deselectAllWindows() {
  windows.forEach(({ win, taskBarItem }) => {
    win.classList.remove('active');
    taskBarItem.classList.remove('active');
  });
}

function deselectAll() {
  deselectAllIcons();
  deselectAllWindows();
}

function openStartMenu() {
  deselectAll();
  startButton.classList.add('active');
  startMenu.classList.remove('hidden');
  
  onClickOutside = event => {
    if (!startMenu.contains(event.target)) {
      closeStartMenu();
    }
    window.removeEventListener('mousedown', onClickOutside);
  }
  
  setTimeout(() => window.addEventListener('mousedown', onClickOutside, { passive: true }), 1);
}

function closeStartMenu() {
  startButton.classList.remove('active');
  startMenu.classList.add('hidden');
}

startButton.addEventListener('mousedown', (event) => {
  if (startButton.classList.contains('active')) {
    closeStartMenu();
  } else {
    openStartMenu();  
  }
});

function setClock() {
  let now = new Date();
  let hours24 = now.getHours();
  let hours12 = hours24 > 12 ? hours24 - 12 : hours24;
  clock.textContent = `${hours12}:${now.getMinutes()} ${hours24 >= 12 ? 'PM' : 'AM'}`;
}
setClock();
setInterval(setClock, 1000);

for (let shortCut of shortCuts) {
  shortCut.addEventListener('click', () => selectShortCut(shortCut));
  shortCut.addEventListener('dblclick', () => execShortCut(shortCut));
}

function selectShortCut(shortCut) {
  deselectAllWindows();
  for (let sc of shortCuts) {
    if (sc === shortCut) {
      sc.classList.add('selected');
    } else {
      sc.classList.remove('selected');
    }
  }
}

function execShortCut(shortCut) {
  createWindow();
}

let windowIndex = 1;
let windows = [];

function dragMove(win, xMove, yMove, xSize, ySize) {
  let mouseX, mouseY;
  return event => {
    if (win.classList.contains('maximized')) return;
    mouseX = event.screenX;
    mouseY = event.screenY;
    const onMove = event => {
      let x = event.screenX;
      let y = event.screenY;
      let dx = x - mouseX;
      let dy = y - mouseY;
      let style = getComputedStyle(win);
      win.style.left = `${parseInt(style.left, 10) + dx * xMove}px`;
      win.style.top = `${parseInt(style.top, 10) + dy * yMove}px`;
      win.style.width = `${parseInt(style.width, 10) + dx * xSize}px`;
      win.style.height = `${parseInt(style.height, 10) + dy * ySize}px`;
      mouseX = x;
      mouseY = y;
    }
    const onUp = event => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
  }
}

function createWindow() {
  let win = windowTemplate.content.cloneNode(true);
  win = win.querySelector('.window');
  desktop.appendChild(win);
  let taskBarItem = taskBarItemTemplate.content.cloneNode(true);
  taskBarItem = taskBarItem.querySelector('.task-bar-item');
  taskBarItems.appendChild(taskBarItem);
  let windowObject = { win, taskBarItem };
  windows.push(windowObject);
  win.querySelector('.title-bar .minimize').addEventListener('click', () => minimizeWindow(windowObject));
  win.querySelector('.title-bar .maximize').addEventListener('click', () => toggleMaximize(windowObject));
  win.querySelector('.title-bar .close').addEventListener('click', () => closeWindow(windowObject));
  let titleBarText = win.querySelector('.title-bar .title');
  let title = `Window #${windowIndex++}`;
  titleBarText.textContent = title;
  taskBarItem.querySelector('.title').textContent = title;
  titleBarText.addEventListener('mousedown', dragMove(win, 1, 1, 0, 0));
  titleBarText.addEventListener('dblclick', () => toggleMaximize(windowObject))
  win.querySelector('.n-grab').addEventListener('mousedown', dragMove(win, 0, 1, 0, -1));
  win.querySelector('.ne-grab').addEventListener('mousedown', dragMove(win, 0, 1, 1, -1));
  win.querySelector('.e-grab').addEventListener('mousedown', dragMove(win, 0, 0, 1, 0));
  win.querySelector('.se-grab').addEventListener('mousedown', dragMove(win, 0, 0, 1, 1));
  win.querySelector('.s-grab').addEventListener('mousedown', dragMove(win, 0, 0, 0, 1));
  win.querySelector('.sw-grab').addEventListener('mousedown', dragMove(win, 1, 0, -1, 1));
  win.querySelector('.w-grab').addEventListener('mousedown', dragMove(win, 1, 0, -1, 0));
  win.querySelector('.nw-grab').addEventListener('mousedown', dragMove(win, 1, 1, -1, -1));
  win.addEventListener('mousedown', () => selectWindow(windowObject), { passive: true });
  taskBarItem.addEventListener('mousedown', () => {
    if (windowObject.win.classList.contains('active')) {
      minimizeWindow(windowObject);
    } else {
      selectWindow(windowObject);
    }
  });
  addContent(windowObject);
  selectWindow(windowObject);
}

function toggleMaximize(windowObject) {
  if (windowObject.win.classList.contains('maximized')) {
    unmaximizeWindow(windowObject);
  } else {
    maximizeWindow(windowObject);
  }
}

function selectWindow(windowObject) {
  deselectAllIcons();
  windows = windows.filter(w => w !== windowObject);
  for (let i = 0; i < windows.length; i++) {
    let w = windows[i].win;
    let t = windows[i].taskBarItem;
    w.classList.remove('active');
    w.style.zIndex = i;
    t.classList.remove('active');
  }
  windowObject.win.classList.add('active');
  windowObject.taskBarItem.classList.add('active');
  windowObject.win.style.zIndex = windows.length;
  if (windowObject.win.classList.contains('minimized')) {
    unminimizeWindow(windowObject);
  }
  windows.push(windowObject);
}

function closeWindow(windowObject) {
  windows = windows.filter(w => w !== windowObject);
  windowObject.win.remove();
  windowObject.taskBarItem.remove();
}

function beforeMinimize({ win }, animatedTitleBar) {
  animatedTitleBar.style.top = `${parseInt(win.style.top, 10)+4}px`;
  animatedTitleBar.style.left = `${parseInt(win.style.left, 10)+4}px`;
  animatedTitleBar.style.width = `${parseInt(win.style.width, 10)-8}px`;
}

function afterMinimize({ taskBarItem }, animatedTitleBar) {
  let taskBarRect = taskBarItem.getBoundingClientRect();
  animatedTitleBar.style.top = `${taskBarRect.top}px`;
  animatedTitleBar.style.left = `${taskBarRect.left}px`;
  animatedTitleBar.style.width = `${taskBarRect.width}px`;
}

function afterMaximize({ taskBarItem }, animatedTitleBar) {
  animatedTitleBar.style.top = `0px`;
  animatedTitleBar.style.left = `0px`;
  animatedTitleBar.style.width = `100%`;
}

function minimizeWindow(windowObject) {
  let titleBar = windowObject.win.querySelector('.title-bar');
  let animatedTitleBar = titleBar.cloneNode(true);
  if (windowObject.win.classList.contains('maximized')) {
    afterMaximize(windowObject, animatedTitleBar);
  } else {
    beforeMinimize(windowObject, animatedTitleBar);
  }
  animatedTitleBar.classList.add('animating');
  desktop.appendChild(animatedTitleBar);
  let taskBarRect = windowObject.taskBarItem.getBoundingClientRect();
  setTimeout(() => {
    afterMinimize(windowObject, animatedTitleBar);
  }, 1);
  animatedTitleBar.addEventListener('transitionend', () => {
    windowObject.win.classList.add('minimized');
    windowObject.win.classList.remove('active');
    windowObject.taskBarItem.classList.remove('active');
    animatedTitleBar.remove();
    // TODO: select next non-minimized window
  });
}

function unminimizeWindow(windowObject) {
  let titleBar = windowObject.win.querySelector('.title-bar');
  let animatedTitleBar = titleBar.cloneNode(true);
  afterMinimize(windowObject, animatedTitleBar);
  animatedTitleBar.classList.add('animating');
  desktop.appendChild(animatedTitleBar);
  setTimeout(() => {
    if (windowObject.win.classList.contains('maximized')) {
      afterMaximize(windowObject, animatedTitleBar);
    } else {
      beforeMinimize(windowObject, animatedTitleBar);
    }
  }, 1);
  animatedTitleBar.addEventListener('transitionend', () => {
    windowObject.win.classList.remove('minimized');
    animatedTitleBar.remove();
  });
}

function maximizeWindow(windowObject) {
  let titleBar = windowObject.win.querySelector('.title-bar');
  let animatedTitleBar = titleBar.cloneNode(true);
  beforeMinimize(windowObject, animatedTitleBar);
  animatedTitleBar.classList.add('animating');
  desktop.appendChild(animatedTitleBar);
  let taskBarRect = windowObject.taskBarItem.getBoundingClientRect();
  setTimeout(() => {
    afterMaximize(windowObject, animatedTitleBar);
  }, 1);
  animatedTitleBar.addEventListener('transitionend', () => {
    windowObject.win.classList.add('maximized');
    animatedTitleBar.remove();
  });
}

function unmaximizeWindow(windowObject) {
  let titleBar = windowObject.win.querySelector('.title-bar');
  let animatedTitleBar = titleBar.cloneNode(true);
  afterMaximize(windowObject, animatedTitleBar);
  animatedTitleBar.classList.add('animating');
  desktop.appendChild(animatedTitleBar);
  let taskBarRect = windowObject.taskBarItem.getBoundingClientRect();
  setTimeout(() => {
    beforeMinimize(windowObject, animatedTitleBar);
  }, 1);
  animatedTitleBar.addEventListener('transitionend', () => {
    windowObject.win.classList.remove('maximized');
    animatedTitleBar.remove();
  });
}

function addContent({ win }) {
  let content = win.querySelector('.content');
  let numberOfSections = Math.ceil(Math.random()*5)+5;
  let lastSectionTag = null;
  for (let i = 0; i < numberOfSections; i++) {
    if (i > 0 && lastSectionTag !== 'img' && Math.random() > 0.5) {
      lastSectionTag = 'p';
      let img = document.createElement('img');
      let width = Math.round((Math.random()*300)+300);
      let height = Math.round((Math.random()*200)+200);
      img.src = `https://loremflickr.com/${width}/${height}`;
      content.appendChild(img);
      lastSectionTag = 'img';
    } else {
      let p = document.createElement('p');
      p.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
      content.appendChild(p);
    }
  }
}

createWindow();