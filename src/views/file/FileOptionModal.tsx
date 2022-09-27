import FileItemVue from '@/components/FileItem.vue';
import { defineComponent, ref, toRef, reactive, onMounted, onBeforeUnmount } from 'vue';
import './model.scss';
import { rejectName } from '@/utils/rejectText';
import { downLoadFile } from '@/utils/browser';
import { Toast } from '@/libs/Toast';
import { copyToClip } from '@/utils/copyToClip';
interface FileItem {
  isFile: boolean;
  name: string;
  relativePath: string;
}
interface Option {
  label: string;
  value: string;
}
interface Data {
  optionList: Array<Option>;
}
export default defineComponent({
  name: 'FileOptionModal',
  props: {
    file: {
      type: Object,
      default: () => {
        return {};
      },
    },
    name: {
      type: Number,
      default: 2,
    },
    mask: {
      type: Boolean,
      default: true,
    },
    maskCloseAble: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: Number,
      default: 10,
    },
  },
  emits: {
    close: (val?: FileItem) => true,
  },
  setup(props, event) {
    const { emit } = event;
    const data = reactive<Data>({
      optionList: [
        { label: '下载', value: 'download' },
        { label: '复制', value: 'link' },
        { label: '删除', value: 'del' },
        { label: '移动', value: 'move' },
      ],
    });
    const optionList = toRef(data, 'optionList');
    let backOverflow = 'auto';
    const onClose = () => {
      emit('close');
    };
    /**
     * 文本复制
     */
    const copyText = (text: string) => {
      let copyText = text;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(copyText).then(() => {
          Toast!('复制成功');
        });
      } else {
        copyToClip(copyText);
      }
    };
    const onClickItem = (opt: Option, index: number) => {
      switch (opt.value) {
        case 'download':
          if (!props.file.isFile) {
            Toast('文件夹无法下载');
            break;
          }
          if (props.file.relativePath) downLoadFile(props.file.relativePath);
          else {
            Toast('下载错误');
          }
          break;
        case 'link':
          copyText(location.origin + props.file.relativePath.replaceAll('\\', '/'));
          break;
        case 'del':
          Toast('点击了删除');
          break;
        case 'move':
          Toast('点击了移动');
          break;
      }
    };
    onMounted(() => {
      backOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    });
    onBeforeUnmount(() => {
      document.body.style.overflow = backOverflow;
    });
    return () => (
      <div
        class={['modal', 'fileOptionModal']}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          props.maskCloseAble && onClose();
        }}
      >
        <div
          class={['cardBox']}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div class={['fileInfoBox']}>
            <FileItemVue fileItem={props.file as FileItem} showName={false} class="iconBox" iconSize={'2.6rem'} />
            <div class={['info']}>
              <p>{rejectName((props.file as FileItem).name)}</p>
            </div>
          </div>
          <div class="closeIcon">
            <svg-icon
              class="icon"
              name="close"
              onClick={() => {
                onClose();
              }}
            />
          </div>
          {optionList.value.map((item: Option, index: number) => {
            if (!props.file.isFile && item.value === 'download') {
              return <div></div>;
            } else {
              return (
                <div
                  class={['optionItem']}
                  key={index}
                  onClick={() => {
                    onClickItem(item, index);
                  }}
                >
                  <div class={['optionNameBox']}>
                    <p class={['optionName']}> {item.label}</p>
                  </div>
                  <div class={['optionIconBox']}>
                    <svg-icon class={['optionIcon']} name={item.value} />
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  },
});
