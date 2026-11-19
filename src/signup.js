import './style.css';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase.js';

const form = document.getElementById('form-sign-up');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = data.get('email');
  const password = data.get('password');

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);

    if (error.code === 'auth/email-already-in-use') {
      alert('このメールアドレスはすでに登録されています。');
    } else if (error.code === 'auth/weak-password') {
      alert('パスワードは6文字以上にしてください。');
    } else {
      alert('新規登録に失敗しました：' + error.code);
    }
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.assign('user.html');
  }
});