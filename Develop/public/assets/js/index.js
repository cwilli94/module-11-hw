document.addEventListener('DOMContentLoaded', () => {
  const noteTitle = document.querySelector('.note-title');
  const noteText = document.querySelector('.note-textarea');
  const saveNoteBtn = document.querySelector('.save-note');
  const newNoteBtn = document.querySelector('.new-note');
  const noteList = document.getElementById('noteList');
  const noteInput = document.getElementById('noteInput');

  const show = (elem) => {
    elem.style.display = 'block';
  };

  const hide = (elem) => {
    elem.style.display = 'none';
  };

  let activeNote = null;
  let isNewNote = false;

  const getNotes = () => {
    return fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json());
  };

  const saveNote = (note) => {
    return fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    }).then((response) => response.json());
  };

  const deleteNote = (id) => {
    return fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const renderActiveNote = () => {
    hide(saveNoteBtn);

    if (activeNote) {
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
      noteInput.style.display = 'block';
      noteList.style.pointerEvents = 'none';
    } else {
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
      noteInput.style.display = 'block';
      noteList.style.pointerEvents = 'auto';
    }
  };

  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value,
    };
    saveNote(newNote).then(() => {
      activeNote = null;
      isNewNote = false;
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  const handleNoteDelete = (e) => {
    e.stopPropagation();

    const note = e.target;
    const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

    if (activeNote && activeNote.id === noteId) {
      activeNote = null;
    }

    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.currentTarget.getAttribute('data-note'));
    renderActiveNote();
  };

  const handleNewNoteView = () => {
    activeNote = null;
    isNewNote = true;
    renderActiveNote();
    show(saveNoteBtn);
  };

  const handleRenderSaveBtn = () => {
    if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  const createLi = (note) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = note.title;

    const contentEl = document.createElement('p');
    contentEl.classList.add('list-item-content');
    contentEl.innerText = note.text.slice(0, 24) + '...';

    liEl.append(spanEl, contentEl);

    const delBtnEl = document.createElement('i');
    delBtnEl.classList.add(
      'fas',
      'fa-trash-alt',
      'float-right',
      'text-danger',
      'delete-note'
    );
    delBtnEl.addEventListener('click', handleNoteDelete);

    liEl.append(delBtnEl);

    liEl.setAttribute('data-note', JSON.stringify(note));
    liEl.addEventListener('click', handleNoteView);

    return liEl;
  };

  const renderNoteList = (notes) => {
    noteList.innerHTML = '';

    if (notes.length === 0) {
      const liEl = createLi({ title: 'No saved notes', text: '' });
      noteList.appendChild(liEl);
    } else {
      notes.forEach((note) => {
        const liEl = createLi(note);
        noteList.appendChild(liEl);
      });
    }
  };

  const getAndRenderNotes = () => {
    console.log('Getting notes...');
    getNotes()
      .then((notes) => {
        console.log('Notes:', notes);
        renderNoteList(notes);
      })
      .catch((error) => console.error(error));
  };

  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);

  getAndRenderNotes();
});

