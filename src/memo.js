import { collection,addDoc,getDocs,query,orderBy,deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";

const itemsCollectionRef=collection(db,'items');
const memoInput=document.querySelector('#memo-input');
const addButton=document.querySelector('#add-button');
const memoList=document.querySelector('#memo-list');

//メモ一覧を取得して表示//
async function displayMemos(){
	try{
		const itemsQuery=query(
			itemsCollectionRef,
			orderBy('timestamp','asc')
		);
		const itemsQuerySnapshot=await getDocs(itemsQuery);
		//一旦空にする//
		memoList.innerHTML='';
		//取得したメモを順番に表示//
		for(const itemDocSnapshot of itemsQuerySnapshot.docs){
			const itemData=itemDocSnapshot.data();
			const li=document.createElement('li');
			
			//メモの日時をまとめる部分//
			const memoContent=document.createElement('div');
			
			//メモの文章//
			const memoText=document.createElement('span');
			memoText.textContent=itemData.text;
			memoText.classList.add('memo-text');
			
			//作成日時//
			const date=itemData.timestamp.toDate();
			const dateText=document.createElement('small');
			dateText.textContent=`(${date.toLocaleString('ja-JP')})`;
			dateText.classList.add('memo-date');
			memoContent.append(memoText,dateText);
			
			//削除ボタン//
			const deleteButton=document.createElement('button');
			deleteButton.textContent="削除";
			deleteButton.classList.add('delete-button');
			deleteButton.addEventListener('click',async()=>{
				try{
					await deleteDoc(itemDocSnapshot.ref);
					await displayMemos();
				}catch(error){
					console.error("削除に失敗しました。",error);
					alert("メモを削除できませんでした。");
				}
			});
			//HTMLに追加//
			li.append(memoText,dateText,deleteButton);
			memoList.append(li);
		}
		}catch(error){
			console.error('メモの取得に失敗しました。',error);
			alert('メモを取得できませんでした。');
	}
}
//追加ボタンを押した時//
addButton.addEventListener('click',async()=>{
	const memoText=memoInput.value.trim();
	if(memoText===''){
		alert('メモを入力してください。');
		return;
	}
	try{
		//Firestoreにメモを追加//
		await addDoc(itemsCollectionRef,{
			text:memoText,
			timestamp:new Date(),
		});
		//入力欄を空にする//
		memoInput.value='';
		//メモ一覧を更新//
		await displayMemos();
	}catch(error){
		console.error('メモの追加に失敗しました。',error);
		alert('メモを追加できませんでした。');
	}
});
//ページを開いたときにメモを表示//
displayMemos();
