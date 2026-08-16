document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const lengthRange = document.getElementById('length-range');
    const lengthValue = document.getElementById('length-value');
    const countRange = document.getElementById('count-range');
    const countValue = document.getElementById('count-value');

    const cbUppercase = document.getElementById('cb-uppercase');
    const cbLowercase = document.getElementById('cb-lowercase');
    const cbNumbers = document.getElementById('cb-numbers');
    const cbSymbols = document.getElementById('cb-symbols');
    const cbHiragana = document.getElementById('cb-hiragana');
    const cbKatakana = document.getElementById('cb-katakana');
    const switchExcludeSimilar = document.getElementById('exclude-similar');

    const btnGenerate = document.getElementById('btn-generate');
    const resultSection = document.getElementById('result-section');
    const resultList = document.getElementById('result-list');
    const btnCopyAll = document.getElementById('btn-copy-all');
    const toastContainer = document.getElementById('toast-container');

    // 文字プール定義
    const CHAR_SETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:\'",./<>?',
        hiragana: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん',
        katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン'
        // hiragana: 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん',
        // katakana: 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ'
    };

    // 見間違いやすい文字の定義
    const SIMILAR_CHARS = /[1lI0Oo]/g;

    // スライダーの値表示の同期
    lengthRange.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
    });

    countRange.addEventListener('input', (e) => {
        countValue.textContent = e.target.value;
    });

    // チェックボックスのコンテナのスタイル制御（ビジュアルのフィードバック）
    const checkboxes = [cbUppercase, cbLowercase, cbNumbers, cbSymbols, cbHiragana, cbKatakana];
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const label = cb.closest('.checkbox-label');
            if (cb.checked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
        });
    });

    // 暗号論的に安全なランダム数値を取得
    function getRandomInt(max) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    }

    // トースト通知を表示
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--accent-success); width: 18px; height: 18px;"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Lucideアイコンの適用
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // 表示アニメーション
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3秒後に消去
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 350);
        }, 3000);
    }

    // 文字列の生成ロジック
    function generateStrings() {
        let pool = '';

        if (cbUppercase.checked) pool += CHAR_SETS.uppercase;
        if (cbLowercase.checked) pool += CHAR_SETS.lowercase;
        if (cbNumbers.checked) pool += CHAR_SETS.numbers;
        if (cbSymbols.checked) pool += CHAR_SETS.symbols;
        if (cbHiragana.checked) pool += CHAR_SETS.hiragana;
        if (cbKatakana.checked) pool += CHAR_SETS.katakana;

        // 除外処理
        if (switchExcludeSimilar.checked) {
            pool = pool.replace(SIMILAR_CHARS, '');
        }

        if (pool === '') {
            showToast('文字種を1つ以上選択してください。');
            return;
        }

        const length = parseInt(lengthRange.value, 10);
        const count = parseInt(countRange.value, 10);
        const results = [];

        for (let i = 0; i < count; i++) {
            let str = '';
            for (let j = 0; j < length; j++) {
                const index = getRandomInt(pool.length);
                str += pool.charAt(index);
            }
            results.push(str);
        }

        displayResults(results);
    }

    // 結果のDOM出力
    function displayResults(results) {
        resultList.innerHTML = '';

        results.forEach((str, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const textSpan = document.createElement('span');
            textSpan.className = 'result-string';
            textSpan.textContent = str;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-copy-icon';
            copyBtn.title = 'コピーする';
            copyBtn.innerHTML = '<i data-lucide="copy" style="width: 18px; height: 18px;"></i>';

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(str).then(() => {
                    copyBtn.classList.add('copied');
                    copyBtn.innerHTML = '<i data-lucide="check" style="width: 18px; height: 18px;"></i>';
                    showToast(`${index + 1}行目の文字列をコピーしました。`);

                    if (window.lucide) {
                        window.lucide.createIcons();
                    }

                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerHTML = '<i data-lucide="copy" style="width: 18px; height: 18px;"></i>';
                        if (window.lucide) {
                            window.lucide.createIcons();
                        }
                    }, 2000);
                });
            });

            item.appendChild(textSpan);
            item.appendChild(copyBtn);
            resultList.appendChild(item);
        });

        // Lucideアイコンの初期化
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // 表示アニメーションを少し遅らせる
        resultSection.style.display = 'block';
    }

    // 一括コピー
    btnCopyAll.addEventListener('click', () => {
        const strings = Array.from(document.querySelectorAll('.result-string')).map(span => span.textContent);
        if (strings.length === 0) return;

        const allText = strings.join('\n');
        navigator.clipboard.writeText(allText).then(() => {
            showToast('すべての文字列を一括コピーしました。');
        });
    });

    // 生成ボタンのイベント
    btnGenerate.addEventListener('click', generateStrings);
});
