//ルールhasCoinをグローバルで定義しない（あとで）
let betroom;
let hasCoin;
let targetName;
let coinCount;
let betCoin;
//変数allCountこれはルームのターゲットのコインを全て足した変数
let allCount = 0;
let betlogCoin;
let allbet;
let returnCoin;
let targetAllbet;
let idHasCoin;
let nowDate;

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



$("#plus").on("click", function () {
  $("#insert-content").show();
})

$("#target").keypress((e) => {
  if (e.which == 13) {
    if (document.form.title.value == "") {
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
    newPostRef.ref(betroom + "/" + tText + '/').set(0)
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

$(".input-finish").on("click", function () {
  newPostRef.ref("/room/" + betroom).update({
    betroom: betroom
  });
  let date = Date.parse($("#my-form [name=kigen]").val());
  console.log(date);
  //firebaseに時間を送り込む
  newPostRef.ref("/time/" + betroom).update({
    time: date
  });
  $("#insert-content").hide();
  location.reload();
})

//ブラウザロードしたら一覧読み込み
window.onload = function () {
  nowDate = Date.parse(new Date());
  //もし管理アカウントだったら新規ページ作成画面表示
  if (localStorage.getItem("name") == "ema" || localStorage.getItem("name") == "kei" || localStorage.getItem("name") == "ikeda") {
    $("#plus").show()
  }
  newPostRef.ref("room").on("child_added", function (data) {
    const v = data.key
    let roomName = v;
    const str = "<p class='output-contents'>" + roomName + "<p>";

    $(".output-content").append(str);

    //ブラウザをロードした時、ログインしていたら（ローカルストレージにログインした形跡があったらログインとsignupボタンを非表示、コインを表示）
    //trueはローカルストレージに入っているので論理式ではなく文字列として表記
    if (localStorage.getItem("login") == "true") {
      $("#signup").hide();
      $("#login").hide();
      //coin数を定義（セキュリティ的にそれでいいのか？）ユーザーネームはローカルストレージから取得。。。あとで改善するかも
      const userName = localStorage.getItem("name");
      newPostRef.ref(userName).once("value", function (data) {
        hasCoin = data.val().coin;
        //#acountを表しユーザーネームとcoin数を表記
        const ID = document.getElementById("acount");
        //間隔が開かない・・・・あとで
        ID.innerText = "ID:" + " " + userName + " " + " " + "所持コイン数:" + " " + hasCoin;
        $("#acount").show();
      })

    }

  })
}

//ホームページから賭けのタイトルをクリックした時の処理
$("body").on("click", ".output-contents", function () {
  if (localStorage.getItem("name") == "ema" || localStorage.getItem("name") == "kei" || localStorage.getItem("name") == "ikeda") {
    $("#button_fix").show()
  }
  //allCountを初期化
  allCount = 0;

  const t = this.innerText;
  //betOnのために変数に賭けのタイトルを格納しておく//格納されてないかと思ったら格納されていた//promise化したい
  betroom = t;
  //時間期限を表示
  newPostRef.ref("/time/" + betroom).once("value", function (data) {
    console.log(new Date(data.val().time));
    $(".bet-time").text("BET期限は" + new Date(data.val().time) + "です！");
  })


  const h1 = $(".bet-title");
  h1.append(t);
  newPostRef.ref(betroom + "/").once("value", function (data) {
    const v = data.val();
    const k = data.key;
    //オッズを求める！！！！
    // console.log(Object.keys(v));
    // $(".bet-target").append("<div class='target-wrapper'><label><input name='target' type='radio' class='target-radio' id='target_radio'>" + k + "</label>" +
    // // <input class='bet-coin' id='bet_coin' type='number' placeholder='何coinBETする？'>
    // "<p class='bet-count' id='bet_count'>総BET枚数：" + v[k] + "</p><p id='odds' class='odds'>倍率："+allCount / v[k] +"</p></div>");
    // $(".bet-window").show();
    // }
    for (let k in v) {
      allCount += v[k];

    }
    newPostRef.ref("/allcount/" + betroom).update({
      allcount: allCount
    })






    for (let k in v) {
      if (v[k] !== 0) {
        var odds = allCount / v[k];

      } else {
        odds = 0
      }

      // console.log(odds);
      // if(odds == infinity){
      //   odds = 0;
      // }
      $(".bet-target").append("<div class='target-wrapper'><label><input name='target' type='radio' class='target-radio' id='target_radio'>" + k + "</label>" +
        // <input class='bet-coin' id='bet_coin' type='number' placeholder='何coinBETする？'>
        "<p class='bet-count' id='bet_count'>総BET枚数：" + v[k] + "</p><p id='odds' class='odds'>倍率：" + odds + "</p></div>");
      $(".bet-window").show();
    }
  })

  //最後にこれを実行すればいい計算
  // newPostRef.ref(betroom + "/").on("child_added", function (data) {
  //   const v = data.val();
  //   const k = data.key;
  // $(".bet-target").append("<div class='target-wrapper'><label><input name='target' type='radio' class='target-radio' id='target_radio'>" + k + "</label>" +
  //   // <input class='bet-coin' id='bet_coin' type='number' placeholder='何coinBETする？'>
  //   "<p class='bet-count' id='bet_count'>総BET枚数：" + v + "</p><p id='odds' class='odds'>倍率："+allCount+"</p></div>");
  // $(".bet-window").show();
  // });

  // setTimeout(
  //   function(){load()}, 1000)
})
//signupきのう
$("#signup").on("click", function () {
  $("#signup_window").show();
})

$("#in").on("click", function () {
  const userName = $("#id_name").val();
  const passWord = $("#password").val();

  //ログインあとでpromissを付け加えます
  newPostRef.ref(userName).update({
    username: userName,
    password: passWord,
    coin: 100
  })
  //これも改善の余地があるだろう
  alert("アカウントを登録しました。上の「ログイン」からログインしてください")
  $("#signup_window").hide();
})

//ログインあとでpromissを付け加えます
$("#login").on("click", function () {
  $("#login_window").show();
})

//今はアラートでログインを表現しているが改善の余地があるだろう
$("#log_in").on("click", () => {
  const userName = $("#id").val();
  const passWord = $("#pass").val();
  newPostRef.ref(userName).once("value", function (data) {
    console.log(data.val());
    if (passWord == data.val().password) {
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
//  function betOn(kind){
function betOn() {
  func3();
  // setTimeout(function() {func4()}, 1000);
}

function func3() {

  //もしbetボタンを押した時期限を過ぎていたらエラー
  newPostRef.ref("/time/" + betroom).once("value", function (data) {
    console.log(data.val().time);
    if (data.val().time < nowDate) {
      alert("BET可能期限を過ぎています。");
      location.reload();
      throw new Error("BET可能期限を過ぎています。リロードしてください");
    }
    func4();
  })
}


//上野が終わった後実行
function func4() {

  console.log("test2");

  //confirmで承認したら,BET実行
  // if (window.confirm($("#bet_coin").val() + "coinをBETしますか？")) {
  //targetNameを定義
  const targetName = $("[name=target]:checked").parent("label").text();
  // console.log(kind);
  console.log(betroom);
  //ここで賭け対象名を代入しておく
  const userName = localStorage.getItem("name");
  //$("#bet_coin").val()を数値化
  betCoin = Number($("#bet_coin").val());
  console.log(betCoin);

  //BETのログを全部雨記録していく改装、まずはデータを読んでそれに足して
  newPostRef.ref("/betlog/" + betroom + "/" + targetName + "/" + userName).once("value", function (data) {

    betlogCoin = data.val();
    for (let k in betlogCoin) {
      betlogCoin = betlogCoin[k]
    }
    console.log(betlogCoin);


    if (betlogCoin == null) {
      betlogCoin = 0;
    }
    console.log(betlogCoin);

    betlogCoin = parseInt(betlogCoin, 10);
    betlogCoin += betCoin;
    newPostRef.ref("/betlog/" + betroom + "/" + targetName + "/" + userName).update({
      betlogCoin: betlogCoin
    })
  })

  //一旦読みだして変数に代入
  newPostRef.ref(userName).once("value", function (data) {
    hasCoin = data.val().coin;
    console.log(hasCoin)
    if (hasCoin < betCoin) {
      alert("BETするコインが所持コインを超えています");
      return;
    }
    //このアカウントが持っているコインを入れている
    hasCoin -= betCoin;
    console.log(hasCoin);

    newPostRef.ref(userName).update({
      coin: hasCoin
    })
    // let key = data.key;
    // let data_new = {
    //   coin: hasCoin,
    //   password: data.val().password,
    //   username: data.val().username
    // };
    // data_new["coin"] = hasCoin;

    // var updates = {};
    // updates[userName + "/" + key] = data_new;
    // return firebase.database().ref().update(updates);
  })
  //総BET数に追加//room名をクリックした時にすでに変数にルーム名を格納しておく、そして賭け対象名をクリックした時、それを変数に代入、ルーム名/賭け対象名/に格納
  newPostRef.ref(betroom + "/" + targetName).once("value", function (data) {
    console.log(data.key);
    console.log(data.val());
    //data.val()というオブジェクトから数値を取り出す
    // const numCoin = Object.keys(data.val()).map((k) => {return data.val()[k]; });
    // console.log(numCoin);
    //
    //betコイン数をtargetの値に追加
    const coi = betCoin + data.val();
    console.log(coi);
    newPostRef.ref(betroom + "/").update({
      [targetName]: coi
    })

    //targetのcoin数を一時避難
    // var coi = data.val();
    // console.log(coi);
    //coiを数値化
    // console.log(parseInt(coi, 10));
    // coi = parseInt(coi, 10);
    // coi += $("#bet_coin").val();
    // console.log(coi);
    // newPostRef.ref(betroom+"/"+targetName).update({
    //   [targetName]: coi
    // })
  })

  // } else {
  //   window.alert('キャンセルされました');
  // }
  alert(targetName + "にBETしました");
  location.reload();
}



//押した値を取るためのコールバック〜betOnへ
// function load() {
//   $(".subButton").on("click", function(){
//     var kind = $(this).attr("data-target");
//     // betに入れたcoin数を定義
//     coinCount = $("#bet_coin").val();
//     betOn(kind);
//   })
// }


//fixした時の処理
function betFix() {
  //targetNameを定義
  targetName = $("[name=target]:checked").parent("label").text();
  console.log(targetName)
  // console.log(targetName);
  // //下がなかった時の処理は保留
  newPostRef.ref("/betlog/" + betroom).once("value", function (data) {
    console.log(data.val());
    console.log(data.val()[targetName]);

    if (data.val()[targetName] == undefined) {
      console.log("aaa");
        // delete処理
        newPostRef.ref("/betlog/" + betroom).remove();
        newPostRef.ref("/allcount/" + betroom).remove();
        newPostRef.ref("/room/" + betroom).remove();
        newPostRef.ref(betroom).remove();
        newPostRef.ref("/time/" + betroom).remove();
        console.log("aaa");
        location.reload();
    } else aaa();
  })

  function aaa() {
    newPostRef.ref("/betlog/" + betroom + "/" + targetName).on("child_added", function (data) {

      // console.log(data);
      var obj = data.val();

      // for (let k in obj) {
      //   //keiとbetlogCoinをだすコード
      //   console.log(k, obj[k].betlogCoin)
      var id = data.key;
      var logCoin = data.val().betlogCoin;
      // }  
      // console.log(logCoin);

      //idの所持コインを呼び出し代入
      const func1 = new Promise(function (resolve, reject) {
        newPostRef.ref(id).once("value", function (data) {
          //該当idの所持coin
          idHasCoin = data.val().coin;
          console.log("func1");
          resolve();
        })
      });

      //該当の部屋の総BET数を記録
      const func2 = new Promise(function (resolve, reject) {
        newPostRef.ref("/allcount/" + betroom).once("value", function (data) {
          allbet = data.val().allcount;
          console.log("func2");
          resolve();
        })
      });

      const func3 = new Promise(function (resolve, reject) {
        newPostRef.ref(betroom + "/" + targetName).once("value", function (data) {
          targetAllbet = data.val();
          console.log("func3");
          resolve();
        })
      });

      Promise.all([func1, func2, func3]).then(function () {
        //全てを数値化
        // console.log("aiiPromise");
        logCoin = parseInt(logCoin, 10);
        targetAllbet = parseInt(targetAllbet, 10);
        allbet = parseInt(allbet, 10);
        // console.log(logCoin);
        // console.log(targetAllbet);
        // console.log(allbet);
        // console.log(idHasCoin)
        //返すコインを求める
        returnCoin = Math.ceil(logCoin * (allbet / targetAllbet));
        // console.log(returnCoin);
        idHasCoin += returnCoin;

        //idの所持コインに返す
        newPostRef.ref(id).update({
          coin: idHasCoin
        })
        // delete処理
        newPostRef.ref("/betlog/" + betroom).remove();
        newPostRef.ref("/allcount/" + betroom).remove();
        newPostRef.ref("/room/" + betroom).remove();
        newPostRef.ref(betroom).remove();
        newPostRef.ref("/time/" + betroom).remove();
        location.reload();
      });

      // newPostRef.ref(betroom+"/").update({
      //   [id] : coi
      // })



    })
  }

}
