import _ from 'lodash';
import Mn from 'backbone.marionette';

const DEFAULT_OPTIONS = () => ({
    template: () => null,
    hoistEvents: []
});

/**
 * @param {Vue} AppVue
 * @returns {function(VueComponent): Mn.LayoutView}
 */
export const wrapper = AppVue => vueComponent => class extends Mn.LayoutView {
    constructor(options) {
        super(options);

        this._root = this._initRoot();
    }

    /**
     * @returns {{}}
     */
    options() {
        return DEFAULT_OPTIONS();
    }

    onAttach() {
        this._root.$mount(this.el);
    }

    onBeforeDestroy() {
        this._root.$destroy();
    }

    /**
     * @returns {VueComponent}
     * @private
     */
    _initRoot() {
        const RootComp = AppVue.extend(vueComponent);

        const root = new RootComp({
            propsData: _.omit(this.options, 'template', 'hoistEvents'),
        });

        this._hoistEventsToParent(root);

        return root;
    }

    _hoistEventsToParent(vm) {
        this.options.hoistEvents.forEach(
            event => this._hoistEvent(vm, event)
        );
    }

    _hoistEvent(vm, event) {
        vm.$on(event, (...all) => this.triggerMethod(event, ...all));
    }
};
