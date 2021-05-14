const eventBus = new Vue();

Vue.component('abp-tree', {
    data: function() {
        return {
            flag: false,
            sel_node: null
        }
    },
    props: ['tree'],
    template: '#abp-tree',
    delimiters: ['${', '}'],
    created: function() {
        eventBus.$on('disactivate',this.disactivate);
        eventBus.$on('selected',this.selected);
    },
    beforeDestroy: function() {
        eventBus.$off('disactivate');
        eventBus.$off('selected');
    },
    methods: {
        disactivate: function() {
            if (this.flag == false) this.flag = true;
            else this.flag = false;
        },
        selected: function(node) {
            this.sel_node = node;
        }
    
    }
})

Vue.component('abp-node', {
    props: [ 'node', 'flag', 'sel_node'],
    data: function() {
        return {
            isActive: false,
            sender: false
        }
    },
    template: '#abp-node',
    delimiters: ['${', '}'],
    watch: {
        flag: function() {
            if ( this.sender ) this.sender = false
            else this.isActive = false;
        },
        sel_node: function() {
            //console.log(this.sel_node.id);
            //console.log(this.node.id);
            if (this.sel_node.id == this.node.id) {
                this.sender = true;
                eventBus.$emit('disactivate');
                this.isActive = true;
            }
        }
    },
    methods: {
        onClick: function() {
            eventBus.$emit('tree-event', this.node);
            this.sender = true;
            eventBus.$emit('disactivate');
            this.isActive = true; 
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

Vue.component('abp-gallery', {
    props: {
        data: Array
    },
    template: '#abp-gallery',
    delimiters: ['${', '}']
})

Vue.component('abp-card', {
    props: {
        data: Array
    },
    template: '#abp-card',
    delimiters: ['${', '}']
})

new Vue({
    el: '#switch',
    data: { 
        swtch: 'abp-gallery',
        data: []
    },
    created: function() {
        eventBus.$on('tree-event',this.tree_handler);
    },
    beforeDestroy: function() {
        eventBus.$off('tree-event');
    },
    methods: {
        tree_handler: function(node) {
            if (node.id <= 0) {
                if (this.swtch == 'abp-card') this.swtch = 'abp-gallery';
                this.data = node.children;
            } 
            else {
                if (this.swtch == 'abp-gallery') this.swtch = 'abp-card';
                this.data = [node];
            }
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