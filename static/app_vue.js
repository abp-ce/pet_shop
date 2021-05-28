const eventBus = new Vue();

Vue.component('abp-tree', {
    data: function() {
        return {
            flag: false,
            sel_node: {}
        }
    },
    props: ['tree'],
    template: '#abp-tree',
    delimiters: ['${', '}'],
    created: function() {
        eventBus.$on('disactivate',this.disactivate);
        eventBus.$on('selected',this.selected);
        eventBus.$on('logged',this.logged);
        eventBus.$on('unlogged',this.logged);
    },
    beforeDestroy: function() {
        eventBus.$off('disactivate');
        eventBus.$off('selected');
        eventBus.$off('logged');
        eventBus.$off('unlogged');
    },
    mounted: function() {
        eventBus.$emit("tree-event",this.tree);
    },
    methods: {
        disactivate: function() {
            if (this.flag == false) this.flag = true;
            else this.flag = false;
            console.log(this.flag);
        },
        selected: function(node) {
            console.log(this.sel_node.label);
            this.sel_node = node;
            console.log(this.sel_node.label);
        },
        logged: function() {
            //this.disactivate();
            this.selected(this.tree);
        }
    }
})

Vue.component('abp-node', {
    props: [ 'node', 'flag', 'sel_node'],
    data: function() {
        return {
            prev_sender: false,
            sender: false
        }
    },
    template: '#abp-node',
    delimiters: ['${', '}'],
    watch: {
        flag: function() {
            if (this.sender) {
                if (this.prev_sender) {
                    this.sender = false;
                    this.prev_sender = false;
                }
                else this.prev_sender =true;
            }
        },
        sel_node: function() {
            if (this.sel_node.id == this.node.id) {
                this.sender = true;
                eventBus.$emit('disactivate');
                //this.prev_sender = true;
            }
        }
    },
    methods: {
        onClick: function() {
            eventBus.$emit('tree-event', this.node);
            this.sender = true;
            //eventBus.$emit('disactivate');
            //this.prev_sender = true;
        }
    }
})

Vue.component('abp-slider', {
    props: [ 'photos' ],
    template: '#abp-slider',
    delimiters: ['${', '}'],
    data: function() {
        return {
            timer: null,
            currentIndex: 0
        }
    }, 
    mounted: function() {
        this.startSlide();
    },
    methods: {
        startSlide: function() {
            this.timer = setInterval(this.next, 10000);
        },
        next: function() {
            this.currentIndex +=1;
        },
        prev: function() {
            this.currentIndex -=1;
        }
    },
    computed: {
        currentImg: function() {
            return this.photos[Math.abs(this.currentIndex) % this.photos.length];
        }
    }
})

Vue.component('abp-item', {
    props: ['item'],
    template: '#abp-item',
    delimiters: ['${', '}'],
    methods: {
        onClick: function() {
            eventBus.$emit('tree-event', this.item);
            eventBus.$emit('selected',this.item);
        }
    }
})

Vue.component('abp-login', {
    props: ['data'],
    data: function() {
        return {
            username: username,
            password: '',
            route: { 'Регистрация': '/register', 'Войти': '/login'}
        }
    },
    template: '#abp-login',
    delimiters: ['${', '}'],
    methods: {
        onClick: async function(label) {
            jsn = JSON.stringify({'username': this.username, 'password': this.password});
            console.log(jsn);
            const response = await fetch(this.route[label], {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                credentials: 'include',
                body: jsn
            });
            const rsp = await response.json();
            if ( rsp['error'] ) alert(rsp['error']);
            else {
                eventBus.$emit("logged",this.username);
                eventBus.$emit("tree-event", tree);
            }
        }
    }
})

Vue.component('abp-gallery', {
    props: ['data'],
    template: '#abp-gallery',
    delimiters: ['${', '}']
})

Vue.component('abp-card', {
    props: ['data'],
    template: '#abp-card',
    delimiters: ['${', '}'],
    asyncComputed: {
        details: {
            async get() {
                jsn = JSON.stringify({ "id": this.data.id });
                const response = await fetch('/details', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    credentials: 'include',
                    body: jsn
                });
                const rsp = await response.json();
                if (rsp) return ({ nick: rsp['nick'], birthday: rsp['birthday'], 
                                breed: rsp['breed'], subbreed: rsp['subbreed'], mam: rsp['mam'], dad: rsp['dad']});
                else return { nick: 'nick', birthday: 'birthday', breed: 'breed', subbreed: 'subbreed', mam: 'mam', dad: 'dad' };
            },
            default() { return { nick: 'nick', birthday: 'birthday', breed: 'breed', subbreed: 'subbreed', mam: 'mam', dad: 'dad'}; }
        }
    }
})

new Vue({
    el: '#switch',
    data: { 
        swtch: 'abp-gallery',
        data: {}
    },
    created: function() {
        eventBus.$on('tree-event',this.tree_handler);
        eventBus.$on('login',this.login);
    },
    beforeDestroy: function() {
        eventBus.$off('tree-event');
        eventBus.$off('login');
    },
    methods: {
        tree_handler: function(node) {
            if (this.swtch == 'abp-login') 
                if (node.id <= 0) this.swtch = 'abp-gallery';
                else this.swtch = 'abp-card';
            else 
                if (node.id <= 0) { if (this.swtch == 'abp-card') this.swtch = 'abp-gallery'; }
                else { if (this.swtch == 'abp-gallery') this.swtch = 'abp-card'; }
            this.data = node;
            eventBus.$emit('selected', node);
        },
        login: async function(label) {
            if (label == 'Выйти') {
                const response = await fetch('/logout', { credentials: 'include' });
                const rsp = await response.text();
                if (rsp == 'ok') {
                    eventBus.$emit('unlogged');
                    this.tree_handler(tree);
                }
            }
            else {
                this.swtch = 'abp-login';
                this.data = { label: label }
            }
        }
    }
})

new Vue({
    el: "#nav",
    data: { 
        items : [{label: 'Войти'},{label: 'Регистрация'}],
        username : username 
    },
    delimiters: ['${', '}'],
    created: function() {
        eventBus.$on('logged',this.logged);
        eventBus.$on('unlogged',this.unlogged);
        if (username) this.items = [{ label: 'Выйти'}];
    },
    beforeDestroy: function() {
        eventBus.$off('logged');
        eventBus.$off('unlogged');
    },
    methods: {
        onClick: function(label) {
            eventBus.$emit('login', label);
        },
        logged: function(username) {
            this.username = username;
            this.items = [{ label: 'Выйти'}];
    },
        unlogged: function() {
            this.username = ''; 
            this.items = [{label: 'Войти'},{label: 'Регистрация'}];
        }
    }
})

new Vue({
    el: '#vue',
    data: {
        photos: ['https://getfile.dokpub.com/yandex/get/https://disk.yandex.ru/i/a60cUiReC9ok_A',
            'https://getfile.dokpub.com/yandex/get/https://disk.yandex.ru/i/dVqgnqVGah6UzA',
            'https://getfile.dokpub.com/yandex/get/https://disk.yandex.ru/i/b3_-Sz3u2OJhgg',
            'https://getfile.dokpub.com/yandex/get/https://disk.yandex.ru/i/1mjDzm8Cya-5UA']
    }
})

new Vue({
    el: '#tree',
    data: {
        tree: tree 
    }
})