import './todo.css';
import { auth, db } from './firebase.js';

import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';

const userEmail = document.getElementById('user-email');
const signOutButton = document.getElementById('sign-out-button');

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

const todoCount = document.getElementById('todo-count');
const unfinishedCount = document.getElementById('unfinished-count');

const deleteCompletedButton = document.getElementById('delete-completed-button');

const filterButtons = document.querySelectorAll('.filter-button');

let currentUser = null;
let currentFilter = 'all';

// リアルタイム監視の解除用
let unsubscribeAllTodos = null;
let unsubscribeFilteredTodos = null;

// Auth state
onAuthStateChanged(auth, async (user) => {
  // 前のユーザーの監視を解除
  if (unsubscribeAllTodos) {
    unsubscribeAllTodos();
  }

  if (unsubscribeFilteredTodos) {
    unsubscribeFilteredTodos();
  }

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  userEmail.textContent = user.email;

  startTodoListeners();
});

// User specific todo collection
function getTodoCollection() {
  return collection(db, 'todo', currentUser.uid, 'items');
}

// リアルタイム監視を開始
function startTodoListeners() {
  if (!currentUser) return;

  // 全TODOの件数をリアルタイムで監視
  unsubscribeAllTodos = onSnapshot(
    getTodoCollection(),
    (snapshot) => {
      // 全件数
      todoCount.textContent = snapshot.size;

      // 未完了件数
      const unfinished = snapshot.docs.filter(
        (documentSnapshot) => documentSnapshot.data().checked === false
      );

      unfinishedCount.textContent = unfinished.length;
    }
  );

  // TODO一覧のリアルタイム監視
  updateFilteredListener();
}

// フィルターに応じたリアルタイム監視
function updateFilteredListener() {
  if (!currentUser) return;

  // 前の監視を解除
  if (unsubscribeFilteredTodos) {
    unsubscribeFilteredTodos();
  }

  let todoQuery;

  if (currentFilter === 'unfinished') {
    todoQuery = query(
      getTodoCollection(),
      where('checked', '==', false),
      orderBy('time', 'desc')
    );
  } else if (currentFilter === 'completed') {
    todoQuery = query(
      getTodoCollection(),
      where('checked', '==', true),
      orderBy('time', 'desc')
    );
  } else {
    todoQuery = query(
      getTodoCollection(),
      orderBy('time', 'desc')
    );
  }

  unsubscribeFilteredTodos = onSnapshot(
    todoQuery,
    (snapshot) => {
      todoList.innerHTML = '';

      snapshot.forEach((documentSnapshot) => {
        const todo = documentSnapshot.data();
        const todoId = documentSnapshot.id;

        createTodoElement(todoId, todo);
      });
    }
  );
}

// DOM render
function createTodoElement(todoId, todo) {
  const item = document.createElement('div');
  item.classList.add('todo-item');

  if (todo.checked) {
    item.classList.add('completed');
  }

  // checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.checked;

  checkbox.addEventListener('change', async () => {
    await updateDoc(
      doc(db, 'todo', currentUser.uid, 'items', todoId),
      {
        checked: checkbox.checked
      }
    );
  });

  // title
  const title = document.createElement('span');
  title.classList.add('todo-title');
  title.textContent = todo.title;

  title.addEventListener('click', async () => {
    const newTitle = prompt('TODOのタイトルを変更', todo.title);

    if (newTitle === null) return;

    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
      alert('タイトルを入力してください。');
      return;
    }

    await updateDoc(
      doc(db, 'todo', currentUser.uid, 'items', todoId),
      {
        title: trimmedTitle
      }
    );
  });

  // delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '×';
  deleteButton.classList.add('delete-button');

  deleteButton.addEventListener('click', async () => {
    await deleteDoc(
      doc(db, 'todo', currentUser.uid, 'items', todoId)
    );
  });

  item.appendChild(checkbox);
  item.appendChild(title);
  item.appendChild(deleteButton);

  todoList.appendChild(item);
}

// add TODO
todoForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = todoInput.value.trim();

  if (title === '') return;
  if (!currentUser) return;

  await addDoc(getTodoCollection(), {
    title: title,
    checked: false,
    time: new Date()
  });

  todoInput.value = '';
});

// Filter buttons
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    // フィルター変更時に監視を切り替える
    updateFilteredListener();
  });
});

// Delete all completed TODOs
deleteCompletedButton.addEventListener('click', async () => {
  if (!currentUser) return;

  const completedQuery = query(
    getTodoCollection(),
    where('checked', '==', true)
  );

  const snapshot = await getDocs(completedQuery);

  if (snapshot.empty) {
    alert('削除する完了済みTODOはありません。');
    return;
  }

  const confirmed = confirm(
    `完了したTODO ${snapshot.size}件をまとめて削除しますか？`
  );

  if (!confirmed) return;

  for (const documentSnapshot of snapshot.docs) {
    await deleteDoc(
      doc(db, 'todo', currentUser.uid, 'items', documentSnapshot.id)
    );
  }

  alert('完了したTODOを削除しました。');
});

// sign out
signOutButton.addEventListener('click', async () => {
  // ログアウト時に監視を解除
  if (unsubscribeAllTodos) {
    unsubscribeAllTodos();
  }

  if (unsubscribeFilteredTodos) {
    unsubscribeFilteredTodos();
  }

  await signOut(auth);
  window.location.href = 'index.html';
});