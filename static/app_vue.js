const store = new Vuex.Store({
    state: {
        username: username,
        sel_node: tree,
    },
    mutations: {
        set_username: (state, username) => state.username = username,
        set_sel_node: (state, node) => state.sel_node = node,
    }
})

Vue.component('abp-tree', {
    props: ['tree'],
    template: '#abp-tree',
    delimiters: ['${', '}'],
    mounted: function() {
        store.commit('set_sel_node', this.tree);
    },
    computed: {
        username: function() {
            store.commit('set_sel_node', this.tree);
            return store.state.username;
        }
    }
})

Vue.component('abp-node', {
    props: ['node'],
    template: '#abp-node',
    delimiters: ['${', '}'],
    computed: {
        sender: function() {
            if (store.state.sel_node.id == this.node.id) return true;
            else return false;
        },
    },
    methods: {
        onClick: function() {
            store.commit('set_sel_node', this.node);
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
            store.commit('set_sel_node', this.item);
        }
    }
})

Vue.component('abp-login', {
    props: ['data'],
    data: function() {
        return {
            password: '',
            route: { 'Регистрация': '/register', 'Войти': '/login'}
        }
    },
    template: '#abp-login',
    delimiters: ['${', '}'],
    computed: {
        username: {
            get() {
                return store.state.username;
            },
            set(username) {
                store.commit('set_username', username);
            }
        }
    },
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
                store.commit('set_username',this.username);
                store.commit('set_sel_node', tree);
            }
        }
    }
})

Vue.component('abp-gallery', {
    template: '#abp-gallery',
    props: ['data'],
    delimiters: ['${', '}'],
    /*computed: {
        data: function() {
            console.log('abp-gallery');
            return store.state.sel_node;
        }
    },*/
})

Vue.component('abp-card', {
    template: '#abp-card',
    props: ['data'],
    delimiters: ['${', '}'],
    /*computed: {
        data: function() {
            console.log('abp-card');
            return store.state.sel_node;
        }
    },*/
    asyncComputed: {
        details: {
            async get() {
                if (this.data.id <= 0) return {};
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
    computed: {
        data: function() {
            //console.log('switch');
            return store.state.sel_node;
        }
    },
    asyncComputed: {
        swtch: async function() {
                if ('m_item' in this.data ) {
                    if (this.data.m_item == "Выйти") {
                        const response = await fetch('/logout', { credentials: 'include' });
                        const rsp = await response.text();
                        if (rsp == 'ok') {
                            store.commit('set_username', '');
                            store.commit('set_sel_node', tree);
                        }
                        return 'abp-gallery'
                    }
                    else return 'abp-login';
                }
                //console.log(store.state.sel_node.id);
                if (this.data.id <= 0) return 'abp-gallery';
                else return 'abp-card';
        }
    }
})

new Vue({
    el: "#nav",
    delimiters: ['${', '}'],
    computed: {
        items: function() {
            if (store.state.username == '')
                return [{m_item: 'Войти'},{m_item: 'Регистрация'}]
            else return [{ m_item: 'Выйти'}];
        }, 
        username: function() {
            return store.state.username;
        }
    },
    methods: {
        onClick: function(m_item) {
            store.commit('set_sel_node', { m_item: m_item });
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