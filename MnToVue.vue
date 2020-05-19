<template>
    <div class="mn-to-vue-layout"></div>
</template>

<script>
    import Mn from 'backbone.marionette';
    import _ from 'lodash';

    export default {
        name: 'MnToVue',
        props: {
            options: Object,
            MnComponent: { required: true, type: Function }
        },

        data() {
            return { mn: null, region: null };
        },

        watch: {
            /**
             * @param {{}} newOptions
             * @param {{}} oldOptions
             */
            options(newOptions, oldOptions) {
                if (this.mn) {
                    const keys = _.union(Object.keys(oldOptions), Object.keys(newOptions));

                    keys.forEach(key => {
                        if (!_.isEqual(oldOptions[key], newOptions[key])) {
                            this.mn.options[key] = newOptions[key];

                            this.mn.triggerMethod(`options:${key}:updated`, newOptions[key]);
                        }
                    });
                }
            }
        },

        /**
         * @throws {Error}
         */
        async mounted() {
            await this.$nextTick();

            this.region = new Mn.Region({ el: this.$el });
            const mn = new this.MnComponent(this.options);

            mn.on('all', (...payload) => this.$emit(...payload));

            this.mn = mn;

            this.region.show(mn);
        },

        beforeDestroy() {
            if (this.region) {
                this.region.reset();
                this.region.destroy();

                this.mn = null;
                this.region = null;
            }
        }
    };
</script>
