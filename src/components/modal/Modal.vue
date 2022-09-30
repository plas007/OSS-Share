<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script setup lang="ts">
import { ref, reactive, toRef, onMounted, onBeforeUnmount } from 'vue';
interface Props {
  /**
   * 是否显示遮蔽层
   */
  mask?: boolean;
  /**
   * 弹窗所在是层数
   */
  zIndex?: number;
  /**
   * 点击遮蔽层是否关闭
   */
  maskCloseAble?: boolean;
}
const emit = defineEmits(['close']);
const props = withDefaults(defineProps<Props>(), {
  mask: true,
  maskCloseAble: true,
  zIndex: 10,
});

let backOverflow: string = '';
const onMask = (e: any) => {
  e.stopPropagation();
  e.preventDefault();
  props.maskCloseAble && emit('close');
};
onMounted(() => {
  backOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
});
onBeforeUnmount(() => {
  document.body.style.overflow = backOverflow;
});
</script>

<template>
  <div class="modal" @click="onMask">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: auto;
}
</style>
