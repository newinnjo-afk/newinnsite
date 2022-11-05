/*!
 * jQuery pagination plugin v1.4.2
 * http://josecebe.github.io/twbs-pagination/
 *
 * Copyright 2014-2018, Eugene Simakin
 * Released under Apache 2.0 license
 * http://apache.org/licenses/LICENSE-2.0.html
 */
(function ($, window, document, undefined) {

    'use strict';

    var old = $.fn.twbsPagination;

    // PROTOTYPE AND CONSTRUCTOR

    var TwbsPagination = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.twbsPagination.defaults, options);

        if (this.options.startPage < 1 || this.options.startPage > this.options.totalPages) {
            throw new Error('Start page option is incorrect');
        }

        this.options.totalPages = parseInt(this.options.totalPages);
        if (isNaN(this.options.totalPages)) {
            throw new Error('Total pages option is not correct!');
        }

        this.options.visiblePages = parseInt(this.options.visiblePages);
        if (isNaN(this.options.visiblePages)) {
            throw new Error('Visible pages option is not correct!');
        }

        if (this.options.beforePageClick instanceof Function) {
            this.$element.first().on('beforePage', this.options.beforePageClick);
        }

        if (this.options.onPageClick instanceof Function) {
            this.$element.first().on('page', this.options.onPageClick);
        }

        // hide if only one page exists
        if (this.options.hideOnlyOnePage && this.options.totalPages == 1) {
            if (this.options.initiateStartPageClick) {
                this.$element.trigger('page', 1);
            }
            return this;
        }

        if (this.options.href) {
            this.options.startPage = this.getPageFromQueryString();
            if (!this.options.startPage) {
                this.options.startPage = 1;
            }
        }

        var tagName = (typeof this.$element.prop === 'function') ?
            this.$element.prop('tagName') : this.$element.attr('tagName');

        if (tagName === 'UL') {
            this.$listContainer = this.$element;
        } else {
            var elements = this.$element;
            var $newListContainer = $([]);
            elements.each(function(index) {
                var $newElem = $("<ul></ul>");
                $(this).append($newElem);
                $newListContainer.push($newElem[0]);
            });
            this.$listContainer = $newListContainer;
            this.$element = $newListContainer;
        }

        this.$listContainer.addClass(this.options.paginationClass);

        if (this.options.initiateStartPageClick) {
            this.show(this.options.startPage);
        } else {
            this.currentPage = this.options.startPage;
            this.render(this.getPages(this.options.startPage));
            this.setupEvents();
        }

        return this;
    };

    TwbsPagination.prototype = {

        constructor: TwbsPagination,

        destroy: function () {
            this.$element.empty();
            this.$element.removeData('twbs-pagination');
            this.$element.off('page');

            return this;
        },

        show: function (page) {
            if (page < 1 || page > this.options.totalPages) {
                throw new Error('Page is incorrect.');
            }
            this.currentPage = page;

            this.$element.trigger('beforePage', page);

            var pages = this.getPages(page);
            this.render(pages);
            this.setupEvents();

            this.$element.trigger('page', page);

            return pages;
        },

        enable: function () {
            this.show(this.currentPage);
        },

        disable: function () {
            var _this = this;
            this.$listContainer.off('click').on('click', 'li', function (evt) {
                evt.preventDefault();
            });
            this.$listContainer.children().each(function () {
                var $this = $(this);
                if (!$this.hasClass(_this.options.activeClass)) {
                    $(this).addClass(_this.options.disabledClass);
                }
            });
        },

        buildListItems: function (pages) {
            var listItems = [];

            if (this.options.first) {
                listItems.push(this.buildItem('first', 1));
            }

            if (this.options.prev) {
                var prev = pages.currentPage > 1 ? pages.currentPage - 1 : this.options.loop ? this.options.totalPages  : 1;
                listItems.push(this.buildItem('prev', prev));
            }

            for (var i = 0; i < pages.numeric.length; i++) {
                listItems.push(this.buildItem('page', pages.numeric[i]));
            }

            if (this.options.next) {
                var next = pages.currentPage < this.options.totalPages ? pages.currentPage + 1 : this.options.loop ? 1 : this.options.totalPages;
                listItems.push(this.buildItem('next', next));
            }

            if (this.options.last) {
                listItems.push(this.buildItem('last', this.options.totalPages));
            }

            return listItems;
        },

        buildItem: function (type, page) {
            var $itemContainer = $('<li></li>'),
                $itemContent = $('<a></a>'),
                itemText = this.options[type] ? this.makeText(this.options[type], page) : page;

            $itemContainer.addClass(this.options[type + 'Class']);
            $itemContainer.data('page', page);
            $itemContainer.data('page-type', type);
            $itemContainer.append($itemContent.attr('href', this.makeHref(page)).addClass(this.options.anchorClass).html(itemText));

            return $itemContainer;
        },

        getPages: function (currentPage) {
            var pages = [];

            var half = Math.floor(this.options.visiblePages / 2);
            var start = currentPage - half + 1 - this.options.visiblePages % 2;
            var end = currentPage + half;

            var visiblePages = this.options.visiblePages;
            if (visiblePages > this.options.totalPages) {
                visiblePages = this.options.totalPages;
            }

            // handle boundary case
            if (start <= 0) {
                start = 1;
                end = visiblePages;
            }
            if (end > this.options.totalPages) {
                start = this.options.totalPages - visiblePages + 1;
                end = this.options.totalPages;
            }

            var itPage = start;
            while (itPage <= end) {
                pages.push(itPage);
                itPage++;
            }

            return {"currentPage": currentPage, "numeric": pages};
        },

        render: function (pages) {
            var _this = this;
            this.$listContainer.children().remove();
            var items = this.buildListItems(pages);
            $.each(items, function(key, item){
                _this.$listContainer.append(item);
            });

            this.$listContainer.children().each(function () {
                var $this = $(this),
                    pageType = $this.data('page-type');

                switch (pageType) {
                    case 'page':
                        if ($this.data('page') === pages.currentPage) {
                            $this.addClass(_this.options.activeClass);
                        }
                        break;
                    case 'first':
                            $this.toggleClass(_this.options.disabledClass, pages.currentPage === 1);
                        break;
                    case 'last':
                            $this.toggleClass(_this.options.disabledClass, pages.currentPage === _this.options.totalPages);
                        break;
                    case 'prev':
                            $this.toggleClass(_this.options.disabledClass, !_this.options.loop && pages.currentPage === 1);
                        break;
                    case 'next':
                            $this.toggleClass(_this.options.disabledClass,
                                !_this.options.loop && pages.currentPage === _this.options.totalPages);
                        break;
                    default:
                        break;
                }

            });
        },

        setupEvents: function () {
            var _this = this;
            this.$listContainer.off('click').on('click', 'li', function (evt) {
                var $this = $(this);
                if ($this.hasClass(_this.options.disabledClass) || $this.hasClass(_this.options.activeClass)) {
                    return false;
                }
                // Prevent click event if href is not set.
                !_this.options.href && evt.preventDefault();
                _this.show(parseInt($this.data('page')));
            });
        },

        changeTotalPages: function(totalPages, currentPage) {
            this.options.totalPages = totalPages;
            return this.show(currentPage);
        },

        makeHref: function (page) {
            return this.options.href ? this.generateQueryString(page) : "#";
        },

        makeText: function (text, page) {
            return text.replace(this.options.pageVariable, page)
                .replace(this.options.totalPagesVariable, this.options.totalPages)
        },

        getPageFromQueryString: function (searchStr) {
            var search = this.getSearchString(searchStr),
                regex = new RegExp(this.options.pageVariable + '(=([^&#]*)|&|#|$)'),
                page = regex.exec(search);
            if (!page || !page[2]) {
                return null;
            }
            page = decodeURIComponent(page[2]);
            page = parseInt(page);
            if (isNaN(page)) {
                return null;
            }
            return page;
        },

        generateQueryString: function (pageNumber, searchStr) {
            var search = this.getSearchString(searchStr),
                regex = new RegExp(this.options.pageVariable + '=*[^&#]*');
            if (!search) return '';
            return '?' + search.replace(regex, this.options.pageVariable + '=' + pageNumber);
        },

        getSearchString: function (searchStr) {
            var search = searchStr || window.location.search;
            if (search === '') {
                return null;
            }
            if (search.indexOf('?') === 0) search = search.substr(1);
            return search;
        },

        getCurrentPage: function () {
            return this.currentPage;
        },

        getTotalPages: function () {
            return this.options.totalPages;
        }
    };

    // PLUGIN DEFINITION

    $.fn.twbsPagination = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        var methodReturn;

        var $this = $(this);
        var data = $this.data('twbs-pagination');
        var options = typeof option === 'object' ? option : {};

        if (!data) $this.data('twbs-pagination', (data = new TwbsPagination(this, options) ));
        if (typeof option === 'string') methodReturn = data[ option ].apply(data, args);

        return ( methodReturn === undefined ) ? $this : methodReturn;
    };

    $.fn.twbsPagination.defaults = {
        totalPages: 1,
        startPage: 1,
        visiblePages: 5,
        initiateStartPageClick: true,
        hideOnlyOnePage: false,
        href: false,
        pageVariable: '{{page}}',
        totalPagesVariable: '{{total_pages}}',
        page: null,
        first: 'Finger',
        prev: 'Previous',
        next: 'Next',
        last: 'Last',
        loop: false,
        beforePageClick: null,
        onPageClick: null,
        paginationClass: 'pagination',
        nextClass: 'page-item next',
        prevClass: 'page-item prev',
        lastClass: 'page-item last',
        firstClass: 'page-item first',
        pageClass: 'page-item',
        activeClass: 'active',
        disabledClass: 'disabled',
        anchorClass: 'page-link'
    };

    $.fn.twbsPagination.Constructor = TwbsPagination;

    $.fn.twbsPagination.noConflict = function () {
        $.fn.twbsPagination = old;
        return this;

    };
    $.prettyPhoto.open = function(event) {
        if(typeof settings == "undefined"){ // Means it's an API call, need to manually get the settings and set the variables
            settings = pp_settings;
            pp_images = $.makeArray(arguments[0]);
            pp_titles = (arguments[1]) ? $.makeArray(arguments[1]) : $.makeArray("");
            pp_descriptions = (arguments[2]) ? $.makeArray(arguments[2]) : $.makeArray("");
            isSet = (pp_images.length > 1) ? true : false;
            set_position = (arguments[3])? arguments[3]: 0;
            _build_overlay(event.target); // Build the overlay {this} being the caller
        }
        
        if(settings.hideflash) $('object,embed,iframe[src*=youtube],iframe[src*=vimeo]').css('visibility','hidden'); // Hide the flash

        _checkPosition($(pp_images).size()); // Hide the next/previous links if on first or last images.
    
        $('.pp_loaderIcon').show();
    
        if(settings.deeplinking)
            setHashtag();
    
        // Rebuild Facebook Like Button with updated href
        if(settings.social_tools){
            facebook_like_link = settings.social_tools.replace('{location_href}', encodeURIComponent(location.href)); 
            $pp_pic_holder.find('.pp_social').html(facebook_like_link);
        }
        
        // Fade the content in
        if($ppt.is(':hidden')) $ppt.css('opacity',0).show();
        $pp_overlay.show().fadeTo(settings.animation_speed,settings.opacity);

        // Display the current position
        $pp_pic_holder.find('.currentTextHolder').text((set_position+1) + settings.counter_separator_label + $(pp_images).size());

        // Set the description
        if(typeof pp_descriptions[set_position] != 'undefined' && pp_descriptions[set_position] != ""){
            $pp_pic_holder.find('.pp_description').show().html(unescape(pp_descriptions[set_position]));
        }else{
            $pp_pic_holder.find('.pp_description').hide();
        }
        
        // Get the dimensions
        movie_width = ( parseFloat(getParam('width',pp_images[set_position])) ) ? getParam('width',pp_images[set_position]) : settings.default_width.toString();
        movie_height = ( parseFloat(getParam('height',pp_images[set_position])) ) ? getParam('height',pp_images[set_position]) : settings.default_height.toString();
        
        // If the size is % based, calculate according to window dimensions
        percentBased=false;
        if(movie_height.indexOf('%') != -1) { movie_height = parseFloat(($(window).height() * parseFloat(movie_height) / 100) - 150); percentBased = true; }
        if(movie_width.indexOf('%') != -1) { movie_width = parseFloat(($(window).width() * parseFloat(movie_width) / 100) - 150); percentBased = true; }
        
        // Fade the holder
        $pp_pic_holder.fadeIn(function(){
            // Set the title
            (settings.show_title && pp_titles[set_position] != "" && typeof pp_titles[set_position] != "undefined") ? $ppt.html(unescape(pp_titles[set_position])) : $ppt.html('&nbsp;');
            
            imgPreloader = "";
            skipInjection = false;
            
            // Inject the proper content
            switch(_getFileType(pp_images[set_position])){
                case 'image':
                    imgPreloader = new Image();

                    // Preload the neighbour images
                    nextImage = new Image();
                    if(isSet && set_position < $(pp_images).size() -1) nextImage.src = pp_images[set_position + 1];
                    prevImage = new Image();
                    if(isSet && pp_images[set_position - 1]) prevImage.src = pp_images[set_position - 1];

                    $pp_pic_holder.find('#pp_full_res')[0].innerHTML = settings.image_markup.replace(/{path}/g,pp_images[set_position]);

                    imgPreloader.onload = function(){
                        // Fit item to viewport
                        pp_dimensions = _fitToViewport(imgPreloader.width,imgPreloader.height);

                        _showContent();
                    };

                    imgPreloader.onerror = function(){
                        alert('Image cannot be loaded. Make sure the path is correct and image exist.');
                        $.prettyPhoto.close();
                    };
                
                    imgPreloader.src = pp_images[set_position];
                break;
            
                case 'youtube':
                    pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
                    
                    // Regular youtube link
                    movie_id = getParam('v',pp_images[set_position]);
                    
                    // youtu.be link
                    if(movie_id == ""){
                        movie_id = pp_images[set_position].split('youtu.be/');
                        movie_id = movie_id[1];
                        if(movie_id.indexOf('?') > 0)
                            movie_id = movie_id.substr(0,movie_id.indexOf('?')); // Strip anything after the ?

                        if(movie_id.indexOf('&') > 0)
                            movie_id = movie_id.substr(0,movie_id.indexOf('&')); // Strip anything after the &
                    }

                    movie = 'http://www.youtube.com/embed/'+movie_id;
                    (getParam('rel',pp_images[set_position])) ? movie+="?rel="+getParam('rel',pp_images[set_position]) : movie+="?rel=1";
                        
                    if(settings.autoplay) movie += "&autoplay=1";
                
                    toInject = settings.iframe_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);
                break;
            
                case 'vimeo':
                    pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
                
                    movie_id = pp_images[set_position];
                    var regExp = /http(s?):\/\/(www\.)?vimeo.com\/(\d+)/;
                    var match = movie_id.match(regExp);
                    
                    movie = 'http://player.vimeo.com/video/'+ match[3] +'?title=0&amp;byline=0&amp;portrait=0';
                    if(settings.autoplay) movie += "&autoplay=1;";
            
                    vimeo_width = pp_dimensions['width'] + '/embed/?moog_width='+ pp_dimensions['width'];
            
                    toInject = settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,pp_dimensions['height']).replace(/{path}/g,movie);
                break;
            
                case 'quicktime':
                    pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
                    pp_dimensions['height']+=15; pp_dimensions['contentHeight']+=15; pp_dimensions['containerHeight']+=15; // Add space for the control bar
            
                    toInject = settings.quicktime_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);
                break;
            
                case 'flash':
                    pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
                
                    flash_vars = pp_images[set_position];
                    flash_vars = flash_vars.substring(pp_images[set_position].indexOf('flashvars') + 10,pp_images[set_position].length);

                    filename = pp_images[set_position];
                    filename = filename.substring(0,filename.indexOf('?'));
                
                    toInject =  settings.flash_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+'?'+flash_vars);
                break;
            
                case 'iframe':
                    pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
            
                    frame_url = pp_images[set_position];
                    frame_url = frame_url.substr(0,frame_url.indexOf('iframe')-1);

                    toInject = settings.iframe_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{path}/g,frame_url);
                break;
                
                case 'ajax':
                    doresize = false; // Make sure the dimensions are not resized.
                    pp_dimensions = _fitToViewport(movie_width,movie_height);
                    doresize = true; // Reset the dimensions
                
                    skipInjection = true;
                    $.get(pp_images[set_position],function(responseHTML){
                        toInject = settings.inline_markup.replace(/{content}/g,responseHTML);
                        $pp_pic_holder.find('#pp_full_res')[0].innerHTML = toInject;
                        _showContent();
                    });
                    
                break;
                
                case 'custom':
                    pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
                
                    toInject = settings.custom_markup;
                break;
            
                case 'inline':
                    // to get the item height clone it, apply default width, wrap it in the prettyPhoto containers , then delete
                    myClone = $(pp_images[set_position]).clone().append('<br clear="all" />').css({'width':settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo($('body')).show();
                    doresize = false; // Make sure the dimensions are not resized.
                    pp_dimensions = _fitToViewport($(myClone).width(),$(myClone).height());
                    doresize = true; // Reset the dimensions
                    $(myClone).remove();
                    toInject = settings.inline_markup.replace(/{content}/g,$(pp_images[set_position]).html());
                break;
            };

            if(!imgPreloader && !skipInjection){
                $pp_pic_holder.find('#pp_full_res')[0].innerHTML = toInject;
            
                // Show content
                _showContent();
            };
        });

        return false;
    };




    $.fn.twbsPagination.version = "1.4.2";

})(window.jQuery, window, document);
