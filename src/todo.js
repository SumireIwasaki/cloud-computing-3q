
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
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

const userEmail = document.getElementById('user-email');
const signOutButton = document.getElementById('sign-out-button');

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

const filterButtons = document.querySelectorAll('.filter-button');

let currentUser = null;
let currentFilter = 'all';

// ログイン状態の確認
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  userEmail.textContent = user.email;

  await loadTodos();
});

// ユーザーごとのTODOコレクションを取得
function getTodoCollection() {
  return collection(db, 'todo', currentUser.uid, 'items');
}

// TODOの取得
async function loadTodos() {
  if (!currentUser) return;

  let todoQuery;

  if (currentFilter === 'unfinished') {
    todoQuery = query(
      getTodoCollection(),
      where('checked', '==', false)
    );
  } else if (currentFilter === 'completed') {
    todoQuery = query(
      getTodoCollection(),
      where('checked', '==', true)
    );
  } else {
    todoQuery = query(getTodoCollection());
  }

  const snapshot = await getDocs(todoQuery);

  todoList.innerHTML = '';

  snapshot.forEach((documentSnapshot) => {
    const todo = documentSnapshot.data();
    const todoId = documentSnapshot.id;

    createTodoElement(todoId, todo);
  });
}

// HTMLにTODOを作成
function createTodoElement(todoId, todo) {
  const item = document.createElement('div');
  item.classList.add('todo-item');

  if (todo.checked) {
    item.classList.add('completed');
  }

  // チェックボックス
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

    await loadTodos();
  });

  // TODOタイトル
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

    await loadTodos();
  });

  // 削除ボタン
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '×';
  deleteButton.classList.add('delete-button');

  deleteButton.addEventListener('click', async () => {
    await deleteDoc(
      doc(db, 'todo', currentUser.uid, 'items', todoId)
    );

    await loadTodos();
  });

  item.appendChild(checkbox);
  item.appendChild(title);
  item.appendChild(deleteButton);

  todoList.appendChild(item);
}

// TODOの追加
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

  await loadTodos();
});

// 表示切り替え
filterButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    await loadTodos();
  });
});

// サインアウト
signOutButton.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});
