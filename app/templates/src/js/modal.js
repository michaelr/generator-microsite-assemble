var modal = (function () {
    var method   = {},
        modal    = jQuery('<div id="modal"></div>'),
        overlay  = jQuery('<div class="overlay"></div>'),
        contents = jQuery('<div class="contents"></div>'),
        text     = jQuery('<div class="text"></div>'),
        close    = jQuery('<a href="#" class="close">close</a>');

    contents.append(text, close);
    modal.append(overlay, contents);
    overlay.hide();
    contents.hide();

    jQuery(function () {
        jQuery('body').append(modal);
    });

    method.center = function () {
        var w = jQuery(window),
            top = Math.max(w.height() - contents.outerHeight(), 0) / 2,
            left = Math.max(w.width() - contents.outerWidth(), 0) / 2;

        contents.css({
            top: top + w.scrollTop(),
            left: left + w.scrollLeft()
        });
    };

    method.open = function (content) {
        text.empty().append(content);
        method.center();
        overlay.show();
        contents.show();
    };

    method.close = function () {
        overlay.hide();
        contents.hide();
        text.empty();
    };

    close.click(function (e) {
        e.preventDefault();
        method.close();
    });

    overlay.click(function (e) {
        e.preventDefault();
        method.close();
    });

    return method;
}());
