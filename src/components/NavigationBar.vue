<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script setup lang="ts">
import { ref, reactive, toRef } from 'vue';
interface Props {
  title?: string;
  labels?: string[];
  showBack?: boolean;
  showRefresh?: boolean;
}
const emits = defineEmits(['back', 'refresh']);
const props = withDefaults(defineProps<Props>(), {
  title: '返回',
  labels: () => ['one', 'two'],
  showBack: true,
  showRefresh: false,
});

// 变量
const count = ref(0);

const data = reactive({
  color: 'black',
});

const onBack = () => {
  console.log('发送返回事件');
  props.showBack && emits('back');
};
const onRefresh = () => {
  console.log('发送刷新事件');
  props.showRefresh && emits('refresh');
};
</script>

<template>
  <div class="navigationBar">
    <div class="left">
      <div v-if="showBack" class="flexBox" @click="onBack">
        <svg t="1663901186323" class="backIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12988">
          <path
            d="M393.390114 512.023536l347.948667-336.348468c20.50808-19.85828 20.50808-51.997258 0-71.792093-20.507056-19.826558-53.778834-19.826558-74.28589 0L281.990954 476.135164c-20.476357 19.826558-20.476357 51.981908 0 71.746044l385.061936 372.236839c10.285251 9.91379 23.728424 14.869662 37.173644 14.869662 13.446243 0 26.889417-4.956895 37.112246-14.901385 20.50808-19.826558 20.50808-51.919487 0-71.746044L393.390114 512.023536"
            p-id="12989"
            fill="#000004"
          ></path>
        </svg>
      </div>
      <div v-else-if="showRefresh" class="flexBox" @click="onRefresh">
        <svg t="1664209480995" class="refreshIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2544" width="200" height="200">
          <path
            d="M974.5 374.5c-18.4-12.9-44.1-8.5-57.1 10l-33 47.1C846.6 232.8 671.8 81.9 462.2 81.9 225 81.9 32.1 274.9 32.1 512S225 942.1 462.2 942.1c99.4 0 196.4-34.7 273-97.8 17.5-14.4 20-40.2 5.6-57.7s-40.2-20-57.7-5.6c-62 51-140.5 79.1-221 79.1C270.2 860.2 114 704 114 512s156.2-348.2 348.2-348.2c172.9 0 316.3 126.7 343.2 292.1l-59.1-41.5c-18.4-12.9-44.1-8.5-57.1 10-12.9 18.4-8.5 44.1 10 57.1l134.1 94.2c18.4 12.9 44.1 8.5 57.1-10l94.2-134.1c12.9-18.5 8.4-44.1-10.1-57.1z"
            p-id="2545"
          ></path>
        </svg>
      </div>
      <div class="flexBox">
        <p class="title">{{ title }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigationBar {
  padding: 0 5vw;
  display: flex;
  flex-direction: row;
  background-color: white;
  .left {
    display: flex;
    flex-direction: row;
    &:active {
      opacity: 0.5;
    }
  }
  .flexBox {
    display: flex;
    flex-direction: column;
    &:active {
      opacity: 0.5;
    }
  }
  .backIcon {
    margin: auto;
    width: 1rem;
    height: 1rem;
  }
  .refreshIcon {
    margin: auto;
    width: 1rem;
    height: 1rem;
  }
  .title {
    margin: auto 1.5vw;
    height: 1rem;
    line-height: 1rem;
    color: #000004;
  }
}
</style>
