let betroom;

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
    
    let targetText = document.createElement("p");
    targetText.className = "target-text";
    targetText.innerHTML = document.form.target.value;
    // MSG送信
    betroom = document.form.title.value;
    console.log(betroom);
    newPostRef.ref(betroom).push({
      target: document.form.target.value
    });
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
  })
}

$("body").on("click", ".output-contents", function(){
  const t = this.innerText;
  const h1 = $(".bet-title");
  h1.append(t);
  newPostRef.ref(t).on("child_added", function (data) {
  const v = data.val();
  $(".bet-target").append("<label class='target'><input type='radio' name='bet'>"+ v.target +"</label>");
  $(".bet-window").show();
  })
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
  localStorage.setItem("name", userName);
  localStorage.setItem("login", "true")
})

//ログイン
$("#login").on("click", function(){
  $("#login_window").show();
  
})