// App.tsx
import { defineComponent, KeepAlive, onBeforeUnmount, onMounted, onBeforeMount, reactive, ref, Transition } from 'vue';
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

interface NavigationOptions {
  showNavigationBar?: boolean;
  showBack?: boolean;
  title?: string;
}

export default defineComponent({
  name: 'App',
  components: { Tabbar },

  setup() {
    /**
     * 全局的页面路径对象
     */
    const routes = router.getRoutes();
    const getDefaultName = (): string => {
      let name = 'OSS';
      try {
        name = routes.filter((item) => item.meta && item.meta.name)[0].meta.name as string;
      } catch (error) {
        console.log(error);
      }
      return name;
    };
    /**
     * 全局默认首页名称
     */
    const defaultPageName: string = getDefaultName();
    // 需要缓存的页面(tab页)
    const keepAliveInclude = ref<Array<string>>(['Latest', 'Home', 'Upload']);
    const showTabbar = ref<boolean>(true);
    /**
     * 全局导航栏数据存储
     */
    const navigationsMap = reactive<Record<string, NavigationOptions>>({});
    /**
     * 当前页面导航栏内容配置
     */
    const navigationOptions = reactive<NavigationOptions>({
      showNavigationBar: true,
      showBack: false,
      title: defaultPageName,
    });
    /**
     * tabbar栏显示内容
     */
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
    /**
     * tabbar子组件
     */
    const tabbarRef = ref(null);
    const defaultIdx = ref<number>(0);
    /**
     * tabbar发生变化
     * @param res
     */
    const onTabchange = (tabbar: TabbarInterface) => {
      console.log(tabbar, navigationsMap);
      router
        .replace({
          path: tabbar.path,
        })
        .then(() => {
          const name = router.currentRoute.value.name
            ? router.currentRoute.value.meta && router.currentRoute.value.meta.name
              ? router.currentRoute.value.meta.name
              : router.currentRoute.value.name
            : defaultPageName;
          const navigation = navigationsMap[name as string] as NavigationOptions;
          console.log('navigation:', navigation);
          if (navigation) {
            setNavigation(navigation);
          } else {
            setNavigation({
              showNavigationBar: true,
              showBack: false,
              title: tabbar.name,
            });
          }
        });
    };
    /**
     * 更新导航栏标题统一方法
     */
    const setNavigation = (navigationOpts: NavigationOptions) => {
      let { title, showNavigationBar, showBack } = navigationOpts;
      const name = router.currentRoute.value.name
        ? router.currentRoute.value.meta && router.currentRoute.value.meta.name
          ? router.currentRoute.value.meta.name
          : router.currentRoute.value.name
        : defaultPageName;
      if (title && typeof showBack === 'boolean' && typeof showNavigationBar === 'boolean') {
        navigationOptions.title = title;
        navigationOptions.showBack = showBack;
        navigationOptions.showNavigationBar = showNavigationBar;
      } else {
        const navigation = navigationsMap[name as string] ?? { title: defaultPageName, showNavigationBar: true, showBack: false };
        if (title) {
          navigationOptions.title = title;
        } else {
          navigationOptions.title = name as string;
        }
        if (typeof showBack === 'boolean') {
          navigationOptions.showBack = showBack;
        } else {
          navigationOptions.showBack = navigation.showBack;
        }
        if (typeof showNavigationBar === 'boolean') {
          navigationOptions.showNavigationBar = showNavigationBar;
        } else {
          navigationOptions.showNavigationBar = navigation.showNavigationBar;
        }
      }
      navigationsMap[name as string] = { ...navigationOptions };
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
      console.log(router.getRoutes());
      console.log('changeNavigation', action);
      // 设置是否显示tabbar
      if (action.showTabbar === false) {
        showTabbar.value = false;
      } else if (action.showBack === true) {
        showTabbar.value = true;
      }
      setNavigation({
        showBack: action.showBack,
        title: action.title,
        showNavigationBar: action.showNavigationBar,
      });
    };

    const initTools = () => {
      const path: string = location.hash.split('?')[0].substring(1);

      for (let i = 0; i < tabbarList.length; i++) {
        let tab = tabbarList[i];
        if (path === tab.path) {
          setNavigation({
            showNavigationBar: true,
            showBack: false,
            title: tab.name,
          });
          defaultIdx.value = i;
          return;
        }
      }
      setNavigation({
        showNavigationBar: true,
        showBack: false,
        title: tabbarList[0].name,
      });
    };

    /**
     * 钩子函数
     */
    onMounted(() => {
      /**
       * 下面是全局事件监听
       */
      bus.on('back', backAction);
      bus.on('changeNavigation', changeNavigation);
      initTools();
    });

    onBeforeUnmount(() => {
      bus.off('back', backAction);
      bus.on('changeNavigation', changeNavigation);
    });
    return () => (
      <div class={['app-box', navigationOptions.showNavigationBar ? 'padding-top' : '', showTabbar.value ? 'padding-bottom' : '']}>
        {navigationOptions.showNavigationBar && <NavigationBar showBack={navigationOptions.showBack} title={navigationOptions.title} class="navigationbar" onBack={onBack} />}
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
        {showTabbar.value && <Tabbar defaultIdx={defaultIdx} onChange={onTabchange} tabbarList={tabbarList} class="tabbar" />}
      </div>
    );
  },
});
