### Migration from Backbone.Marionette to Vuejs

The creation of this approach was inspired by Martin Fowler and his article: [StranglerFigApplication](https://martinfowler.com/bliki/StranglerFigApplication.html)

If you have a component-based marionette application it is easy to organize migration to vue.

Only two things you need:
 - `MnToVue.vue` - wrapper for marionette-based components, that allows you to use it as vue components
 - `VueToMn.js` - wrapper for vue components, that allows you to write new vue components, and attach it to old
 marionette components (if it needed)

#### These two entities allows you to migrate your application in 2 directions:
1. From Bottom To Top(with `VueToMn.js`):
```
   PageLayout.js(Marionette)
       PageBlockLayout1(Marionette)       <-- 3. Attach wrapped SimpleBlockElement.vue to old Layout
           SimpleBlockElement(Marionette) <-- 1. Rewrite it to vue component: SimpleBlock1Element.vue
                                              2. Use VueToMn and create wrapped SimpleBlockElement as MnLayout
       PageBlockLayout2(Marionette)
            SimpleBlockElement(Marionette) <--4. replace with previously created and wrapped SimpleBlockElement
```

2. From Top to Bottom(with `MnToVue.vue`):
```
   PageLayout.js(Marionette)  <-- 1. Rewrite it to vue component: PageLayout.vue
                                  2. Register MnToVue as component(if it not registered as global component in App.vue).
                                  3. Attach PageBlockLayout1 as MnComponent prop: mn-to-vue(:MnComponent="PageBlockLayout1")
       PageBlockLayout1(Marionette)
           SimpleBlock1Element(Marionette)
    PageLayout.js(Marionette) <-- 4. Replace with PageLayout.vue
                                  5. Attach PageBlockLayout1 as MnComponent prop: mn-to-vue(:MnComponent="PageBlockLayout1")
       PageBlockLayout2(Marionette)
           SimpleBlock2Element(Marionette)
``` 

#### MnToVue.vue details:
You can register `MnToVue.vue` in App.vue or any other vue-component, where you want to use wrapper:

Registration:
```
// In your App.vue or SomeNewCompnent.vue
...
components: {
    MnToVue
}
...

```

Usage: 
```
<mn-to-vue :MnComponent="YourOldMarionetteViewConstructor" :options="mnOptions"></mn-to-vue>
```

Because of options could be dynamically changed, MnToVue triggers service events every time as it happens,
For example:
```
const mnOptions = { a: 1, b: 2 };

// in case when `mnOptions.a` is changed it will be triggers `options:a:updated` event, it allows your OldMarionetteLayout
// to handle it somehow.
```

#### VueToMn details:
In this case at first, you should initialize wrapper with App.vue or Vue.
And after it you could use it to wrap you vue component into marionette layout.

Initialization:
```
//vue-to-mn.js

import App from '@/App.vue';
// or import Vue from 'vue';
import { wrapper } from './VueToMn.js';

const ReadyToUseWraper = wrapper(App);

export { ReadyToUseWraper };
```

Wrapping:
```
// wrapped-your-awesome-component.js

import { ReadyToUseWraper } from './vue-to-mn.js';
import YourAwesomeVueComponent from './your-awesome-component.vue';

export YourAwesomeVueComponent = ReadyToUseWraper(YourAwesomeVueComponent);
```

And after it, You can use `wrapped-your-awesome-component.js` as ordinary Marionette.LayoutView component.
In case, when you need to handle some events from child's vue component, you should instantiate YourAwesomeVueComponent
with extra option `hoistEvents: string[]`, that should consist of events you want to hoist from child to parent.
