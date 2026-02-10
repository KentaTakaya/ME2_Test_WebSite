/**
 * ME2種試験 過去問学習アプリ メインロジック
 */

let allQuestions = [];
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let isAnswered = false;

// DOM要素
const screens = {
    selection: document.getElementById('selection-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen')
};

const testList = document.getElementById('test-list');
const testNameDisplay = document.getElementById('test-name-display');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const questionField = document.getElementById('question-field');
const questionNumDisplay = document.getElementById('question-num-display');
const questionText = document.getElementById('question-text');
const imageContainer = document.getElementById('question-image-container');
const questionImage = document.getElementById('question-image');
const optionsArea = document.getElementById('options-area');
const feedbackArea = document.getElementById('feedback-area');
const resultStatus = document.getElementById('result-status');
const explanationText = document.getElementById('explanation-text');
const nextBtn = document.getElementById('next-btn');
const finalScoreValue = document.getElementById('final-score-value');
const totalQuestionsDisplay = document.getElementById('total-questions');
const scoreMessage = document.getElementById('score-message');
const restartBtn = document.getElementById('restart-btn');

// スクラッチパッド関連
const scratchpadContainer = document.getElementById('scratchpad-container');
const scratchpadOverlay = document.getElementById('scratchpad-overlay');
const canvas = document.getElementById('scratchpad-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let tool = 'pen'; // 'pen' or 'eraser'

/**
 * 初期化
 */
async function init() {
    try {
        const response = await fetch('./questions.json');
        allQuestions = await response.json();
        showSelectionScreen();
    } catch (error) {
        console.error('データロード失敗:', error);
        questionText.innerText = '問題データのロードに失敗しました。';
    }

    setupScratchpad();
    setupEventListeners();
}

/**
 * 画面切り替え
 */
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

/**
 * 試験選択画面の表示
 */
function showSelectionScreen() {
    showScreen('selection');
    testList.innerHTML = '';

    // testNameでユニークな試験リストを作成
    const testNames = [...new Set(allQuestions.map(q => q.testName))];

    testNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'test-item';
        div.innerText = name;
        div.onclick = () => startQuiz(name);
        testList.appendChild(div);
    });
}

/**
 * クイズ開始
 */
function startQuiz(testName) {
    currentQuestions = allQuestions.filter(q => q.testName === testName);
    currentIndex = 0;
    score = 0;
    testNameDisplay.innerText = testName;
    showScreen('quiz');
    showQuestion();
}

/**
 * 問題表示
 */
function showQuestion() {
    const q = currentQuestions[currentIndex];
    isAnswered = false;

    // UI更新
    questionField.innerText = `分野: ${q.field || '未分類'}`;
    questionNumDisplay.innerText = `No. ${q.questionNumber || currentIndex + 1}`;
    questionText.innerText = q.question;

    // 画像処理
    if (q.image) {
        questionImage.src = q.image;
        imageContainer.classList.remove('hidden');
    } else {
        imageContainer.classList.add('hidden');
    }

    // 進捗
    const total = currentQuestions.length;
    progressText.innerText = `問題 ${currentIndex + 1} / ${total}`;
    progressBar.style.width = `${((currentIndex + 1) / total) * 100}%`;

    // 選択肢
    optionsArea.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `${idx + 1}. ${opt}`;
        btn.onclick = () => checkAnswer(idx);
        optionsArea.appendChild(btn);
    });

    feedbackArea.classList.add('hidden');
    nextBtn.classList.add('hidden');
}

/**
 * 正誤判定
 */
function checkAnswer(selectedIdx) {
    if (isAnswered) return;
    isAnswered = true;

    const q = currentQuestions[currentIndex];
    const isCorrect = selectedIdx === q.answer;

    if (isCorrect) {
        score++;
        resultStatus.innerText = '正解！';
        resultStatus.style.color = 'var(--success)';
    } else {
        resultStatus.innerText = '不正解...';
        resultStatus.style.color = 'var(--error)';
    }

    // 全ボタンの状態更新
    const buttons = optionsArea.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.answer) {
            btn.classList.add('correct');
        } else if (idx === selectedIdx) {
            btn.classList.add('wrong');
        }
    });

    explanationText.innerText = q.explanation;
    feedbackArea.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
}

/**
 * 結果画面
 */
function showResult() {
    showScreen('result');
    finalScoreValue.innerText = score;
    totalQuestionsDisplay.innerText = currentQuestions.length;

    const percent = (score / currentQuestions.length) * 100;
    if (percent === 100) {
        scoreMessage.innerText = "完璧です！合格間違いなし！";
    } else if (percent >= 80) {
        scoreMessage.innerText = "素晴らしい！安定していますね。";
    } else if (percent >= 60) {
        scoreMessage.innerText = "合格ラインです。見直しを忘れずに。";
    } else {
        scoreMessage.innerText = "もう少し頑張りましょう。解説をよく読んで復習してください。";
    }
}

/**
 * イベントリスナー設定
 */
function setupEventListeners() {
    nextBtn.onclick = () => {
        currentIndex++;
        if (currentIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResult();
        }
    };

    restartBtn.onclick = () => {
        showSelectionScreen();
    };

    // スクラッチパッド
    document.getElementById('open-scratchpad').onclick = () => {
        scratchpadContainer.classList.remove('hidden');
        document.body.classList.add('scr-active');
        resizeCanvas();
    };

    document.getElementById('close-scratchpad').onclick = () => {
        scratchpadContainer.classList.add('hidden');
        document.body.classList.remove('scr-active');
    };

    document.getElementById('tool-pen').onclick = (e) => {
        tool = 'pen';
        updateToolUI(e.target);
    };

    document.getElementById('tool-eraser').onclick = (e) => {
        tool = 'eraser';
        updateToolUI(e.target);
    };

    document.getElementById('tool-clear').onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
}

/**
 * スクラッチパッド（Canvas）のロジック
 */
function setupScratchpad() {
    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineWidth = tool === 'eraser' ? 20 : 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#333333';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    }, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

function resizeCanvas() {
    // コンテナのサイズに合わせる
    const padding = 0;
    canvas.width = scratchpadContainer.clientWidth - padding;
    canvas.height = scratchpadContainer.clientHeight - 60; // ヘッダー分引く
}

function updateToolUI(activeBtn) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// 起動
init();
window.addEventListener('resize', resizeCanvas);
