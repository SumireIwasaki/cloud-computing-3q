import './style.css';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase.js';

const form = document.getElementById('form-sign-in');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = data.get('email');
  const password = data.get('password');

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/invalid-credential') {
      alert('メールアドレスまたはパスワードが違います。');
    } else {
      alert('サインインに失敗しました：' + error.code);
    }
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.assign('todo.html');
  }
});