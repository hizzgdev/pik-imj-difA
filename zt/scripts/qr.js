(function ($w) {
    let qrCode = new QRCode(document.querySelector('.qr-code'), {
        text: get_url(),
        width: 80,
        height: 80,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
    });

    $w.addEventListener('hashchange', on_hash_change, true);

    function get_url(){
        return 'https://vdesk.top'+$w.location.pathname+$w.location.search+$w.location.hash;
    }

    function on_hash_change() {
        qrCode.clear();
        qrCode.makeCode(get_url());
    }

    on_hash_change();
})(window);