(function ($w, $d) {
    let $ = function (selector) { return $d.querySelector(selector); };
    let $a = function (selector) { return $d.querySelectorAll(selector); };
    let $f = function (font_family) { return $d.fonts.check(`12px "${font_family}"`); };

    let $container = $('#container');
    let $text = $('#text');
    let $page = $('.page');
    let $fake_page = $('.fake-page');
    let $setting = {
        row_size: 0,
        text: $text.value,
        text_font: 'FZKai',
        text_size: $('input[name=text-size]').value,
        text_color: 'black',
        text_opacity: 0,
        grid_color: 'red',
        paper_size: $('select[name=paper-size]').value,
        paper_orientation: $('input[name=paper-orientation]').value,
        paper_margin: $('select[name=paper-margin]').value
    };

    function page_load() {
        register_event();
        font_loading(function () {
            $('.page-panel').className = 'page-panel';
            $('.bt-preview').innerHTML = '预览字帖';
            $('.bt-preview').disabled = false;
            update_page_setting();
            update_setting();
            update_text();
        });
    }

    function register_event() {
        $text.addEventListener('input', delay_event_handler(on_text_change, 300), true);
        $text.addEventListener('paste', delay_event_handler(on_text_change, 300), true);
        $a('input[name=page-layout').forEach(a => a.addEventListener('click', on_page_layout_change, true));
        $('input[name=text-size]').addEventListener('change', on_text_size_change, true);
        $a('input[name=text-color]').forEach(a => a.addEventListener('click', on_text_color_change, true));
        $a('input[name=text-opacity]').forEach(a => a.addEventListener('click', on_text_opacity_change, true));
        $a('input[name=grid-color]').forEach(a => a.addEventListener('click', on_grid_color_change, true));
        $('select[name=paper-size]').addEventListener('change', on_paper_size_change, true);
        $a('input[name=paper-orientation]').forEach(a => a.addEventListener('click', on_paper_orientation_change, true));
        $('select[name=paper-margin]').addEventListener('change', on_paper_margin_change, true);
        $a('.bt-preview').forEach(a => a.addEventListener('click', on_print_click, true));
        $a('.bt-print').forEach(a => a.addEventListener('click', on_print_click, true));
        $('.print-tips').addEventListener('mouseover', on_print_tips_hover, true)
        $('.print-tips').addEventListener('mouseout', on_print_tips_out, true)
    }

    function font_loading(callback) {
        new FontFace('FZKai', 'local("FZKai-Z03"), local("FZKai-Z03S"), url("fonts/FZKai.ttf") format("truetype")').load().then(function (ff) {
            $d.fonts.add(ff);
            callback();
        });
    }

    function on_page_layout_change(e) {
        $('body > div').className = e.target.value;
    }

    function on_paper_size_change(e) {
        $setting.paper_size = e.target.value;
        update_page_setting();
    }

    function on_paper_orientation_change(e) {
        $setting.paper_orientation = e.target.value;
        update_page_setting();
    }

    function on_paper_margin_change(e) {
        $setting.paper_margin = e.target.value;
        update_page_setting();
    }

    function on_print_click() {
        $w.print();
    }

    function on_text_change(e) {
        let text = e.target.value;
        let prev_text = $setting.text;
        if (prev_text == text) {
            return;
        }
        $setting.text = text;
        update_text();
    }

    function on_font_family_change(e) {
        $setting.text_font = e.target.value;
        update_style();
    }

    function on_text_size_change(e) {
        $setting.text_size = e.target.value;
        update_setting();
        update_text();
    }

    function on_text_color_change(e) {
        $setting.text_color = e.target.value;
        update_style();
    }

    function on_text_opacity_change(e) {
        $setting.text_opacity = e.target.value;
        update_style();
    }

    function on_grid_color_change(e) {
        $setting.grid_color = e.target.value;
        update_style();
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


    function update_style() {
        let opacity = $setting.text_opacity == '0' ? '' : 'text-opacity-' + $setting.text_opacity;
        $container.className = `text-${$setting.text_color} grid-${$setting.grid_color} ${opacity}`;
        $container.style.fontFamily = $setting.text_font;
        $container.style.fontSize = $setting.text_size + 'px';
    }

    function update_setting() {
        update_style();
        $setting.row_size = detect_row_size();
    }

    function update_text() {
        let padded = $setting.text.split(/[\r\n]/, -1).map(line => pad_right(line, $setting.row_size)).join('');
        let wrappered = padded.split('').map(t => `<span><label>${t}</label></span>`).join('')
        $container.innerHTML = wrappered;
    }

    function update_page_setting() {
        let paper_size = $setting.paper_size.split('x');
        let paper_margin = $setting.paper_margin.split('x');
        let paper_width = $setting.paper_orientation === 'portrait' ? paper_size[1] : paper_size[2];
        let paper_class_name = `paper-${paper_size[0]}-${$setting.paper_orientation} paper-margin-${paper_margin[0]}`;
        let container_width = parseInt(paper_width) - parseFloat(paper_margin[1]) * 2;
        $container.style.width = `${container_width}mm`;
        $page.className = `page ${paper_class_name} `;
        update_setting();
        update_text();
    }

    function pad_right(line, row_size) {
        if (line.length == 0) {
            return ' '.repeat(row_size);
        }

        let padding_size = line.length % row_size;
        if (padding_size > 0) {
            let padding = ' '.repeat(row_size - padding_size);
            return line + padding;
        }
        return line;
    }

    function detect_row_size() {
        let _e = $d.createElement('div');
        _e.className = $container.className;
        _e.style.fontSize = $container.style.fontSize;
        _e.style.fontFamily = $container.style.fontFamily;
        _e.style.width = $container.style.width;

        $fake_page.appendChild(_e);
        let baseH = 0;
        let c = 0;
        while (c < 100) {
            _e.innerHTML += '<span>字</span>';
            let h = _e.clientHeight;
            if (baseH > 0 && h > baseH) {
                break;
            }
            baseH = h;
            c++;
        }
        $fake_page.innerHTML = '';
        return c;
    }

    function delay_event_handler(callback, delay) {
        let delay_id = NaN;
        return function (e) {
            if (!isNaN(delay)) {
                $w.clearTimeout(delay_id);
            }
            delay_id = $w.setTimeout(function () { callback(e); }, delay);
        }
    }

    page_load();
})(window, window.document);