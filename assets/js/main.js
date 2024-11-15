(function($) {

    skel.breakpoints({
        xlarge: '(max-width: 1680px)',
        large: '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small: '(max-width: 736px)',
        xsmall: '(max-width: 480px)'
    });
    

    $.fn.toggleNightMode = function() {
        var darkmode = (Cookies.get('darkmode') === "true");
        darkmode = !darkmode;
        Cookies.set('darkmode', darkmode);
        $.fn.applyNightMode();
        return this;
    };

    $.fn.applyNightMode = function() {
        var darkmode = (Cookies.get('darkmode') === "true");
        if (darkmode) {
            // override css with light.
            $('body').addClass('dark-mode');
            $('.panel').each(function() {
                $(this).addClass('dark-mode')});
            $('.thumb').each(function() {
                $(this).addClass('dark-mode')});
        } else {
            // restore original css.
            $('body').removeClass('dark-mode');
            $('.panel').each(function() {
                $(this).removeClass('dark-mode')});
            $('.thumb').each(function() {
                $(this).removeClass('dark-mode')});
        };
        return this;
    };

    $(function() {

        var $window = $(window),
            $body = $('body'),
            $wrapper = $('#wrapper');

        // Hack: Enable IE workarounds.
            if (skel.vars.IEVersion < 12)
                $body.addClass('ie');

        // Touch?
            if (skel.vars.mobile)
                $body.addClass('touch');

        // Transitions supported?
            if (skel.canUse('transition')) {

                // Add (and later, on load, remove) "loading" class.
                    $body.addClass('loading');

                    $window.on('load', function() {
                        window.setTimeout(function() {
                            $body.removeClass('loading');
                        }, 100);
                    });

                // Prevent transitions/animations on resize.
                    var resizeTimeout;

                    $window.on('resize', function() {

                        window.clearTimeout(resizeTimeout);

                        $body.addClass('resizing');

                        resizeTimeout = window.setTimeout(function() {
                            $body.removeClass('resizing');
                        }, 100);

                    });

            }

        // Scroll back to top.
            $window.scrollTop(0);

        // Fix: Placeholder polyfill.
            $('form').placeholder();

        // Apply nigthmode theme.
            $.fn.applyNightMode();

        // Toggle nightmode panels.
            var $toggles_nightmode = $('.toggle-nightmode');
            $toggles_nightmode.each(function() {
                var $this = $(this);
                $this
                    .removeAttr('href')
                    .css('cursor', 'pointer')
                    .on('click', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        $.fn.toggleNightMode();
                        });
            });

        // Panels.
            var $panels = $('.panel');

            $panels.each(function() {

                var $this = $(this),
                    $toggles = $('[href="#' + $this.attr('id') + '"]'),
                    $closer = $('<div class="closer" />').appendTo($this);

                // Closer.
                    $closer
                        .on('click', function(event) {
                            $this.trigger('---hide');
                        });

                // Events.
                    $this
                        .on('click', function(event) {
                            event.stopPropagation();
                        })
                        .on('---toggle', function() {

                            if ($this.hasClass('active'))
                                $this.triggerHandler('---hide');
                            else
                                $this.triggerHandler('---show');

                        })
                        .on('---show', function() {

                            // Hide other content.
                                if ($body.hasClass('content-active'))
                                    $panels.trigger('---hide');

                            // Activate content, toggles.
                                $this.addClass('active');
                                $toggles.addClass('active');

                            // Activate body.
                                $body.addClass('content-active');

                        })
                        .on('---hide', function() {

                            // Deactivate content, toggles.
                                $this.removeClass('active');
                                $toggles.removeClass('active');

                            // Deactivate body.
                                $body.removeClass('content-active');

                        });

                // Toggles.
                    $toggles
                        .removeAttr('href')
                        .css('cursor', 'pointer')
                        .on('click', function(event) {

                            event.preventDefault();
                            event.stopPropagation();

                            $this.trigger('---toggle');

                        });

            });

            // Global events.
                $body
                    .on('click', function(event) {

                        if ($body.hasClass('content-active')) {

                            event.preventDefault();
                            event.stopPropagation();

                            $panels.trigger('---hide');

                        }

                    });

                $window
                    .on('keyup', function(event) {

                        if (event.keyCode == 27
                        &&  $body.hasClass('content-active')) {

                            event.preventDefault();
                            event.stopPropagation();

                            $panels.trigger('---hide');

                        }

                    });

        // Header.
            var $header = $('#header');

            // Links.
                $header.find('a').each(function() {

                    var $this = $(this),
                        href = $this.attr('href');

                    // Internal link? Skip.
                        if (!href
                        ||  href.charAt(0) == '#')
                            return;

                    // Redirect on click.
                        $this
                            .removeAttr('href')
                            .css('cursor', 'pointer')
                            .on('click', function(event) {

                                event.preventDefault();
                                event.stopPropagation();

                                window.location.href = href;

                            });

                });

        // Footer.
            var $footer = $('#footer');

            // Copyright.
            // This basically just moves the copyright line to the end of the *last* sibling of its current parent
            // when the "medium" breakpoint activates, and moves it back when it deactivates.
                $footer.find('.copyright').each(function() {

                    var $this = $(this),
                        $parent = $this.parent(),
                        $lastParent = $parent.parent().children().last();

                    skel
                        .on('+medium', function() {
                            $this.appendTo($lastParent);
                        })
                        .on('-medium', function() {
                            $this.appendTo($parent);
                        });

                });

        // Main.
            var $main = $('#main');

            // Thumbs.
                $main.children('.thumb').each(function() {

                    var $this = $(this),
                        $image = $this.find('.image'), $image_img = $image.children('img'),
                        x;

                    // No image? Bail.
                        if ($image.length == 0)
                            return;

                    // Image.
                    // This sets the background of the "image" <span> to the image pointed to by its child
                    // <img> (which is then hidden). Gives us way more flexibility.

                        // Set background.
                            $image.css('background-image', 'url(' + $image_img.attr('src') + ')');

                        // Set background position.
                            if (x = $image_img.data('position'))
                                $image.css('background-position', x);

                        // Hide original img.
                            $image_img.hide();

                    // Hack: IE<11 doesn't support pointer-events, which means clicks to our image never
                    // land as they're blocked by the thumbnail's caption overlay gradient. This just forces
                    // the click through to the image.
                        if (skel.vars.IEVersion < 11)
                            $this
                                .css('cursor', 'pointer')
                                .on('click', function() {
                                    $image.trigger('click');
                                });

                });

            // Thumbs Index.
                $main.children('.thumb').each(function() {

                    var $this = $(this),
                        $link = $this.find('.link'), $link_img = $link.children('img'),
                        x;

                    // No link? Bail.
                        if ($link.length == 0)
                            return;

                    // link.
                    // This sets the background of the "link" <span> to the link pointed to by its child
                    // <img> (which is then hidden). Gives us way more flexibility.

                        // Set background.
                            $link.css('background-image', 'url(' + $link_img.attr('src') + ')');

                        // Set background position.
                            if (x = $link_img.data('position'))
                                $link.css('background-position', x);

                        // Hide original img.
                            $link_img.hide();

                    // Hack: IE<11 doesn't support pointer-events, which means clicks to our link never
                    // land as they're blocked by the thumbnail's caption overlay gradient. This just forces
                    // the click through to the link.
                        if (skel.vars.IEVersion < 11)
                            $this
                                .css('cursor', 'pointer')
                                .on('click', function() {
                                    $link.trigger('click');
                                });

                });

                var gallery_items = $(".gallery-item").sort(
                        function(item_a, item_b){
                            return item_a.getAttribute("gallery_index") - 
                                    item_b.getAttribute("gallery_index");
                            }
                    );
                gallery_items.magnificPopup({
                    type: "image",
                    image: {
                        titleSrc: function(item) {
                            let caption = '';
                            if(item.el.attr("downloadable") ){
                                caption += '<div title="Download" ' +
                                'class="download-button"><a href="' +
                                item.el.attr("href") + '" download="' +
                                item.el.attr("orig_name") +
                                '"><i class="fa fa-download"></i></a></div>' +
                                '<div class="caption-surround">';
                            }
                            if( item.el.attr("phototitle") ) {
                                caption += "<h2>" + item.el.attr("phototitle") + "</h2>";
                            }
                            if( item.el.attr("description") ) {
                                caption += '<p class="description">' +
                                    item.el.attr("description") + "</p>";
                            }
                            caption += "</div>";
                            return caption;
                        },
                    },
                    gallery:{
                        enabled:true,
                        arrowMarkup: '<button title="%title%" class="nav-%dir%"></button>',
                    },
                });
    });

})(jQuery);
