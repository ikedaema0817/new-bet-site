//ルールhasCoinをグローバルで定義しない（あとで）
let betroom;
let hasCoin;
let targetName;

//firebase
// Initialize Firebase
var config = {
  apiKey: "AIzaSyDfhUoIoz-Z9fWRfqqDAxOSNIg95TeGNfk",
  authDomain: "betsite-0817.firebaseapp.com",
  databaseURL: "https://betsite-0817.firebaseio.com",
  projectId: "betsite-0817",
  storageBucket: "betsite-0817.appspot.com",
  messagingSenderId: "705141590851"
};
firebase.initializeApp(config);
// MSG送受信準備
const newPostRef = firebase.database();



$("#plus").on("click", function(){
  $("#insert-content").show();
})

$("#target").keypress((e) => {
  if(e.which == 13){
    if(document.form.title.value==""){
      //あとでタイトルを入力してくださいをだす
      return;
    }
    
    betroom = document.form.title.value;

    //targetのテキストをひな
    const tText = document.form.target.value;
    
    let targetText = document.createElement("p");
    targetText.className = "target-text";
    targetText.innerHTML = tText;
    // MSG送信
    betroom = document.form.title.value;

    //targetをPUSH
    // newPostRef.ref(betroom+"/"+tText+"/").push({
      // console.log(newPostRef.ref(betroom+"/"))
    newPostRef.ref(betroom+"/"+tText + '/').set(0)
    //   // tText = {
    //   //   target: document.form.target.value,
    //   //   coin: 0
    //   // }

    //   //ここ！

    //   tText: 0,
    // });

    
    document.form.target.value = "";
    $(".target-out").after(targetText);
  }
})

$(".input-finish").on("click", function(){
  newPostRef.ref("/room/").push({
  betroom: betroom
  });
  $("#insert-content").hide();
})

//ブラウザロードしたら一覧読み込み
window.onload = function(){
  newPostRef.ref("room").on("child_added", function (data) {
    const v = data.val()
    let roomName = v.betroom;
    const str = "<p class='output-contents'>"+ roomName +"<p>";

  $(".output-content").append(str);
  console.log("test");

//ブラウザをロードした時、ログインしていたら（ローカルストレージにログインした形跡があったらログインとsignupボタンを非表示、コインを表示）
  //trueはローカルストレージに入っているので論理式ではなく文字列として表記
  if(localStorage.getItem("login") == "true"){
    $("#signup").hide();
    $("#login").hide();
    //coin数を定義（セキュリティ的にそれでいいのか？）ユーザーネームはローカルストレージから取得。。。あとで改善するかも
    const userName = localStorage.getItem("name");
    newPostRef.ref(userName).on("child_added", function(data){
      hasCoin = data.val().coin;
      //#acountを表しユーザーネームとcoin数を表記
      const ID = document.getElementById("acount")
      console.log("test");
      //間隔が開かない・・・・あとで
      ID.innerText = "ID:" + " " + userName + " " + " " + "所持コイン数:"+ " " + hasCoin;
      $("#acount").show();
    })
    
  }
    
  })
}

//ホームページから賭けのタイトルをクリックした時の処理
$("body").on("click", ".output-contents", function(){
  const t = this.innerText;
  //betOnのために変数に賭けのタイトルを格納しておく//格納されてないかと思ったら格納されていた//promise化したい
  betroom = t;
  const h1 = $(".bet-title");
  h1.append(t);
  load();
  newPostRef.ref(betroom+"/").on("child_added", function (data) {
    const v = data.val();
    const k = data.key;
    console.log(k);
    console.log(v);
    //ここ！
    $(".bet-target").append("<div class='target-wrapper'><p>"+ k
    +"</p><input class='bet-coin' id='bet_coin' type='number' placeholder='何coinBETする？'><input class='subButton' type='button' value='bet' data-target="+k+"></div><p class='bet-count' id='bet_count'>"+v+"</p><p id='odds' class='odds'></p>");
    $(".bet-window").show();
  });
  setTimeout(
    function(){load()}, 1000)
})
//signupきのう
$("#signup").on("click", function(){
  $("#signup_window").show();
})

$("#in").on("click", function(){
  const userName = $("#id_name").val();
  const passWord = $("#password").val();
  
  //ログインあとでpromissを付け加えます
  newPostRef.ref(userName).push({
    username: userName,
    password: passWord,
    coin: 100
  })
  //これも改善の余地があるだろう
  alert("アカウントを登録しました。上の「ログイン」からログインしてください")
  $("#signup_window").hide();
})

//ログインあとでpromissを付け加えます
$("#login").on("click", function(){
  $("#login_window").show();
})

//今はアラートでログインを表現しているが改善の余地があるだろう
$("#log_in").on("click", ()=>{
  const userName = $("#id").val();
  const passWord = $("#pass").val();
  newPostRef.ref(userName).on("child_added", function(data){
    if(passWord == data.val().password){ 
      localStorage.setItem("name", userName);
      localStorage.setItem("login", true);
      alert("ログインしました");
      location.reload();
    } else {
      alert("ログインに失敗しました。IDかパスワードが間違っている可能性があります")
      $("#login_window").hide();
      return;
    }
  })
})

//BETボタンを押した時の処理
 function betOn(kind){
  console.log(kind);

  console.log(betroom);
  //targetNameを定義
  const targetName = kind;
  //confirmで承認したら,BET実行
  if(window.confirm($("#bet_coin").val()+ "coinをBETしますか？")){
    //ここで賭け対象名を代入しておく
    const userName = localStorage.getItem("name");
    //一旦読みだして変数に代入
    newPostRef.ref(userName).on("child_added", function(data){
      hasCoin = data.val().coin;
      
      hasCoin -= $("#bet_coin").val();
      let key = data.key;
      let data_new = {
        coin: hasCoin,
        password: data.val().password,
        username: data.val().username
      };
      data_new["coin"] = hasCoin;

      // Write the new post's data simultaneously in the posts list and the user's post list.
      var updates = {};
      updates[userName + "/" + key ] = data_new;
      return firebase.database().ref().update(updates);
    })
    //総BET数に追加//room名をクリックした時にすでに変数にルーム名を格納しておく、そして賭け対象名をクリックした時、それを変数に代入、ルーム名/賭け対象名/に格納
    newPostRef.ref(betroom+"/"+targetName).on("child_added", function(data){
      console.log(data);
    })
    
  }else{
    window.alert('キャンセルされました');
  }
}


//押した値を取るためのコールバック〜betOnへ
function load() {
  $(".subButton").on("click", function(){
    var kind = $(this).attr("data-target");
    betOn(kind);
  })
}


  

