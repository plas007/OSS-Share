import { defineComponent, ref, reactive, toRef, computed, inject, onActivated, onMounted } from 'vue';
import './style.scss';
import { copyToClip } from '@/utils/copyToClip.ts';
import { isiOS } from '@/utils/browser.ts';
import { formatDate } from '@/utils/formatTime.ts';
import ljRequest from '@/request/index.ts';
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
export default defineComponent({
  name: 'TextItem',
  props: {
    textItem: {
      type: Object,
      default: () => {
        return {
          isFile: true,
          name: '???',
          relativePath: '',
        };
      },
    },
    nameRows: {
      type: Number,
      default: 2,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    imgHeight: {
      type: String,
      default: '',
    },
  },
  setup(props, ctx) {
    const Toast: Function = inject('Toast') as Function;

    // const props = withDefaults(defineProps<Props>(), {
    //   textItem: () => {
    //     return {
    //       isFile: true,
    //       name: '???',
    //       relativePath: '',
    //     };
    //   },
    //   nameRows: 2,
    //   showName: true,
    //   imgHeight: '',
    // });

    // 变量
    const count = ref(0);

    // 数据
    const data = reactive<Data>({
      textList: [],
      close: false,
    });

    const textList = toRef(data, 'textList');

    /**
     * 修改展开/收起开关
     */
    const onChangeStatus = () => {
      data.close = !data.close;
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

    onMounted(() => {
      loadData();
    });
    return () => (
      <div class="textItem">
        <div class="title">
          <p>{props.textItem.name}</p>
          <p onClick={onChangeStatus}>{data.close ? '展开' : '收起'}</p>
        </div>
        {textList.value.length > 0 ? (
          <div class="inputHistory" style={{ display: data.close ? 'none' : 'inherit' }}>
            {textList.value.map((item, index) => (
              <div key={index} class="itemBox">
                <div class="tipInfoBox">
                  <p class={['platform', item.platform === 'android' ? 'android' : '']}>{item.platform || 'unknow'}</p>
                  <p class="userName">{item.userName || 'visionary'}</p>
                  <p class="uploadTime">{formatDate(item.createTime)}</p>
                </div>
                <div class="historyBox">
                  <p class="historyText">{item.value}</p>
                  <div class="optsBox">
                    <div class="copyBtn">
                      <p onClick={() => onCopyBtn(item)}>复制</p>
                    </div>
                    <div class="viewBtn">
                      <p onClick={() => onViewBtn(item)}>查看</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>暂时无数据</div>
        )}
      </div>
    );
  },
});
