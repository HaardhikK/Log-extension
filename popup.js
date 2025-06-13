(() => {
  const sectionsEl = document.getElementById('sections');
  const addBtn = document.getElementById('add-section');
  const renameBtn = document.getElementById('rename-section');
  const deleteBtn = document.getElementById('delete-section');
  const notesEl = document.getElementById('notes');
  const darkToggle = document.getElementById('dark-toggle');
  const highlightBtn = document.getElementById('highlight');
  const fontIncrease = document.getElementById('font-increase');
  const fontDecrease = document.getElementById('font-decrease');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-section'); // New button

  const modal = document.getElementById('modal');
  const modalInput = document.getElementById('modal-input');
  const modalSave = document.getElementById('modal-save');
  const modalCancel = document.getElementById('modal-cancel');

  let state = { sections: [], active: 0, dark: false, fontSize: 14 };

  function save() { chrome.storage.session.set({ notepad: state }); }
  function load(cb) {
    chrome.storage.session.get('notepad', data => {
      if (data.notepad) state = data.notepad;
      cb();
    });
  }

  function renderSections() {
    sectionsEl.innerHTML = '';
    state.sections.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.textContent = s.name;
      btn.classList.toggle('active', i===state.active);
      btn.onclick = () => { state.active = i; render(); save(); };
      sectionsEl.append(btn);
    });
    deleteBtn.style.display = state.sections.length <= 1 ? 'none' : 'flex';
  }

  function applyFontSize() {
    notesEl.style.fontSize = state.fontSize + 'px';
  }
  function toggleModal(show) {
    modal.classList.toggle('hidden', !show);
    if (show) {
      modalInput.value = state.sections[state.active].name;
      modalInput.focus();
      modalInput.select();
    }
  }

  function render() {
    document.documentElement.className = state.dark ? 'dark' : 'light';
    applyFontSize();
    renderSections();
    notesEl.innerHTML = state.sections[state.active].content;
    notesEl.focus();
  }

  // Section controls
  addBtn.onclick = () => {
    state.sections.push({ name: `Note ${state.sections.length+1}`, content: '' });
    state.active = state.sections.length - 1;
    render(); save();
  };
  deleteBtn.onclick = () => {
    if (state.sections.length <= 1) return;
    if (confirm(`Delete "${state.sections[state.active].name}"?`)) {
      state.sections.splice(state.active, 1);
      if (state.active >= state.sections.length) {
        state.active = state.sections.length - 1;
      }
      render(); save();
    }
  };
  renameBtn.onclick = () => toggleModal(true);
  modalCancel.onclick = () => toggleModal(false);
  modalSave.onclick = () => {
    const newName = modalInput.value.trim();
    if (newName) state.sections[state.active].name = newName;
    toggleModal(false); renderSections(); save();
  };
  modalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') modalSave.click();
    else if (e.key === 'Escape') modalCancel.click();
  });

  // Clear Section button
  clearBtn.onclick = () => {
    state.sections[state.active].content = '';
    render();
    save();
  };

  // Dark mode, highlight, font size
  darkToggle.onclick = () => { state.dark = !state.dark; render(); save(); };
  highlightBtn.onclick = () => {
    const selection = window.getSelection();
    if (!selection.toString()) return;
    const range = selection.getRangeAt(0);
    const isHighlighted = isSelectionHighlighted(range);
    if (isHighlighted) {
      document.execCommand('removeFormat');
    } else {
      document.execCommand('hiliteColor', false, state.dark ? '#d4b106' : '#fffb91');
    }
    selection.removeAllRanges();
  };
  fontIncrease.onclick = () => { state.fontSize = Math.min(state.fontSize+2, 36); applyFontSize(); save(); };
  fontDecrease.onclick = () => { state.fontSize = Math.max(state.fontSize-2, 10); applyFontSize(); save(); };
  function isSelectionHighlighted(range) {
    const container = range.commonAncestorContainer;
    const element = (container.nodeType === 3 ? container.parentNode : container);
    const bgColor = window.getComputedStyle(element).backgroundColor;
    const highlightColors = state.dark
      ? ['rgb(2, 2, 2)', 'rgba(212, 177, 6)']
      : ['rgb(255, 251, 145)', 'rgba(255, 251, 145)'];
    return highlightColors.includes(bgColor);
  }

  // Copy text (excluding images)
  copyBtn.onclick = () => {
    const clone = notesEl.cloneNode(true);
    clone.querySelectorAll('img').forEach(img => img.remove());
    navigator.clipboard.writeText(clone.innerText || clone.textContent);
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 1000);
  };

  // Linkify function: converts URLs in text nodes into <a> elements
  

  // Save state on input, after linkifying text
  notesEl.addEventListener('input', () => {
  state.sections[state.active].content = notesEl.innerHTML;
  save();
});

  // Handle Backspace/Delete for removing images
  notesEl.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);

      // Remove <img> if directly selected
      if (range.startContainer.nodeName === 'IMG' || 
          (range.startContainer.parentNode && range.startContainer.parentNode.nodeName === 'IMG')) {
        const img = (range.startContainer.nodeName === 'IMG') 
                    ? range.startContainer 
                    : range.startContainer.parentNode;
        img.remove();
        e.preventDefault();
        return;
      }

      // If caret is adjacent to an image, delete that image
      if (range.collapsed) {
        let container = range.startContainer;
        let offset = range.startOffset;
        if (e.key === 'Backspace') {
          // If at start of a node, check previous sibling
          if (container.nodeType === Node.TEXT_NODE) {
            if (offset === 0 && container.previousSibling &&
                container.previousSibling.classList &&
                container.previousSibling.classList.contains('image-container')) {
              container.previousSibling.remove();
              e.preventDefault();
              return;
            }
          } else if (container.nodeType === Node.ELEMENT_NODE) {
            if (offset > 0) {
              const prevNode = container.childNodes[offset - 1];
              if (prevNode && prevNode.classList && prevNode.classList.contains('image-container')) {
                prevNode.remove();
                e.preventDefault();
                return;
              }
            }
          }
        }
        if (e.key === 'Delete') {
          // If at end of a text node, check next sibling
          if (container.nodeType === Node.TEXT_NODE) {
            if (offset === container.nodeValue.length && container.nextSibling &&
                container.nextSibling.classList &&
                container.nextSibling.classList.contains('image-container')) {
              container.nextSibling.remove();
              e.preventDefault();
              return;
            }
          } else if (container.nodeType === Node.ELEMENT_NODE) {
            const nextNode = container.childNodes[offset];
            if (nextNode && nextNode.classList && nextNode.classList.contains('image-container')) {
              nextNode.remove();
              e.preventDefault();
              return;
            }
          }
        }
      }
    }
  });

  // Paste and drag-drop image handling (unchanged)
  notesEl.addEventListener('paste', e => {
    e.preventDefault();
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.kind === 'string') {
        item.getAsString(str => document.execCommand('insertText', false, str));
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (!file.type.startsWith('image')) continue;
        const reader = new FileReader();
        reader.onload = evt => document.execCommand(
          'insertHTML', false,
          `<div class="image-container"><img src="${evt.target.result}"></div>`
        );
        reader.readAsDataURL(file);
      }
    }
  });
  notesEl.addEventListener('dragover', e => e.preventDefault());
  notesEl.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image')) return;
    const reader = new FileReader();
    reader.onload = evt => document.execCommand(
      'insertHTML', false,
      `<div class="image-container"><img src="${evt.target.result}"></div>`
    );
    reader.readAsDataURL(file);
  });

  window.addEventListener('load', () => load(() => {
    if (!state.sections.length) state.sections = [{name: 'Note 1', content: ''}];
    render();
  }));
})();

