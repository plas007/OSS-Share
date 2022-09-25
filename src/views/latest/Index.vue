<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script lang="ts">
export default {
  name: 'Latest',
};
</script>
<script setup lang="ts">
import { ref, reactive, toRef, onMounted, onBeforeUnmount } from 'vue';
import ljRequest from '../../request';
import bus from '@/libs/bus';
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
  if (action && action.name && action.name === 'Latest' && action.type && action.type === 'pathChange') {
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
      <div v-for="(item, index) in fileList" :key="index" class="folderItem" @click="onFileItem(item, index)">
        <svg t="1663852047589" class="folderIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11703">
          <path
            d="M885.333333 168.533333h-448L341.333333 110.933333c-6.4-4.266667-14.933333-6.4-21.333333-6.4H134.4c-51.2 0-93.866667 42.666667-93.866667 93.866667v622.933333c0 51.2 42.666667 93.866667 93.866667 93.866667h750.933333c51.2 0 93.866667-42.666667 93.866667-93.866667V262.4c0-51.2-40.533333-93.866667-93.866667-93.866667z m-738.133333 21.333334h160l96 57.6c6.4 4.266667 14.933333 6.4 21.333333 6.4h445.866667c12.8 0 21.333333 8.533333 21.333333 21.333333V298.666667c0 12.8-8.533333 21.333333-21.333333 21.333333h-725.333333c-12.8 0-21.333333-8.533333-21.333334-21.333333V211.2c2.133333-10.666667 12.8-21.333333 23.466667-21.333333z"
            fill="#A1A9F1"
            p-id="11704"
            data-spm-anchor-id="a313x.7781069.0.i0"
            class="selected"
          ></path>
        </svg>
        <div>
          {{ item.name }}
        </div>
      </div>
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
  .folderItem {
    margin-bottom: 5vw;
    width: 33.3%;
    height: auto;
    text-align: center;
    font-size: 0.8rem;
    &:active {
      opacity: 0.5;
    }
    .folderIcon {
      width: 68%;
      height: auto;
    }
  }
}
</style>
