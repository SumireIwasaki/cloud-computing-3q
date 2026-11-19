import { auth, db } from './firebase.js';

import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

import {
  doc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';

// ログイン状態を確認
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('user-email').value = user.email;
  } else {
    window.location.href = '/index.html';
  }
});

// サインアウト
document
  .getElementById('form-sign-out')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      await signOut(auth);
      window.location.href = '/index.html';
    } catch (error) {
      alert('サインアウトに失敗しました');
      console.error(error);
    }
  });

// 練習問題1：IDを指定してデータを取得
document
  .getElementById('form-search-user')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    const documentId =
      document.getElementById('document-id').value.trim();

    const result = document.getElementById('search-result');

    try {
      const userDocRef = doc(db, 'users', documentId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();

        result.textContent =
          `名前：${data.name} / 年齢：${data.age}`;
      } else {
        alert('データが存在しません');
        result.textContent = '';
      }
    } catch (error) {
      console.error(error);
      alert('データの取得に失敗しました。Firestoreの設定を確認してください。');
    }
  });

// 練習問題2：コレクション全体を取得
document
  .getElementById('load-users')
  .addEventListener('click', async () => {
    const userList = document.getElementById('user-list');

    userList.replaceChildren();

    try {
      const usersCollectionRef = collection(db, 'users');
      const usersQuerySnapshot = await getDocs(usersCollectionRef);

      if (usersQuerySnapshot.empty) {
        userList.textContent = 'データがありません';
        return;
      }

      for (const userDocSnapshot of usersQuerySnapshot.docs) {
        const data = userDocSnapshot.data();

        const li = document.createElement('li');
        li.textContent =
          `ID：${userDocSnapshot.id} / 名前：${data.name} / 年齢：${data.age}`;

        userList.appendChild(li);
      }
    } catch (error) {
      console.error(error);
      alert('一覧の取得に失敗しました。Firestoreの設定を確認してください。');
    }
  });

