<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script lang="ts">
export default {
  name: 'Home',
};
</script>
<script setup lang="ts">
import ljRequest from '@/request';
import { ref, reactive, toRef, onMounted, watch, inject } from 'vue';
const Toast: Function = inject('Toast') as Function;
import { copyToClip } from '@/utils/copyToClip';
import { isiOS } from '@/utils/browser';
import { formatDate } from '@/utils/formatTime';
import FileItem from '@/components/FileItem.vue';
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
      uploadTextHistory.unshift({
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
  let copyText = item.webUrl;
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
    <div class="title fileTitle">共享文件/图片视频/拍照</div>
    <div class="fileBox">
      <div class="selectBox">
        <div class="itemSelect" :class="fileList.length === 0 ? 'noneSelect' : ''">
          <div v-for="(item, index) in fileList" :key="index" class="addItem item">
            <img v-if="item.type?.startsWith('image/')" class="img" :src="item.url" />
            <div v-else class="fileSvgBox">
              <FileItem class="fileSvg" :file-item="getFileItem(item)" name-rows="1" />
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
          <!-- <svg t="1664163040361" class="fileIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11366" width="200" height="200" @click="onSelectFile">
              <path
                d="M589.9 887.6H220.8v-751h361.6v187.1c0 19.9 16.1 36 36 36h187.4v133c0 19.9 16.1 36 36 36s36-16.1 36-36v-169c0-9.6-3.8-18.7-10.6-25.5L643.9 75.1c-0.6-0.6-1.2-1.1-1.8-1.6l-0.4-0.4-1.8-1.5s-0.1-0.1-0.2-0.1l-1.8-1.2-0.6-0.3c-0.6-0.4-1.3-0.8-2-1.1-0.1 0-0.2-0.1-0.2-0.1-0.6-0.3-1.2-0.6-1.9-0.9l-0.6-0.3c-0.7-0.3-1.4-0.6-2.1-0.8-0.1 0-0.1 0-0.2-0.1-0.7-0.2-1.4-0.5-2.1-0.7-0.2-0.1-0.4-0.1-0.6-0.2-0.7-0.2-1.5-0.4-2.3-0.5-0.7-0.1-1.5-0.3-2.3-0.4-0.2 0-0.4-0.1-0.6-0.1-0.7-0.1-1.4-0.2-2.2-0.2H202.1c-29.4 0-53.3 23.9-53.3 53.3v788.4c0 29.4 23.9 53.3 53.3 53.3h387.8c19.9 0 36-16.1 36-36s-16.1-36-36-36z m64.6-599.9V187.5l100.2 100.2H654.5z"
                p-id="11367"
                data-spm-anchor-id="a313x.7781069.0.i6"
                class="selected"
                fill="#A1A9F1"
              ></path>
              <path
                d="M922.1 741h-109V631.8c0-19.9-16.1-36-36-36s-36 16.1-36 36V741h-109c-19.9 0-36 16.1-36 36s16.1 36 36 36h109v108.8c0 19.9 16.1 36 36 36s36-16.1 36-36V813h109c19.9 0 36-16.1 36-36s-16.1-36-36-36z"
                p-id="11368"
                data-spm-anchor-id="a313x.7781069.0.i5"
                class="selected"
                fill="#A1A9F1"
              ></path>
            </svg> -->
          <!-- <svg
            t="1664159380632"
            class="fileIcon"
            viewBox="0 0 1038 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="6182"
            data-spm-anchor-id="a313x.7781069.0.i0"
            width="200"
            height="200"
            @click="onSelectFile"
          >
            <path
              d="M796.76176 587.239999c-123.734255 0-224.030793 97.772785-224.030793 218.380001s100.306593 218.38 224.030793 218.38 224.081067-97.772785 224.081067-218.38-100.346812-218.38-224.081067-218.380001z m90.58361 239.585554h-70.212604v112.995739c0 7.802518-9.12975 14.126981-20.371006 14.126981s-20.371006-6.324463-20.371006-14.126981V826.825553h-69.981344c-8.405805 0-14.66994-4.021916-9.743092-8.043832 3.941478-3.227588 83.454763-109.597219 90.281966-115.067026 4.474382-3.60967 15.082186-3.549341 19.596787 0 5.027395 3.961588 84.932818 110.552424 90.493117 115.237957 4.07219 3.418629-0.432356 7.872901-9.692818 7.872901z"
              p-id="6183"
              data-spm-anchor-id="a313x.7781069.0.i2"
              class="selected"
              fill="#A1A9F1"
            ></path>
            <path
              d="M777.07448 550.891931c-90.231692 0-168.166375 51.450364-210.497045 127.122719H125.343052c-22.492567 0-40.731957 18.97339-40.731957 42.380943s18.23939 42.370888 40.731957 42.370888h411.442038c-2.242218 13.845447-4.112409 27.861825-4.112409 42.370889a258.056205 258.056205 0 0 0 63.42562 169.503662H84.611095c-44.985134 0-81.443805-37.94678-81.443805-84.751831V84.751831c0-46.805051 36.478781-84.751831 81.443805-84.751831h651.681153c44.995189 0 81.443805 37.94678 81.443805 84.751831v470.42344c-13.242159-2.342766-26.705524-4.283341-40.661573-4.28334z m-651.731428 42.380943h325.865714c22.492567 0 40.731957-18.97339 40.731957-42.380943s-18.23939-42.380943-40.731957-42.380943H125.343052c-22.492567 0-40.731957 18.97339-40.731957 42.380943s18.229336 42.380943 40.731957 42.380943z m203.669842-423.759157H125.343052c-22.492567 0-40.731957 18.97339-40.731957 42.370889s18.229336 42.390998 40.731957 42.390997h203.669842c22.502622 0 40.731957-18.97339 40.731957-42.380943s-18.23939-42.380943-40.731957-42.380943z m203.659787 169.503663H125.343052c-22.492567 0-40.731957 18.97339-40.731957 42.380943s18.23939 42.370888 40.731957 42.370888h407.329629c22.492567 0 40.731957-18.97339 40.731957-42.370888s-18.229336-42.380943-40.731957-42.380943z"
              p-id="6184"
              data-spm-anchor-id="a313x.7781069.0.i1"
              class="selected"
              fill="#A1A9F1"
            ></path>
          </svg> -->
          <!-- <svg t="1664159465819" class="cameraIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8034" width="200" height="200">
            <path
              d="M640 554.666667c0 72.533333-55.466667 128-128 128s-128-55.466667-128-128 55.466667-128 128-128 128 55.466667 128 128z m277.333333 128H810.666667V576c0-12.8-8.533333-21.333333-21.333334-21.333333s-21.333333 8.533333-21.333333 21.333333V682.666667h-106.666667c-12.8 0-21.333333 8.533333-21.333333 21.333333s8.533333 21.333333 21.333333 21.333333H768v106.666667c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-8.533333 21.333334-21.333333V725.333333h106.666666c12.8 0 21.333333-8.533333 21.333334-21.333333s-8.533333-21.333333-21.333334-21.333333zM853.333333 298.666667h-128V256c0-46.933333-38.4-85.333333-85.333333-85.333333h-256c-46.933333 0-85.333333 38.4-85.333333 85.333333v42.666667H170.666667c-46.933333 0-85.333333 38.4-85.333334 85.333333v384c0 46.933333 38.4 85.333333 85.333334 85.333333h405.333333c12.8 0 21.333333-8.533333 21.333333-21.333333s-8.533333-21.333333-21.333333-21.333333H170.666667c-25.6 0-42.666667-17.066667-42.666667-42.666667V384c0-25.6 17.066667-42.666667 42.666667-42.666667h128c25.6 0 42.666667-17.066667 42.666666-42.666666V256c0-25.6 17.066667-42.666667 42.666667-42.666667h256c25.6 0 42.666667 17.066667 42.666667 42.666667v42.666667c0 25.6 17.066667 42.666667 42.666666 42.666666h128c25.6 0 42.666667 17.066667 42.666667 42.666667v106.666667c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-8.533333 21.333334-21.333333V384c0-46.933333-38.4-85.333333-85.333334-85.333333z"
              fill="#A1A9F1"
              p-id="8035"
              data-spm-anchor-id="a313x.7781069.0.i7"
              class="selected"
            ></path>
          </svg>
          <svg t="1664159524071" class="videoIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11621" width="200" height="200">
            <path
              d="M854.528 954.368H190.976c-71.168 0-129.024-57.856-129.024-129.024v-233.472c0-11.264 9.216-20.48 20.48-20.48s20.48 9.216 20.48 20.48v233.472c0 48.64 39.424 88.064 88.064 88.064h663.552c48.64 0 88.064-39.424 88.064-88.064v-233.472c0-11.264 9.216-20.48 20.48-20.48s20.48 9.216 20.48 20.48v233.472c0 70.656-57.856 129.024-129.024 129.024z"
              fill="#A1A9F1"
              p-id="11622"
            ></path>
            <path
              d="M712.192 867.328c-100.352 0-182.272-81.92-182.272-182.272s81.92-182.272 182.272-182.272 182.272 81.92 182.272 182.272-81.92 182.272-182.272 182.272z m0-323.072c-77.824 0-141.312 63.488-141.312 141.312 0 77.824 63.488 141.312 141.312 141.312s141.312-63.488 141.312-141.312c0-77.824-63.488-141.312-141.312-141.312z"
              fill="#A1A9F1"
              p-id="11623"
            ></path>
            <path
              d="M712.192 780.8c-7.168 0-13.312-6.144-13.312-13.312v-164.352c0-7.168 6.144-13.312 13.312-13.312 7.168 0 13.312 6.144 13.312 13.312v164.352c0 7.68-6.144 13.312-13.312 13.312z"
              fill="#A1A9F1"
              p-id="11624"
            ></path>
            <path
              d="M778.752 683.008c-3.584 0-6.656-1.536-9.216-4.096l-66.56-66.56c-5.12-5.12-5.12-13.824 0-18.944s13.824-5.12 18.944 0l66.56 66.56c5.12 5.12 5.12 13.824 0 18.944-3.072 2.56-6.656 4.096-9.728 4.096z"
              fill="#A1A9F1"
              p-id="11625"
            ></path>
            <path
              d="M645.632 683.008c-3.584 0-6.656-1.536-9.216-4.096-5.12-5.12-5.12-13.824 0-18.944l66.56-66.56c5.12-5.12 13.824-5.12 18.944 0s5.12 13.824 0 18.944l-66.56 66.56c-2.56 2.56-6.144 4.096-9.728 4.096z"
              fill="#A1A9F1"
              p-id="11626"
            ></path>
            <path
              d="M512.512 824.832h-0.512c-102.4-3.584-198.144-46.08-269.824-119.808-71.68-74.24-111.104-171.52-111.104-274.432C131.072 212.992 308.224 35.84 525.824 35.84c217.6 0 394.752 177.152 394.752 394.752 0 35.328-4.608 70.144-13.824 103.936-3.072 10.752-14.336 17.408-25.088 14.336-10.752-3.072-17.408-14.336-14.336-25.088 8.192-30.208 12.288-61.44 12.288-93.184 0-195.072-158.72-353.792-353.792-353.792-195.072 0-353.792 158.72-353.792 353.792 0 191.488 150.016 347.136 341.504 353.792 11.264 0.512 19.968 9.728 19.968 20.992-1.024 10.752-10.24 19.456-20.992 19.456z"
              fill="#A1A9F1"
              p-id="11627"
            ></path>
            <path
              d="M421.376 587.264c-3.584 0-7.168-1.024-10.24-2.56-6.144-3.584-10.24-10.24-10.24-17.92V272.896c0-7.168 4.096-13.824 10.24-17.92s14.336-3.584 20.48 0L686.08 401.92c6.144 3.584 10.24 10.24 10.24 17.92s-4.096 13.824-10.24 17.92l-254.464 146.944c-3.072 1.536-6.656 2.56-10.24 2.56z m20.48-279.04v222.72L634.88 419.84 441.856 308.224z"
              fill="#A1A9F1"
              p-id="11628"
            ></path>
          </svg> -->
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
            <FileItem class="fileItem" :file-item="getFileItem(item)" :show-name="false"></FileItem>
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
      .reviewFile {
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
          .userName {
          }
          .uploadTime {
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
