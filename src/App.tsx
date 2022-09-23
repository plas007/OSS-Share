// App.tsx
import { defineComponent, KeepAlive, onBeforeUnmount, onMounted, reactive, ref, Transition } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import './style/app.scss';
import Tabbar from '@/components/Tabbar.vue';
import { router } from './router';
import NavigationBar from '@/components/NavigationBar.vue';
import bus from './libs/bus';

interface Action {
  delta: number;
  type: string;
}

interface TabbarInterface {
  id: number;
  name: string;
  path: string;
  icon: string;
}

export default defineComponent({
  name: 'App',
  components: { Tabbar },

  setup() {
    /**
     * tab发生变化
     * @param res
     */
    const onTabchange = (tabbar: TabbarInterface) => {
      console.log(tabbar);
      router.replace({
        path: tabbar.path,
      });
      setTitle(tabbar.name);
    };
    /**
     * 更新导航栏标题统一方法
     */
    const setTitle = (name: string) => {
      if (titleMap[router.currentRoute.value.name as string]) {
        title.value = titleMap[router.currentRoute.value.name as string];
      } else {
        title.value = name;
        if (router.currentRoute.value.name) {
          titleMap[router.currentRoute.value.name as string] = name;
        } else {
          titleMap[router.getRoutes()[0].name as string] = name;
        }
      }
    };
    /**
     * 导航栏返回
     */
    const onBack = () => {
      console.log(router.currentRoute.value);
      const currentRoute = router.currentRoute.value.name?.toString();
      if (keepAliveInclude.value.includes(currentRoute || '')) {
        bus.emit('back', {
          delta: 1,
          type: 'pathChange',
          name: currentRoute,
        });
      } else {
        bus.emit('back', {
          delta: 1,
          type: 'pageChange',
        });
      }
    };
    /**
     * 触发返回事件真正操作的行为
     * @param action
     */
    const backAction = (action: any): void => {
      console.log('接收到返回事件', action);
      if (action) {
        // console.log(action);
      } else {
        action = { delta: 1, type: 'pathChange' } as Action;
      }
    };

    /**
     * 修改导航栏
     * @param action
     */
    const changeNavigation = (action: any): void => {
      console.log('changeNavigation', action);
      // 设置是否显示导航栏
      if (action.showNavigation === false) {
        showNavigationBar.value = false;
      } else if (action.showNavigation === true) {
        showNavigationBar.value = true;
      }
      // 设置是否显示返回按钮
      if (action.showBack === false) {
        showBack.value = false;
      } else if (action.showBack === true) {
        showBack.value = true;
      }
      // 设置标题
      if (action.title) {
        setTitle(action.title);
      } else {
        // 如果为空，取当前页面路径的name
        setTitle(router.currentRoute.value.name as string);
      }
      // 设置是否显示tabbar
      if (action.showTabbar === false) {
        showTabbar.value = false;
      } else if (action.showBack === true) {
        showTabbar.value = true;
      }
    };

    onMounted(() => {
      /**
       * 下面是全局事件监听
       */
      bus.on('back', backAction);
      bus.on('changeNavigation', changeNavigation);
      setTitle('最近');
    });

    /**
     * 钩子函数
     */
    onBeforeUnmount(() => {
      bus.off('back', backAction);
      bus.on('changeNavigation', changeNavigation);
    });
    // 需要缓存的页面(tab页)
    const keepAliveInclude = ref<Array<string>>(['Latest', 'Home', 'Upload']);
    const showNavigationBar = ref<boolean>(true);
    const showTabbar = ref<boolean>(true);
    const showBack = ref<boolean>(false);
    const title = ref<string>('最近');
    const titleMap = reactive<Record<string, string>>({});
    const tabbarList = router
      .getRoutes()
      .filter((item) => item.meta.tabbar)
      .map((item, index): TabbarInterface => {
        return {
          id: index + 1,
          name: (item.meta.name as string) || '',
          path: item.path,
          icon: '',
        };
      });
    return () => (
      <div class={['app-box', showNavigationBar.value ? 'padding-top' : '', showTabbar.value ? 'padding-bottom' : '']}>
        {showNavigationBar.value && <NavigationBar showBack={showBack.value} title={title.value} class="navigationbar" onBack={onBack} />}
        <RouterView>
          {({ Component }: { Component: any }) => {
            return (
              <Transition name="fade" mode="out-in" appear>
                <KeepAlive include={keepAliveInclude.value}>
                  <Component />
                </KeepAlive>
              </Transition>
            );
          }}
        </RouterView>
        {showTabbar.value && <Tabbar onChange={onTabchange} tabbarList={tabbarList} class="tabbar" />}
      </div>
    );
  },
});
