<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script setup lang="ts">
import { ref, reactive, toRef, computed, onMounted, inject } from 'vue';
const Toast: Function = inject('Toast') as Function;
import { copyToClip } from '@/utils/copyToClip';
import { isiOS } from '@/utils/browser';
import { formatDate } from '@/utils/formatTime';
const emits = defineEmits(['click']);
interface TextItem {
  isFile: boolean;
  name: string;
  relativePath: string;
}
interface Props {
  textItem: TextItem;
  nameRows?: number;
  showName?: boolean;
  imgHeight?: string;
}

interface TextDetail {
  createTime: number;
  value: string;
  userName: string;
  userAgent: string;
  platform: string;
  
}

const props = withDefaults(defineProps<Props>(), {
  textItem: () => {
    return {
      isFile: true,
      name: '???',
      relativePath: '',
    };
  },
  nameRows: 2,
  showName: true,
  imgHeight: '',
});

// 变量
const count = ref(0);

// 数据
const data = reactive<Array<TextDetail>>([]);

/**
 * 文件类型
 */
const fileType = computed(() => {
  let ext = 'folder';
  if (props.textItem.isFile) {
    ext = props.textItem.name.substring(props.textItem.name.lastIndexOf('.')).toLowerCase();
  }
  return ext;
});

/**
 * 去掉时间戳前缀
 * @param name
 */
const rejectName = (name: string) => {
  let res: string = '';
  try {
    let list = name.split('-');
    if (list.length > 1) {
      if (!isNaN(Number(list[0]))) {
        if (Number(list[0]) > 1000000000000) {
          res = list[1];
        } else {
          res = name;
        }
      } else {
        res = name;
      }
    } else {
      res = name;
    }
  } catch (error) {
    console.log(error);
  }
  return res;
};

const onClick = (e: any) => {
  emits('click', e);
};

/**
 * 文本复制
 */
const onCopyBtn = (item: TextDetail) => {
  let copyText = item.value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(copyText).then(() => {
      Toast!('复制成功');
    });
  } else {
    copyToClip(copyText);
  }
};

/**
 * 点击查看文本内容
 */
const onViewBtn = (item: TextDetail) => {
  Toast!('点击查看');
};
</script>

<template>
  <div class="textItem" @click="onClick">
    <div class="title">{{}}</div>
    <div v-if="data.length > 0" class="inputHistory">
      <div v-for="(item, index) in data" :key="index" class="itemBox">
        <div class="tipInfoBox">
          <p class="platform" :class="item.platform === 'android' ? 'android' : ''">{{ item.platform || 'unknow' }}</p>
          <p class="userName">{{ item.userName || 'visionary' }}</p>
          <p class="uploadTime">{{ formatDate(item.createTime) }}</p>
        </div>
        <div class="historyBox">
          <p class="historyText">{{ item.text }}</p>
          <div class="optsBox">
            <div class="copyBtn">
              <p @click="onCopyBtn(item)">复制</p>
            </div>
            <div class="viewBtn">
              <p @click="onViewBtn(item)">查看</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>暂时无数据</div>
  </div>
</template>

<style lang="scss" scoped>
.textItem {
  .title {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    font-weight: bold;
  }
}
</style>
