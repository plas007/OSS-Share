<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script lang="ts">
export default {
  name: 'Upload',
};
</script>
<script setup lang="ts">
import ljRequest from '@/request';
import { ref, reactive, toRef, onMounted, watch, inject } from 'vue';
const Toast: Function = inject('Toast') as Function;
import { copyToClip } from '@/utils/copyToClip';
import { isiOS } from '@/utils/browser';
import { formatDate } from '@/utils/formatTime';
interface TextHistory {
  userName?: string;
  platform?: string;
  text: string;
  uploadTime: string;
}
interface Props {
  msg?: string;
  labels?: string[];
}

withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
});

// 变量
const count = ref(0);

const data = reactive({
  color: 'black',
});

const color = toRef(data, 'color');
// 输入的文本内容
const inputText = ref<string>('');
// 输入框的ref
const input = ref(null);
const oldHeight = ref<string>('');
// 上传文本接口加载中
const uploadTextLoading = ref<boolean>(false);

const uploadTextHistory = reactive<Array<TextHistory>>([]);

/**
 * 监听输入框本文内容的变化
 */
watch([inputText], ([inputText], [prevInputText]) => {
  // console.log('newText', inputText, 'oldText', prevInputText);
  setHeight(input.value);
});

// /**
//  * 输入框触发事件
//  */
// const inputInfo = (e: any) => {
//   console.log(inputText.value, e);
// };

const setHeight = (refElm: any, height: string = '') => {
  // console.log(height, oldHeight.value, refElm);
  const maxHeight = 220;
  if (!oldHeight.value) {
    oldHeight.value = refElm.style.height;
  }
  if (height || inputText.value.length === 0) {
    refElm.style.height = height;
    return;
  }
  if (refElm.scrollHeight < maxHeight) {
    refElm.style.height = refElm.scrollHeight + 'px';
  } else {
    refElm.style.height = maxHeight + 'px';
  }
};

/**
 * 清空输入框
 */
const onClearText = () => {
  inputText.value = '';
  if (oldHeight.value) {
    setHeight(input.value, oldHeight.value);
  }
};

/**
 * 上传输入内容
 */
const onShareText = () => {
  if (!uploadTextLoading.value) {
    uploadTextLoading.value = true;
    ljRequest
      .post({
        url: '/ossApi/shareText.json',
        data: {
          text: inputText.value,
        },
      })
      .then(
        (res) => {
          console.log(res);
          pushTextHistory({
            text: inputText.value as string,
            uploadTime: new Date().getTime().toString(),
          });
          onClearText();
          Toast('共享成功');
        },
        (err) => {
          Toast('系统错误');
        }
      )
      .finally(() => {
        uploadTextLoading.value = false;
      });
  }
};

const pushTextHistory = (textHistory: TextHistory) => {
  return new Promise((resolve, reject) => {
    let time = new Date(Number(textHistory.uploadTime));
    try {
      uploadTextHistory.push({
        ...textHistory,
        uploadTime: formatDate(time),
        platform: isiOS() ? 'iOS' : 'android',
        userName: localStorage.getItem('userName') as string,
      });
      resolve({
        msg: 'ok',
      });
    } catch (err) {
      reject(err);
    }
  });
};
/**
 * 文本复制
 */
const onCopyBtn = (item: TextHistory) => {
  let copyText = item.text;
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
const onViewBtn = (item: TextHistory) => {
  Toast!('点击查看');
};

onMounted(() => {
  console.log('触发了加载');
});
</script>

<template>
  <div class="uploadBox">
    <div class="title">文本内容共享</div>
    <div class="inputBox">
      <div class="textareaBox">
        <textarea id="pasteInput" ref="input" v-model="inputText" class="textarea" placeholder="请输入..." />
      </div>
      <div class="inputLength">
        <p>
          已输入
          <span>{{ inputText.length }}</span>
          字
        </p>
      </div>
      <div class="textBtnBox">
        <div class="btnBox">
          <button class="btn cancel" @click="onClearText">清空输入</button>
        </div>
        <div class="btnBox">
          <button class="btn" :class="uploadTextLoading ? 'disable' : ''" :disabled="uploadTextLoading" @click="onShareText">共享文本</button>
        </div>
      </div>
    </div>
    <div v-if="uploadTextHistory.length > 0" class="inputHistory">
      <div v-for="(item, index) in uploadTextHistory" :key="index" class="itemBox">
        <div class="tipInfoBox">
          <p class="platform">{{ item.platform || 'unknow' }}</p>
          <p class="userName">{{ item.userName || 'visionary' }}</p>
          <p class="uploadTime">{{ item.uploadTime }}</p>
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
    <div class="title">共享文件/图片视频/拍照</div>
    <div class="fileBox">
      <div class="selectBox">
        <div class="itemSelect"></div>
        <div class="reviewFile"></div>
        <div class="fileConfirmBtn">
          <button>确认上传</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$padding-lr: 1rem;
$cardRadius: 8px;
.uploadBox {
  padding: 0 $padding-lr;
  font-size: 1.4rem;
  .title {
    margin: 2rem 0 1rem 0;
    font-size: 1.3rem;
    font-weight: bold;
  }
  .inputBox {
    background-color: #f3f3f3;
    width: calc(100vw - 2 * $padding-lr);
    padding: $padding-lr;
    border-radius: $cardRadius;
    .textareaBox {
      .textarea {
        background-color: #f3f3f3;
        width: 100%;
        border: none;
        resize: none; //取消调整
        outline: none; //取消选中样式
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
          display: none; /* Chrome Safari */
        }
      }
    }
    .inputLength {
      margin: 0.5rem 0 1rem;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      color: gray;
      p {
        font-size: 0.85rem;
      }
      span {
        margin: 0.1rem;
        font-size: 0.85rem;
      }
    }
    .textBtnBox {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .btnBox {
        flex: 1;
        display: flex;
        flex-direction: column;
        .btn {
          margin: auto;
          width: calc(50vw - 4 * $padding-lr);
          background-color: #a1a9f1;
          line-height: 2.5rem;
          height: 2.5rem;
          padding: 0 1rem;
          border-radius: 3rem;
          color: white;
          font-size: 0.85rem;
          outline: none; //取消选中样式

          &:active {
            opacity: 0.5;
          }
        }
        .cancel {
          background-color: #dbdbdb;
          color: rgb(126, 123, 123);
          &:active {
            opacity: 0.5;
          }
        }
      }
    }
  }
  .inputHistory {
    margin-top: 0.5rem;
    background-color: #f3f3f3;
    width: calc(100vw - 2 * $padding-lr);
    padding: $padding-lr 0;
    border-radius: $cardRadius;
    .itemBox {
      margin: 0 0.4rem 0.8rem 0.4rem;
      background-color: white;
      padding: 0.8rem 0.4rem;
      border-radius: 4px;
      &:last-child {
        margin: 0 0.4rem;
      }
      .tipInfoBox {
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
.disable {
  opacity: 0.3 !important;
}
</style>
