(function () {
    'use strict';

    /**
     * 
     * @param {Object} this.dropdown HTML element
     * @param {Object} this.input HTML element
     * @param {Object} this.list HTML element
     * @param {Object} this.noResult HTML element
     * @param {Object} this.tagContainer HTML element
     * 
     * @param {Object} conf HTML element
     * @param {Object/Array} conf.data Object or Array of elements
     * @param {String} conf.target ID of the input type text element or input text element HTML object (while looping trough the classes)
     * @param {Boolean} conf.multiselect
     * @param {String} conf.noResultText
     * @param {String} conf.placeholder Search input text placeholder
     * @param {String} conf.selectOnLabel The item is selected by clicking on its label
     * @param {Function} conf.onSelect Function invoked after item selected
     */

    var CTbox = function (conf) {
        this.conf = {
            data:           null,
            target:         null,
            multiselect:    false,
            noResultText:   'No result found',
            placeholder:    'Search...',
            selectOnLabel:  true,
            onSelect:       null
        };
        this.tree = [];

        for (var i in this.conf) { if (conf.hasOwnProperty(i)) this.conf[i] = conf[i]; }

        if (typeof this.conf.target === 'string') {
            this.target = document.getElementById(this.conf.target.replace('#', ''));
        }
        else this.target = this.conf.target;        

        if (!this.target) return console.log('No target found');
        return this.init();
    };

    CTbox.prototype.init = function () {
        if (this.conf.data)
            return this.conf.multiselect ? this.createTree(this.conf.data) : this.createList(this.conf.data);
    };

    CTbox.prototype.createTree = function (data) {
        if (data instanceof Object) {
            for (var i in data) this.tree.push(this.prepareElement(data[i]));
        }
        else {
            for (var i = 0, iLen = data.length; i < iLen; i++) this.tree.push(this.prepareElement(data[i]));
        }
        this.tree.push('<div class="no-result">' + this.conf.noResultText + '</div>');
        return this.createDropdown();
    };

    CTbox.prototype.createList = function (data) {
        this.tree.push('<ul>');
        if (data instanceof Object) {
            for (var i in data)
                this.tree.push(this.prepareSingleElement(data[i]));
        }
        else {
            for (var i = 0, iLen = data.length; i < iLen; i++)
                this.tree.push(this.prepareSingleElement(data[i]));
        }
        this.tree.push('</ul>');
        this.tree.push('<div class="no-result">' + this.conf.noResultText + '</div>');
        return this.createDropdown();
    };

    CTbox.prototype.prepareSingleElement = function (element) {
        this.tree.push('<li data-value="' + element.id + '" data-name="' + element.name + '">');
        this.tree.push('<span class="ct-name">' + element.name + '</span>');
        this.tree.push('</li>');
    };

    CTbox.prototype.prepareElement = function (element) {
        var
        cls = element.items ? 'parent' : 'child',
        list = ['<ul><li class="' + cls + '">'];

        if (element.items) list.push('<span>' + icons.arrow + '</span>');

        list.push('<input type="checkbox" data-name="' + element.name + '" name="' + element.id + '" value="' + element.id + '">');
        list.push('<span class="ct-name">' + element.name + '</span>');

        if (element.items) {
            if (element.items instanceof Object) {
                for (var i in element.items)
                    list.push(this.prepareElement(element.items[i]));
            }
            else {
                for (var i = 0, iLen = element.items.length; i < iLen; i++)
                    list.push(this.prepareElement(element.items[i]));
            }
        }
        list.push('</li></ul>');
        return list.join('');
    };

    CTbox.prototype.createDropdown = function () {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'ct-container ' + (!this.conf.multiselect ? 'singleselect' : 'multiselect');

        var inputContainer = document.createElement('div');
        inputContainer.className = 'ct-input';
        var inputIcon = document.createElement('span');
        inputIcon.className = 'ct-search-icon';
        inputIcon.innerHTML = icons.search;

        this.input = document.createElement('input');
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('placeholder', this.conf.placeholder);
        this.input.className = 'form-control';

        inputContainer.appendChild(this.input);
        inputContainer.appendChild(inputIcon);
        this.dropdown.appendChild(inputContainer);

        if (this.conf.multiselect) {
            this.tagContainer = document.createElement('div');
            this.tagContainer.className = 'ct-tag-container';
            this.dropdown.appendChild(this.tagContainer);
        }
        else {
            this.clearBtn = document.createElement('span');
            this.clearBtn.className = 'ct-clear';
            this.clearBtn.innerHTML = icons.clear;
            inputContainer.appendChild(this.clearBtn);
        }
        
        this.list = document.createElement('div');
        this.list.className = 'ct-list';
        this.list.innerHTML = this.tree.join('');
        this.dropdown.appendChild(this.list);

        return this.populate(); 
    };  

    CTbox.prototype.populate = function (list) {
        this.target.parentNode.insertBefore(this.dropdown, this.target.nextSibling);        
        this.target.style.display = 'none';

        return this.addEvents();
    };
    CTbox.prototype.addEvents = function () {
        var checkboxes = this.list.querySelectorAll('input');
        var liElements = this.list.querySelectorAll('li span');

        this.input.addEventListener('keyup', this.onInputKeyUp.bind(this));
        this.input.addEventListener('focus', this.onInputFocus.bind(this));
        if (!this.conf.multiselect)
            this.clearBtn.addEventListener('click', this.clear.bind(this));

        document.addEventListener('click', this.documentOnClick.bind(this));

        for (var i = 0, iLen = checkboxes.length; i < iLen; i++) checkboxes[i].addEventListener('change', this.onChangeCheckbox.bind(this));
        for (var i = 0, iLen = liElements.length; i < iLen; i++) liElements[i].addEventListener('click', this.onListClick.bind(this));
    };

    CTbox.prototype.documentOnClick = function (e) {
        if (!getElement(e.target, '.ct-container', 'closest')) this.dropdownClose();
    };

    CTbox.prototype.onInputFocus = function () {
        var dropdowns = document.querySelectorAll('.ct-container.open');
        for (var i = 0, iLen = dropdowns.length; i < iLen; i++) dropdowns[i].classList.remove('open');
        this.dropdownOpen();
    };

    CTbox.prototype.dropdownOpen = function () {
        this.dropdown.classList.add('open');
    };

    CTbox.prototype.dropdownClose = function () {
        this.dropdown.classList.remove('open');
    };

    CTbox.prototype.firstItemOpen = function () {
        this.list.querySelector('li').classList.add('active');
    };

    CTbox.prototype.clear = function () {
        var items = this.list.querySelectorAll('li.active');
        
        for (var i = 0, iLen = items.length; i < iLen; i++) items[i].classList.remove('active');
        if (this.conf.multiselect) this.tagContainer.innerHTML = '';
        this.target.value = '';
        this.input.value = '';
    };

    CTbox.prototype.onInputKeyUp = function () {
        var liElements = this.list.querySelectorAll('li'),
            search = this.input.value.toLowerCase(),
            found = false;
        
        this.dropdown.classList.remove('noresult');

        for (var i = 0, iLen = liElements.length; i < iLen; i++) {
            var text = liElements[i].querySelector('span.ct-name').innerText.toLowerCase();

            liElements[i].classList[search.length ? 'add' : 'remove']('hidden');
            liElements[i].classList[search.length ? 'add' : 'remove']('active');
            liElements[i].classList.remove('ct-found');

            if (text.indexOf(search) > -1 && search.length) {
                liElements[i].classList.remove('hidden');
                liElements[i].classList.add('ct-found');

                var parents = getElement(liElements[i], 'li', 'parents');
                for (var j = 0, jLen = parents.length; j < jLen; j++) {
                    parents[j].classList.remove('hidden');
                    parents[j].classList.add('active');
                }
                found = true;
            }
        }
        if (!found && search.length) this.dropdown.classList.add('noresult');
        if (!search.length) this.firstItemOpen();
    };

    CTbox.prototype.createTag = function (checkbox) {
        var tag = document.createElement('div'),
            icon = document.createElement('span');

        tag.className = 'ct-tag';
        tag.innerHTML = checkbox.getAttribute('data-name');
        icon.innerHTML = icons.clear;
        icon.setAttribute('data-value', checkbox.value);

        icon.addEventListener('click', this.removeTag.bind(this));

        tag.appendChild(icon);

        return this.tagContainer.appendChild(tag);
    };

    CTbox.prototype.removeTag = function (e) {
        var checkbox = this.list.querySelector('input[value="' + e.currentTarget.getAttribute('data-value') + '"]');
        if (checkbox) checkbox.checked = false;
        return this.onChangeCheckbox();
    };

    CTbox.prototype.onChangeCheckbox = function () {
        var checkboxes = this.list.querySelectorAll('input:checked'),
            values = [];

        this.tagContainer.innerHTML = '';

        for (var i = 0, iLen = checkboxes.length; i < iLen; i++) {
            values.push(checkboxes[i].value);
            this.createTag(checkboxes[i]);
        }
        this.target.value = values.join(',');
    };

    CTbox.prototype.onListClick = function (e) {
        if (e.target.nodeName === 'INPUT') return;

        var parent = e.currentTarget.parentElement;
        if (parent) {
            if (this.conf.multiselect)
                parent.classList[(parent.classList.contains('active') ? 'remove' : 'add')]('active');

            if (this.conf.selectOnLabel || !this.conf.multiselect) {

                if (this.conf.multiselect) {
                    var input = parent.querySelector('input');
                    input.checked = !input.checked;
                    this.onChangeCheckbox();
                }
                else {
                    this.target.value = parent.getAttribute('data-value');
                    this.input.value = parent.getAttribute('data-name');
                    this.dropdownClose();
                }
            }
        }
        if (!this.conf.multiselect) {
            if (this.conf.onSelect && typeof this.conf.onSelect === 'function') this.conf.onSelect();
        }
    };

    CTbox.prototype.destroy = function () {
        this.dropdown.remove();
        this.target.style.display = 'block';
        return;
    };

    var getElement = function (elem, selector, type) {

        if (!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1;
                };
        }
        if (type && type === 'parents') {
            var parents = [];

            for (; elem && elem !== document; elem = elem.parentNode) {
                if (selector) {
                    if (elem.matches( selector)) parents.push(elem);
                }
                else parents.push(elem);
            }
            return parents;
        }
        if (type && type === 'closest') {
            for (; elem && elem !== document; elem = elem.parentNode) {
                if (elem.matches(selector)) return elem;
            }
            return null;
        }
    };

    var icons = {
        clear: '<svg width="1792" height="1792" viewBox="0 0 1792 1792"><path d="M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"/></svg>',
        search: '<svg width="1792" height="1792" viewBox="0 0 1792 1792"><path d="M1216 832q0-185-131.5-316.5t-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5 316.5-131.5 131.5-316.5zm512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124-143 0-273.5-55.5t-225-150-150-225-55.5-273.5 55.5-273.5 150-225 225-150 273.5-55.5 273.5 55.5 225 150 150 225 55.5 273.5q0 220-124 399l343 343q37 37 37 90z"/></svg>',
        arrow: '<svg width="1792" height="1792" viewBox="0 0 1792 1792"><path d="M1152 896q0 26-19 45l-448 448q-19 19-45 19t-45-19-19-45v-896q0-26 19-45t45-19 45 19l448 448q19 19 19 45z"/></svg>'
    }

    window.CTbox = CTbox;
})();