<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script lang="ts">
export default {
  name: 'Home',
};
</script>
<script setup lang="ts">
import ljRequest from '@/request';
import bus from '@/libs/bus';
import { ref, reactive, toRef, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import FileItem from '@/components/FileItem.vue';
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
interface FileSelectItem {
  file: File;
  url: string;
  userName?: string;
  platform?: string;
  uploadTime: string;
  type?: string;
  webUrl?: string;
}
const Toast: Function = inject('Toast') as Function;
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

// 文件输入框
const fileInput = ref(null);
// 用来存储已选择的文件
const fileList = reactive<Array<FileSelectItem>>([]);
// 用来存储已上传的文件
const historyFileList = reactive<Array<FileSelectItem>>([]);
/**
 * 重置表单
 */
const reset = () => {
  onClearText();
  uploadTextLoading.value = false;
  uploadTextHistory.splice(0, uploadTextHistory.length);
  fileList.splice(0, fileList.length);
  historyFileList.splice(0, historyFileList.length);
};
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
  if (!inputText.value) {
    return Toast('请输入内容后再共享');
  }
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
        },
      )
      .finally(() => {
        uploadTextLoading.value = false;
      });
  }
};

const pushTextHistory = (textHistory: TextHistory) => {
  return new Promise((resolve, reject) => {
    try {
      uploadTextHistory.unshift({
        ...textHistory,
        uploadTime: formatDate(Number(textHistory.uploadTime)),
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

/**
 * 选择文件
 */
const onSelectFile = () => {
  (fileInput.value as unknown as HTMLInputElement).click(); //弹出选择本地文件
};

/**
 * 对象转换
 * @param item
 */
const getFileItem = (item: FileSelectItem) => {
  return {
    isFile: true,
    name: item.file.name,
    relativePath: item.url,
  };
};

/**
 * 选择文件
 */
const fileChange = (e: any) => {
  // console.log(e);
  //预览图片
  let src = window.URL.createObjectURL(e.target.files[0]);
  // console.log(src);
  // this.uploadImg.push(src);
  console.log(e.target.files[0]);
  fileList.push({
    file: e.target.files[0],
    type: e.target.files[0].type,
    url: src,
    uploadTime: formatDate(new Date().getTime()),
    platform: isiOS() ? 'iOS' : 'android',
    userName: localStorage.getItem('userName') as string,
  });
  (fileInput.value as unknown as HTMLInputElement).value = ''; // 已缓存文件，input组件清空
  //将图片文件转化成base64格式图片
  // var reader = new FileReader();
  // reader.onload = (e) => {
  //   //e.target.result  就是从本地读取的图片的base64格式,将它上传给服务器即可
  //   //使用axios的post方法上传即可
  //   // console.log(e);
  //   (fileInput.value as unknown as HTMLInputElement).value = '';
  //   console.log(fileList);
  // };
  // reader.readAsDataURL(e.target.files[0]);
};

/**
 * 文件上传
 * @param idx
 */
const uploadFile = (idx?: number) => {
  if (fileList.length === 0) {
    return Toast('请先选择文件');
  }
  let file = fileList[idx || 0].file;
  let forms = new FormData();
  forms.append('file', file);
  ljRequest
    .post({
      url: '/ossApi/uploadFile.json',
      data: forms,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res: any) => {
      console.log(res);
      historyFileList.unshift({ ...(fileList.shift() as FileSelectItem), webUrl: res.url });
      if (fileList.length > 0) {
        uploadFile();
      } else {
        Toast('上传成功');
      }
    })
    .finally(() => {});
};

/**
 * 复制web地址
 */
const onCopyLinkBtn = (item: FileSelectItem) => {
  let copyText = item.webUrl as string;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(copyText as string).then(() => {
      Toast!('复制成功');
    });
  } else {
    copyToClip(copyText);
  }
};
/**
 * 查看详情
 */
const onViewLinkBtn = (item: FileSelectItem) => {
  console.log(item);
};
/**
 * 页面刷新
 */
const onRefresh = (action: any) => {
  console.log(action);
  if (action && action.name && action.name === 'Home') {
    reset();
  }
};
onMounted(() => {
  bus.on('refresh', onRefresh);
  console.log('触发了加载');
});
onBeforeUnmount(() => {
  bus.off('refresh', onRefresh);
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
          <p class="platform" :class="item.platform === 'android' ? 'android' : ''">{{ item.platform || 'unknow' }}</p>
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
    <div class="title fileTitle">共享文件/图片视频</div>
    <div class="fileBox">
      <div class="selectBox">
        <div class="itemSelect" :class="fileList.length === 0 ? 'noneSelect' : ''">
          <div v-for="(item, index) in fileList" :key="index" class="addItem item">
            <img v-if="item.type?.startsWith('image/')" class="img" :src="item.url" />
            <div v-else class="fileSvgBox">
              <FileItem class="fileSvg" :file-item="getFileItem(item)" :name-rows="1" />
            </div>
          </div>
          <div class="addItem item">
            <input id="fileInput" ref="fileInput" type="file" name="upload" class="fileInput" @change="fileChange" />
            <svg t="1664163196667" class="fileIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15471" width="200" height="200" @click="onSelectFile">
              <path
                d="M942.792571 235.113605c-73.898726-114.998017-188.296753-194.296649-321.894449-223.296149-133.597696-28.9995-270.495335-4.199928-385.493352 69.698798-21.299633 13.699764-27.499526 42.099274-13.799762 63.398907 13.699764 21.299633 42.099274 27.499526 63.398907 13.799762 94.298374-60.698953 206.696435-80.998603 316.294545-57.199014 109.59811 23.79959 203.396492 88.898467 264.095445 183.196841 125.297839 194.796641 68.698815 455.19215-125.997827 580.489989-94.298374 60.698953-206.696435 80.998603-316.294545 57.199013-109.59811-23.79959-203.49649-88.898467-264.095445-183.19684-93.198393-144.997499-88.998465-329.594316 10.799814-470.191891 14.699746-20.699643 9.799831-49.29915-10.899813-63.998897-20.699643-14.699746-49.29915-9.799831-63.998896 10.899812-121.597903 171.397044-126.697815 396.293165-12.999776 572.990118 73.998724 114.998017 188.296753 194.296649 321.894449 223.29615 36.499371 7.899864 73.198738 11.799796 109.59811 11.799796 97.098325 0 192.196685-27.799521 275.795243-81.498594 237.295908-152.697367 306.194719-469.991894 153.597352-707.387801z"
                fill="#a3a2a2"
                p-id="15472"
                data-spm-anchor-id="a313x.7781069.0.i9"
                class="selected"
              ></path>
              <path
                d="M511.900002 321.81211c-25.399562 0-45.899208 20.499646-45.899209 45.899208v98.398303h-98.498301c-25.399562 0-45.899208 20.499646-45.899208 45.899209s20.499646 45.899208 45.899208 45.899208H466.000793v98.498302c0 25.399562 20.499646 45.899208 45.899209 45.899208s45.899208-20.499646 45.899208-45.899208V558.008037h98.498301c25.399562 0 45.899208-20.499646 45.899209-45.899209s-20.499646-45.899208-45.899209-45.899208h-98.498301v-98.498302c0-25.299564-20.599645-45.899208-45.899208-45.899208z"
                fill="#a3a2a2"
                p-id="15473"
                data-spm-anchor-id="a313x.7781069.0.i10"
                class="selected"
              ></path>
            </svg>
            <p class="iconText">添 加</p>
          </div>
        </div>
        <div class="reviewFile"></div>
        <div class="fileConfirmBtn">
          <button class="btn" @click="uploadFile()">确认上传</button>
        </div>
      </div>
      <div v-if="historyFileList.length > 0" class="fileHistory">
        <div v-for="(item, index) in historyFileList" :key="index" class="fileHistoryItem">
          <div class="tipInfoBox">
            <p class="platform" :class="item.platform === 'android' ? 'android' : ''">{{ item.platform || 'unknow' }}</p>
            <p class="userName">{{ item.userName || 'visionary' }}</p>
            <p class="uploadTime">{{ item.uploadTime }}</p>
          </div>
          <div class="fileHistoryContent">
            <FileItem class="fileItem" :file-item="getFileItem(item)" icon-size="11vw" :show-name="false"></FileItem>
            <div class="infoBox">
              <p class="infoItem">{{ item.file.name }}</p>
              <div class="optsBox">
                <div class="copyBtn">
                  <p @click="onCopyLinkBtn(item)">复制</p>
                </div>
                <div class="viewBtn">
                  <p @click="onViewLinkBtn(item)">查看</p>
                </div>
              </div>
            </div>
          </div>
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
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    font-weight: bold;
    &.fileTitle {
      margin-top: 1.5rem;
    }
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
    width: calc(100vw - 2rem);
    padding: 1rem 0;
    border-radius: 8px;
    max-height: 21.5rem;
    overflow-y: auto;
    .itemBox {
      margin: 0 0.4rem 0.8rem 0.4rem;
      background-color: white;
      padding: 0.8rem 0.4rem;
      border-radius: 4px;
      &:last-child {
        margin: 0 0.4rem;
      }
      .tipInfoBox {
        margin-top: 0.4rem;
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
  .fileBox {
    .selectBox {
      .itemSelect {
        margin-top: 0.5rem;
        background-color: #f3f3f3;
        width: calc(100vw - 2rem);
        padding: 1rem 0.5rem;
        border-radius: 8px;
        display: flex;
        flex-direction: row;
        justify-content: space-start;
        flex-wrap: wrap;
        &.noneSelect {
          justify-content: center;
        }
        $img-width: calc((100vw - 2 * $padding-lr - 4rem) / 3);
        .item {
          // border: 2px solid #a3a2a2;
          margin: 0.5rem;
          width: $img-width;
          height: $img-width;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: $cardRadius;
          &:active {
            opacity: 0.3;
          }
          .img {
            width: calc((100vw - 2 * $padding-lr - 4rem) / 3);
            height: calc((100vw - 2 * $padding-lr - 4rem) / 3);
            background-color: white;
            border-radius: 15px;
          }
          .fileSvgBox {
            display: flex;
            width: calc((100vw - 2 * $padding-lr - 4rem) / 3);
            height: calc((100vw - 2 * $padding-lr - 4rem) / 3);
            background-color: white;
            border-radius: 15px;
            .fileSvg {
              margin: auto;
              width: calc((100vw - 2 * $padding-lr - 4rem) / 3);
              height: auto;
            }
          }
        }
        .fileIcon {
          margin: 0 auto;
          width: 3.3rem;
          height: auto;
        }
        .iconText {
          margin-top: 1vw;
          text-align: center;
          color: gray;
        }
        .cameraIcon {
          width: 4.2rem;
          height: auto;
          &:active {
            opacity: 0.5;
          }
        }
        .videoIcon {
          width: 3.6rem;
          height: auto;
          &:active {
            opacity: 0.5;
          }
        }
      }
      .fileConfirmBtn {
        margin-top: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        .btn {
          margin: auto;
          width: calc(100vw - 4rem);
          background-color: #a1a9f1;
          line-height: 2.5rem;
          height: 2.5rem;
          padding: 0 1rem;
          border-radius: 3rem;
          color: white;
          font-size: 1rem;
          outline: none; //取消选中样式

          &:active {
            opacity: 0.5;
          }
        }
      }
    }
    .fileHistory {
      background-color: #f3f3f3;
      width: calc(100vw - 2 * $padding-lr);
      padding: $padding-lr;
      border-radius: $cardRadius;
      margin-top: 2rem;
      .fileHistoryItem {
        margin-bottom: 0.6rem;
        background-color: white;
        padding: 0.5rem 0;
        border-radius: 7px;
        .tipInfoBox {
          white-space: nowrap;
          margin: 0.5rem;
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
        }
        .fileHistoryContent {
          display: flex;
          flex-direction: row;
          .fileItem {
            width: 15vw;
            margin: 0;
          }

          .infoBox {
            margin: auto 0;
            padding-right: 0.5rem;
            flex: 1;
            .infoItem {
              display: inline-block;
              margin-bottom: 0.2rem;
              font-size: 0.9rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
            }
            .optsBox {
              display: flex;
              flex-direction: row;
              justify-content: right;
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
                margin-left: 0.8rem;
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
  }
}
.disable {
  opacity: 0.3 !important;
}
.fileInput {
  display: none;
}
</style>
