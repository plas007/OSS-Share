<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script setup lang="ts">
import { ref, reactive, toRef, computed } from 'vue';
const emits = defineEmits(['click', 'clickOpts']);
interface FileItem {
  isFile: boolean;
  name: string;
  relativePath: string;
}
interface Props {
  fileItem: FileItem;
  nameRows?: number;
  showName?: boolean;
  imgHeight?: string;
  iconSize?: string;
  showOpts?: boolean;
  opts?: Array<Record<string, any>>;
}

const props = withDefaults(defineProps<Props>(), {
  fileItem: () => {
    return {
      isFile: true,
      name: '???',
      relativePath: '',
    };
  },
  nameRows: 2,
  showName: true,
  imgHeight: '',
  iconSize: '',
  showOpts: false,
  opts: () => [
    { label: '下载', value: 'download' },
    { label: '复制', value: 'copy' },
    { label: '删除', value: 'del' },
    { label: '移动', value: 'move' },
  ],
});

// 变量
const count = ref(0);

const data = reactive({
  color: 'black',
});

/**
 * 文件类型
 */
const fileType = computed(() => {
  let ext = 'folder';
  if (props.fileItem.isFile) {
    ext = props.fileItem.name.substring(props.fileItem.name.lastIndexOf('.')).toLowerCase();
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
/**
 * 点击整个组件(除操作符外)
 * @param e
 */
const onClick = (e: any) => {
  emits('click', e);
};
/**
 * 点击操作符
 * @param e
 */
const onOpts = (e: any) => {
  emits('clickOpts', e);
};
</script>

<template>
  <div class="folderItem" @click="onClick">
    <svg-icon v-if="fileType === 'folder'" class="uniIcon" :style="iconSize ? 'font-size: ' + iconSize : ''" name="folder" />
    <img
      v-else-if="['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(fileType)"
      :src="fileItem.relativePath"
      class="folderIcon"
      :style="'max-height:' + (imgHeight ? imgHeight : '6.8rem') + ';'"
    />
    <svg-icon v-else-if="fileType === '.txt'" class="uniIcon" :style="iconSize ? 'font-size: ' + iconSize : ''" name="txt" />
    <svg-icon v-else-if="fileType === '.pdf'" class="uniIcon" :style="iconSize ? 'font-size: ' + iconSize : ''" name="pdf" />
    <div v-else-if="['.mp4', '.mov'].includes(fileType)">
      <svg t="1664157700548" class="folderIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9705" width="200" height="200">
        <path
          d="M661.944889 82.289778H146.289778a36.679111 36.679111 0 0 0-36.579556 36.565333V923.448889a36.679111 36.679111 0 0 0 36.579556 36.565333h731.420444a36.679111 36.679111 0 0 0 36.579556-36.565333v-588.8L661.944889 82.289778z"
          fill="#A1A9F1"
          p-id="9706"
          data-spm-anchor-id="a313x.7781069.0.i8"
          class="selected"
        ></path>
        <text x="150" y="260" font-size="190px" font-weight="900" text-anchor="start" fill="#FFFFFF" data-v-98f2bf80="" style="font-size: 190px">{{ fileType.substring(1) }}</text>
        <path
          d="M615.210667 398.222222c20.437333 0 37.148444 20.437333 39.011555 42.737778v284.302222C654.222222 749.411556 637.496889 768 617.059556 768H278.940444C258.503111 768 241.777778 749.411556 241.777778 725.262222v-284.302222C241.777778 416.810667 258.503111 398.222222 278.940444 398.222222z m-40.874667 89.187556h-105.898667v42.737778h105.898667v-42.737778z"
          fill="#FFFFFF"
          p-id="9707"
        ></path>
        <path
          d="M768.796444 478.805333c-9.585778-7.210667-21.091556-10.808889-32.597333-9.016889l-93.966222 19.825778C624.981333 493.226667 611.555556 511.246222 611.555556 531.072v104.533333c0 19.825778 13.425778 37.859556 30.677333 41.457778L736.199111 696.888889h7.68c9.585778 0 17.251556-3.598222 24.917333-9.016889 9.585778-7.210667 13.425778-19.825778 13.425778-32.426667V511.232c0-12.615111-3.84-23.424-13.425778-32.440889z"
          fill="#FFFFFF"
          opacity=".8"
          p-id="9708"
        ></path>
        <path d="M661.944889 298.055111a36.679111 36.679111 0 0 0 36.565333 36.579556h215.779556L661.944889 82.289778v215.765333z" fill="#B6C6FF" p-id="9709"></path>
      </svg>
    </div>
    <div v-else class="otherObx">
      <svg-icon v-if="fileType.indexOf('.') === -1" class="uniIcon" :style="iconSize ? 'font-size: ' + iconSize : ''" name="unknown" />
      <svg v-else class="folderIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M192 0h448.1536L960 320v576c0 70.6944-57.3056 128-128 128H192C121.3056 1024 64 966.6944 64 896V128C64 57.3056 121.3056 0 192 0z"
          fill="#f3f3f3"
          p-id="11098"
          data-spm-anchor-id="a313x.7781069.0.i48"
          class="selected"
        ></path>
        <text x="120" y="450" font-size="220px" style="font-size: 220px" font-weight="900" text-anchor="start" fill="#A1A9F1">{{ fileType.substring(1) }}</text>
        <path d="M640 0l320 320H768c-70.6944 0-128-57.3056-128-128V0z" fill="#e6e5e5" p-id="11100" data-spm-anchor-id="a313x.7781069.0.i46" class=""></path>
        <path
          d="M782.677333 679.594667H342.698667c-15.701333 0-28.330667-12.8-28.330667-28.330667v-5.290667c0-15.701333 12.8-28.330667 28.330667-28.330666h439.978666c15.701333 0 28.330667 12.8 28.330667 28.330666v5.290667c0 15.530667-12.629333 28.330667-28.330667 28.330667z"
          fill="#A1A9F1"
          p-id="9720"
          data-spm-anchor-id="a313x.7781069.0.i36"
          class=""
        ></path>
        <path
          d="M602.282667 810.154667H342.698667c-15.701333 0-28.330667-12.8-28.330667-28.330667V776.533333c0-15.701333 12.8-28.330667 28.330667-28.330666h259.584c15.701333 0 28.330667 12.8 28.330666 28.330666v5.290667c0 15.530667-12.629333 28.330667-28.330666 28.330667z"
          fill="#A1A9F1"
          p-id="9721"
          data-spm-anchor-id="a313x.7781069.0.i37"
          class=""
        ></path>
      </svg>
    </div>

    <div v-if="showName" class="fileName">
      <p :style="'-webkit-line-clamp:' + nameRows + ';'">{{ rejectName(fileItem.name) }}</p>
    </div>
    <div v-if="showOpts">
      <svg t="1664254406410" class="optIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2243" width="200" height="200" @click.stop="onOpts">
        <path d="M819.2 511.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z" fill="#515151" p-id="2244"></path>
        <path d="M512 511.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z" fill="#515151" p-id="2245"></path>
        <path d="M204.8 511.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z" fill="#515151" p-id="2246"></path>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.folderItem {
  margin-bottom: 5vw;
  width: 33.3%;
  height: auto;
  text-align: center;
  font-size: 0.8rem;
  &:active {
    opacity: 0.5;
  }
  .uniIcon {
    font-size: 5rem;
  }
  .folderIcon {
    width: 68%;
    height: auto;
  }
  .optIcon {
    width: 1rem;
    height: auto;
    background: #e6e6e6;
    padding: 0.1rem 0.2rem;
    border-radius: 4px;
  }
  .fileName {
    display: flex;
    p {
      width: 80%;
      margin: auto;
      font-size: 0.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
    }
  }
  .otherObx {
    overflow: hidden;
  }
}
</style>
