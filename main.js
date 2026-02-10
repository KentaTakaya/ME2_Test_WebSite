/**
 * クイズアプリのメインロジック
 * 初心者の方でも読みやすいよう、機能を分割して記述しています。
 */

let questions = [];
let currentIndex = 0;
let score = 0;

// DOM要素の取得
const quizCard = document.getElementById('quiz-card');
const scoreCard = document.getElementById('score-card');
const questionText = document.getElementById('question-text');
const optionsArea = document.getElementById('options-area');
const feedbackArea = document.getElementById('feedback-area');
const explanationText = document.getElementById('explanation-text');
const resultStatus = document.getElementById('result-status');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const finalScoreValue = document.getElementById('final-score-value');
const restartBtn = document.getElementById('restart-btn');

/**
 * データのロード
 */
async function loadQuestions() {
    try {
        const response = await fetch('./questions.json');
        questions = await response.json();
        initQuiz();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        questionText.innerText = '問題データの読み込みに失敗しました。';
    }
}

/**
 * クイズの初期化
 */
function initQuiz() {
    currentIndex = 0;
    score = 0;
    quizCard.classList.remove('hidden');
    scoreCard.classList.add('hidden');
    showQuestion();
}

/**
 * 問題を表示する
 */
function showQuestion() {
    const q = questions[currentIndex];

    // UIの更新
    questionText.innerText = q.question;
    optionsArea.innerHTML = '';
    feedbackArea.classList.add('hidden');

    // 進捗の更新
    const progress = ((currentIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.innerText = `問題 ${currentIndex + 1} / ${questions.length}`;

    // 選択肢の生成
    q.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerText = option;
        button.onclick = () => checkAnswer(index);
        optionsArea.appendChild(button);
    });
}

/**
 * 正誤判定
 */
function checkAnswer(selectedIndex) {
    const q = questions[currentIndex];
    const isCorrect = selectedIndex === q.answer;

    // 全てのボタンを無効化し、正解・不正解を色付け
    const buttons = optionsArea.querySelectorAll('.option-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === q.answer) {
            btn.classList.add('correct');
        } else if (index === selectedIndex) {
            btn.classList.add('wrong');
        }
    });

    if (isCorrect) {
        score++;
        resultStatus.innerText = '正解！';
        resultStatus.style.color = 'var(--success)';
    } else {
        resultStatus.innerText = '不正解...';
        resultStatus.style.color = 'var(--error)';
    }

    explanationText.innerText = q.explanation;
    feedbackArea.classList.remove('hidden');
}

/**
 * 次の問題へ進む
 */
nextBtn.onclick = () => {
    currentIndex++;
    if (currentIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
};

/**
 * 結果を表示する
 */
function showResult() {
    quizCard.classList.add('hidden');
    scoreCard.classList.remove('hidden');
    finalScoreValue.innerText = score;

    const message = score === questions.length
        ? "全問正解！素晴らしいです！"
        : score >= questions.length * 0.8
            ? "合格点です！その調子ですよ。"
            : "もう少しですね。復習してみましょう。";

    document.getElementById('score-message').innerText = message;
}

/**
 * 最初からやり直す
 */
restartBtn.onclick = () => {
    initQuiz();
};

// アプリ起動
loadQuestions();
