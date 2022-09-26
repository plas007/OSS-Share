<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script setup lang="ts">
import { ref, reactive, toRef, computed, inject, onActivated, onMounted } from 'vue';
const Toast: Function = inject('Toast') as Function;
import { copyToClip } from '@/utils/copyToClip.ts';
import { isiOS } from '@/utils/browser';
import { formatDate } from '@/utils/formatTime';
import ljRequest from '@/request/index.ts';
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

interface Data {
  textList: Array<TextDetail>;
  close: boolean;
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
const data = reactive<Data>({
  textList: [],
  close: false,
});

const textList = toRef(data, 'textList');

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

const loadData = () => {
  ljRequest
    .get({
      url: `/ossApi/getShareDetail.json`,
      params: {
        path: encodeURI(props.textItem.relativePath),
      },
    })
    .then((res: any) => {
      if (res.data.length > 0) {
        console.log(res.data);
        textList.value = res.data;
      } else {
        // 空文件夹则....
        textList.value = [];
      }
    })
    .finally(() => {});
};
const onChangeStatus = () => {
  data.close = !data.close;
};
onMounted(() => {
  loadData();
});
onActivated(() => {
  loadData();
});
</script>

<template>
  <div class="textItem">
    <div class="title">
      <p>{{ textItem.name }}</p>
      <p @click="onChangeStatus">{{ data.close ? '展开' : '收起' }}</p>
    </div>
    <div v-if="textList.length > 0" class="inputHistory" :style="'display: ' + (data.close ? 'none' : 'inherit')">
      <div v-for="(item, index) in textList" :key="index" class="itemBox">
        <div class="tipInfoBox">
          <p class="platform" :class="item.platform === 'android' ? 'android' : ''">{{ item.platform || 'unknow' }}</p>
          <p class="userName">{{ item.userName || 'visionary' }}</p>
          <p class="uploadTime">{{ formatDate(item.createTime) }}</p>
        </div>
        <div class="historyBox">
          <p class="historyText">{{ item.value }}</p>
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
    <div v-else>暂时无数据</div>
  </div>
</template>

<style lang="scss" scoped>
.textItem {
  .title {
    width: 96vw;
    margin: 0 0 1rem 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 0.2rem;
    p {
      font-size: 1.3rem;
      font-weight: bold;
      &:last-child {
        font-size: 1.1rem;
        font-weight: 500;
        margin-right: 0.2rem;
      }
    }
  }
  .inputHistory {
    margin-top: 0.5rem;
    background-color: #f3f3f3;
    width: 96vw;
    padding: 1rem 0;
    border-radius: 8px;
    overflow-y: auto;
    .itemBox {
      margin: 0 0.8rem 0.8rem 0.8rem;
      background-color: white;
      padding: 0.8rem 0.4rem;
      border-radius: 4px;
      &:last-child {
        margin: 0 0.8rem;
      }
      .tipInfoBox {
        // margin-top: 0.4rem;
        p {
          font-size: 0.7rem;
          margin-right: 0.5rem;
          color: gray;
        }
        .platform {
          background-color: black;
          color: white;
          padding: 0 0.4rem;
          border-radius: 4px;
          &.android {
            background-color: green;
            color: white;
          }
        }
        .userName {
        }
        .uploadTime {
        }
      }
      .historyBox {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        line-height: 1.4rem;
        height: 1.4rem;
        .historyText {
          font-size: 0.85rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          line-height: 1.4rem;
          height: 1.4rem;
        }
        .optsBox {
          display: flex;
          flex-direction: row;
          text-align: right;
          .copyBtn {
            background-color: #dbdbdb;
            color: gray;
            border-radius: 3px;
            margin-left: 0.4rem;
            overflow-wrap: break-word;
            white-space: nowrap;
            &:active {
              opacity: 0.3;
            }
            p {
              padding: 0.4rem;
              font-size: 0.8rem;
              height: 0.8rem;
              line-height: 0.8rem;
            }
          }
          .viewBtn {
            background-color: #a1a9f1;
            color: white;
            border-radius: 3px;
            margin-left: 0.4rem;
            overflow-wrap: break-word;
            white-space: nowrap;
            &:active {
              opacity: 0.3;
            }
            p {
              padding: 0.4rem;
              font-size: 0.8rem;
              height: 0.8rem;
              line-height: 0.8rem;
            }
          }
        }
      }
    }
  }
}
</style>
