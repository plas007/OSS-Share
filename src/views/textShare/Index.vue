<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script lang="ts">
export default {
  name: 'TextShare',
};
</script>
<script setup lang="ts">
import { ref, reactive, toRef, onMounted, onBeforeUnmount } from 'vue';
import ljRequest from '../../request';
import bus from '@/libs/bus';
import FileItemVue from '@/components/FileItem.vue';
interface Props {
  msg?: string;
  labels?: string[];
}
interface FileItem {
  isFile: boolean;
  name: string;
  relativePath: string;
}
interface Data {
  fileList: Array<FileItem>;
  nowPath: Array<string>;
}

withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
});

const data = reactive<Data>({
  fileList: [],
  nowPath: ['upload'],
});
const fileList = toRef(data, 'fileList');
const nowPath = toRef(data, 'nowPath');

const getFileList = (path: string = '', back: boolean = false) => {
  ljRequest
    .get({
      url: `/ossApi/getAllFiles.json`,
      params: {
        path,
      },
    })
    .then((res: any) => {
      if (res.data.length > 0) {
        console.log(res.data);
        fileList.value = res.data;
      } else {
        // 空文件夹则....
        fileList.value = [];
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
const onFileItem = (item: FileItem, index: number) => {
  if (item.isFile) {
    //如果是文件类型应该弹出一个弹窗出来是否下载
  } else {
    nowPath.value.push(item.name);
    getFileList(nowPath.value.join('\\'));
  }
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
    if (hasChangeTag) getFileList(nowPath.value.join('\\'), hasChangeTag);
  }
};
onMounted(() => {
  bus.on('back', backAction);
  getFileList(nowPath.value.join('\\'));
});
onBeforeUnmount(() => {
  bus.off('back', backAction);
});
</script>

<template>
  <div class="folderBox">
    <div v-if="fileList.length > 0" class="conetntBox">
      <FileItemVue v-for="(item, index) in fileList" :key="index" :file-item="item" @click="onFileItem(item, index)" />
    </div>
    <div v-else>
      <p>暂无内容</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.folderBox {
  margin: 2vw 5vw;
  .conetntBox {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
