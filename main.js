/*ルールと仕様
  - Aは1or11として最善手を自動で計算する
  - バーストしない限り何枚でもヒットできる(初期手札がブラックジャックの場合はヒットできない)
  - 3枚以上の21はブラックジャックには勝てない
  - ディーラ(CPU)は16以下の場合必ずヒットする
  - 両者ともバーストした場合は引き分け
  - Aが2枚きたときの1or11の判定は1としてしか扱えない(片方だけ11とかにしたい)
*/

let deck;
let dealerCards = [];
let playerCards = [];

initialize();

//基本処理
function initialize() {
    window.onload = function () {
        const marks = ["Spade", "Heart", "Dia", "Club"];
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        deck = marks.reduce((previous, mark) => {
            return previous.concat(numbers.map(number => {
                return [mark, number]
            }));
        }, []);
        suffle(deck);
        for (let i = 0; i < 2; i++) {
            drawCard(playerCards);
        }
        for (let i = 0; i < 2; i++) {
            drawCard(dealerCards);
        }
        while (judgeAddDealerCards()) {
            drawCard(dealerCards);
        }
        showImages("my-image", playerCards);
        showTotal("my-total", playerCards);
        initializeDealerImages();
    }
}

// カードをシャッフルする
function suffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        const tmp = deck[i];
        deck[i] = deck[r];
        deck[r] = tmp;
    }
}
// 相手プレイヤーの初期画像をセットする
function initializeDealerImages() {
    showImage("dealer-image", dealerCards[0]);
    showReverseCardImage("dealer-image");
}

// トランプの裏の画像を表示する
function showReverseCardImage(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    const cardElement = document.createElement("img");
    fieldElement.appendChild(cardElement);
    cardElement.src = "images/card.png";
}

// カードの画像をすべて表示する
function showImages(imageListId, cards) {
    for (let i = 0; i < cards.length; i++) {
        showImage(imageListId, cards[i]);
    }
}

// カードの画像を一枚追加(表示)する
function showImage(fieldId, card) {
    const fieldElement = document.getElementById(fieldId);
    const cardElement = document.createElement("img");
    fieldElement.appendChild(cardElement);
    const markToPrefix = {
        "Spade":"s",
        "Heart": "h",
        "Dia":"d",
        "Club":"c"
    }
    const mark = markToPrefix[card.mark];
    const number = card.number;
    cardElement.src = "images/" + mark + number + ".gif";
}

// 10以上の数字を10にする
function limitTo10(number) {
    return number > 10 ? 10 : number;
}

// 相手のカードを追加するかどうか判定する
function judgeAddDealerCards() {
    const dealerTotal = calculateTotal(dealerCards);
    const dealerTotalA = calculateTotalA(dealerCards);
    return dealerTotalA < 17 && dealerTotal < 17;
}

// プレイヤーのカードを追加で引く
function getMyCard() {
    if (calculateBestTotal(playerCards) < 21) {
        const card = drawCard(playerCards);
        showImage('my-image', card);
        showTotal("my-total", playerCards);
    }
}

// カードをひく
function getCard() {
    let mark, number;
    [mark, number] = deck.shift();
    return { mark: mark, number: number };
}

// カードをひいてリストに追加
function drawCard(cards) {
    const card = getCard();
    cards.push(card);
    return card;
}

// 21より大きい場合はバースト
function judgeBurst(total) {
    return total > 21;
}

// 合計値を計算する
function calculateTotal(cards) {
    return cards
        .map(card => card.number)
        .map(limitTo10)
        .reduce((previous, dealerNumber) => previous + dealerNumber);
}

// バーストしていない場合だけ11として合計を計算
function calculateTotalA(cards) {
    const total = cards
        .map(card => card.number)
        .map(limitTo10)
        .map(changeTo11)
        .reduce((previous, dealerNumber) => previous + dealerNumber);
    return judgeBurst(total) ? calculateTotal(cards) : total;
}

// 1を11に変える
function changeTo11(number) {
    return number == 1 ? 11 : number;
}

// 合計値の表示
function showTotal(totalElementId, cards) {
    const total = calculateBestTotal(cards);
    const totalTextElement = document.getElementById(totalElementId);
    if (isBlackJack(cards)) {
        totalTextElement.textContent = "合計：" + total + " <BlackJack!!>";
    } else {
        totalTextElement.textContent = "合計：" + total;
    }
}

// BlackJackの判定
function isBlackJack(cards) {
    return cards.length == 2 && calculateTotalA(cards) == 21;
}

// 勝敗の表示
function showResult() {
    showDealerImages().then(() => {
        showTotal("dealer-total", dealerCards);
        setTimeout(() => {
            const result=judgeWinner();
            alert(result);
            changeButton();
        }, 1000);
    });
}

// 勝敗の決定
function judgeWinner() {
    const playerTotal = calculateBestTotal(playerCards);
    const playerIsBurst = judgeBurst(playerTotal);
    const dealerTotal = calculateBestTotal(dealerCards);
    const dealerIsBurst = judgeBurst(dealerTotal);
    if (playerIsBurst && dealerIsBurst || isBlackJack(playerCards) && isBlackJack(dealerCards)
        || !isBlackJack(playerCards) && !isBlackJack(dealerCards) && playerTotal == dealerTotal) {
        return "引き分け";
    } else if (playerIsBurst || !dealerIsBurst && !isBlackJack(playerCards) && (playerTotal < dealerTotal)) {
        return "あなたの負け...";
    } else if (dealerIsBurst || !playerIsBurst && !isBlackJack(dealerCards) && (dealerTotal < playerTotal) || isBlackJack) {
        return "あなたの勝ち!!";
    } else {
        return "Error!";
    }
}

// 相手プレイヤーの画像を表にして表示する
function showDealerImages() {
    const imageElement = document.getElementById("dealer-image");
    imageElement.removeChild(imageElement.childNodes.item(1));
    const promises = [];
    for (let i = 1; i < dealerCards.length; i++) {
        promises[i] = new Promise((resolve) => {
            setTimeout(() => {
                showImage("dealer-image", dealerCards[i]);
                resolve();
            }, 500 * (i - 1));
        });
    }
    return Promise.all(promises);
}

// Aを1か11いずれで扱うか判定し、適切な合計値を返す
function calculateBestTotal(cards) {
    const totalA = calculateTotalA(cards);
    const total = calculateTotal(cards);
    return totalA <= 21 ? totalA : total;
}

// ボタンの表示切り替え
function changeButton() {
    const buttonListElement = document.getElementById("button-list");
    buttonListElement.innerHTML = null;
    const retryButtonElement = document.getElementById("retry-button");
    retryButtonElement.style.display = "block";
}