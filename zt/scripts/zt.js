(function ($w, $d) {
    let $ = function (selector) { return $d.querySelector(selector); };
    let $a = function (selector) { return $d.querySelectorAll(selector); };

    let $container = $('#container');
    let $page = $('.page');
    let $setting = {
        text_font: 'FZKai',
        text_color: $('input[name=text-color]:checked').value,
        grid_color: $('input[name=grid-color]:checked').value,
        paper_size: $('select[name=paper-size]').value,
        paper_orientation: 'portrait',
        grade_title: null,
        grade_words: null,
    };

    function page_load() {
        register_event();
        font_loading(function () {
            $('.page-panel').className = 'page-panel';
            $container.style.fontFamily = $setting.text_font;
        });
        update_style();
        on_hash_change();
        init_bank();
    }

    function register_event() {
        $w.addEventListener('hashchange', on_hash_change, true);
        $a('input[name=text-color]').forEach(a => a.addEventListener('click', on_text_color_change, true));
        $a('input[name=grid-color]').forEach(a => a.addEventListener('click', on_grid_color_change, true));
        $('select[name=paper-size]').addEventListener('change', on_paper_size_change, true);
        $a('.bt-print').forEach(a => a.addEventListener('click', on_print_click, true));
        $('.print-tips').addEventListener('mouseover', on_print_tips_hover, true)
        $('.print-tips').addEventListener('mouseout', on_print_tips_out, true)
    }

    function font_loading(callback) {
        new FontFace($setting.text_font, 'local("FZKai-Z03"), local("FZKai-Z03S"), url("fonts/FZKai.ttf") format("truetype")').load().then(function (ff) {
            $d.fonts.add(ff);
            callback();
        });
    }

    function on_paper_size_change(e) {
        $setting.paper_size = e.target.value;
        update_page_setting();
    }

    function on_text_color_change(e) {
        $setting.text_color = e.target.value;
        update_style();
    }

    function on_grid_color_change(e) {
        $setting.grid_color = e.target.value;
        update_style();
    }

    function on_hash_change() {
        let word = decodeURI(location.hash).split('#')[1];
        if (!!word) {
            if (word.length > 1) {
                fill_for_word(word)
            } else {
                fill_for_char(word)
            }
        }
    }

    function fill_for_char(c) {
        $a('span.fill > label').forEach(f => f.innerHTML = c);
        $d.title = `每日练字 - ${c}`;
    }

    function fill_for_word(w) {
        let d = w.split(',');
        let lIdx = parseInt(d[1]);
        let words = WORDS[d[0]][lIdx].split(',');
        let html = words.map(word=>{
            let chars = word.split('');
            chars.length = 10;
            chars.fill('', word.length, 10);
            return chars.map(c=>`<span class="trace"><label>${c}</label></span>`).join('');
        }).join('')
        $('.word-area').innerHTML = html;
        let lesson = BOOKS.filter(b=>b.name===d[0])[0].lessons[lIdx]
        $d.title = `词语 - ${lesson}`;
        $('.lesson-title').innerHTML = lesson;
    }

    function on_print_click() {
        $w.print();
    }

    function on_print_tips_hover(e){
        let tips = $('.print-tips-panel');
        tips.style.display='block';
        tips.style.top = (e.y+20)+'px';
        tips.style.left = e.x+'px';
    }

    function on_print_tips_out(){
        $('.print-tips-panel').style.display='none';
    }

    function update_page_setting() {
        let paper_size = $setting.paper_size.split('x');
        let paper_class_name = `paper-${paper_size[0]}-${$setting.paper_orientation} paper-margin-normal`;
        $page.className = `page ${paper_class_name} `;
    }

    function update_style() {
        $container.className = `text-${$setting.text_color} grid-${$setting.grid_color}`;
    }

    function init_bank() {
        if (BANK_TYPE === 'CHAR') {
            init_char_bank();
        } else {
            init_word_bank();
        }
    }

    function init_char_bank() {
        let word_bank_html = WORD_BANK.map((grade, idx) => {
            let lessons_html = grade.words.map(words => words.split('').map(w => `<a href="#${w}">${w}</a>`).join(' '))
                .map(lesson_html => `<li>${lesson_html}</li>`).join('')
            return `<div class="setting-item grade-title" data-words="word_grade_${idx}">${grade.grade}</div><div id="word_grade_${idx}" class="setting-item" style="display:none"><ol>${lessons_html}</ol></div>`
        }).join('')
        $('.word-bank').innerHTML = word_bank_html;
        $a('.grade-title').forEach(t => t.addEventListener('click', on_grade_title_click, true))
    }

    function init_word_bank() {
        let word_bank_html = BOOKS.map((book, bIdx) => {
            let words = WORDS[book.name]
            let lessons_html = book.lessons.map((lesson, lIdx) => {
                return `<li><a href="#${book.name},${lIdx}">${lesson}</a></li>`;
            }).filter((_, lIdx) => !!words[lIdx]).join('');
            return `<div class="setting-item grade-title" data-words="word_grade_${bIdx}">${book.grade}</div><div id="word_grade_${bIdx}" class="setting-item" style="display:none"><ul>${lessons_html}</ul></div>`
        }


        ).join('')
        console.log(word_bank_html)
        $('.word-bank').innerHTML = word_bank_html;
        $a('.grade-title').forEach(t => t.addEventListener('click', on_grade_title_click, true))
    }

    function on_grade_title_click(e) {
        let new_grade_title = e.target;
        if (!!$setting.grade_title) {
            $setting.grade_title.className = 'setting-item grade-title';
        }
        if (!!$setting.grade_words) {
            $setting.grade_words.style.display = 'none';
        }
        if ($setting.grade_title == new_grade_title) {
            $setting.grade_words.style.display = 'none';
            $setting.grade_title = null;
            $setting.grade_words = null;
            return
        }
        $setting.grade_title = new_grade_title;
        $setting.grade_title.className = 'setting-item grade-title grade-title-active'
        $setting.grade_words = $('#' + e.target.getAttribute('data-words'))
        $setting.grade_words.style.display = '';
    }
    page_load();
})(window, window.document);