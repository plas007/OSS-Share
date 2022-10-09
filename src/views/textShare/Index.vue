<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script lang="ts">
export default {
  name: 'TextShare',
};
</script>
<script setup lang="ts">
import { ref, reactive, toRef, onMounted, onBeforeUnmount, onActivated } from 'vue';
import TextModal from '@/components/modal/TextModal.vue';
import TextItemVue from '@/components/textItem/TextItem';
import ljRequest from '../../request';
import bus from '@/libs/bus';
interface Props {
  msg?: string;
  labels?: string[];
}
interface TextItem {
  isFile: boolean;
  name: string;
  relativePath: string;
}
interface Data {
  textList: Array<TextItem>;
  nowPath: Array<string>;
}

withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
});

const data = reactive<Data>({
  textList: [],
  nowPath: ['upload'],
});
const textList = toRef(data, 'textList');
const nowPath = toRef(data, 'nowPath');
// 是否显示全部文本查看弹窗
const showTextModal = ref<boolean>(false);
// 需要展示的文本详情
const textDetail = ref<string>('');

/**
 * 加载数据
 * @param back
 */
const getTextList = (back: boolean = false) => {
  ljRequest
    .get({
      url: `/ossApi/getShareText.json`,
    })
    .then((res: any) => {
      if (res.data.length > 0) {
        console.log(res.data);
        textList.value = res.data.sort((a: TextItem, b: TextItem) => new Date(b.name).getTime() - new Date(a.name).getTime());
      } else {
        // 空文件夹则....
        textList.value = [];
      }
    })
    .finally(() => {
      onChangePath(back);
    });
};

/**
 * 点击到单独每个文件
 * @param item
 * @param index
 */
const onTextItem = (item: TextItem, index: number) => {
  // if (item.isFile) {
  //   //如果是文件类型应该弹出一个弹窗出来是否下载
  // } else {
  //   nowPath.value.push(item.name);
  //   getTextList();
  // }
};

/**
 * 页面层级发生了变化
 */
const onChangePath = (back: boolean = false) => {
  let len = nowPath.value.length;
  if (len > 1) {
    bus.emit('changeNavigation', {
      showBack: len > 1,
      title: nowPath.value[len - 1],
    });
  } else {
    // 返回到第一级
    back &&
      bus.emit('changeNavigation', {
        showBack: false,
        title: '',
      });
  }
};

/**
 * 监听到tabbar的返回事件处理
 */
const backAction = (action: any) => {
  console.log(action);
  if (action && action.name && action.name === 'TextShare' && action.type && action.type === 'pathChange') {
    let hasChangeTag = false;
    if (action.delta && action.delta < nowPath.value.length) {
      let count = action.delta;
      while (count > 0) {
        nowPath.value.pop();
        --count;
        hasChangeTag = true;
      }
    } else {
      let count = nowPath.value.length - 1;
      while (count > 0) {
        nowPath.value.pop();
        --count;
        hasChangeTag = true;
      }
    }
    if (hasChangeTag) getTextList(hasChangeTag);
  }
};
/**
 * 页面刷新
 */
const onRefresh = (action: any) => {
  console.log(action);
  if (action && action.name && action.name === 'TextShare') {
    textList.value = [];
    getTextList();
  }
};
/**
 * 点击查看文本详情
 * @param val
 */
const onShowText = (val: any) => {
  showTextModal.value = true;
  textDetail.value = val.value;
  console.log(val);
};
/**
 * 关闭文本弹窗
 */
const onHideTextModal = () => {
  showTextModal.value = false;
  textDetail.value = '';
};
onActivated(() => {
  console.log('激活了');
  getTextList();
});
onMounted(() => {
  bus.on('back', backAction);
  bus.on('refresh', onRefresh);
  getTextList();
});
onBeforeUnmount(() => {
  bus.off('back', backAction);
  bus.on('refresh', onRefresh);
});
</script>

<template>
  <div>
    <div class="folderBox">
      <div v-if="textList.length > 0" class="conetntBox">
        <TextItemVue v-for="(item, index) in textList" :key="index" :text-item="item" @on-show-text="onShowText" @click="onTextItem(item, index)" />
      </div>
      <div v-else>
        <p>暂无内容</p>
      </div>
    </div>
    <TextModal v-if="showTextModal" :text="textDetail" @close="onHideTextModal" />
  </div>
</template>

<style lang="scss" scoped>
.folderBox {
  margin: 2vw 2vw;
  .conetntBox {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
