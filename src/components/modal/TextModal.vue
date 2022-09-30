<!-- <script setup> 中的代码会在每次组件实例被创建的时候执行。 -->
<script setup lang="ts">
import { Toast } from '@/libs/Toast';
import { ref, reactive, toRef } from 'vue';
import Modal from './Modal.vue';
interface Props {
  text?: string;
}
const emit = defineEmits(['close']);
withDefaults(defineProps<Props>(), {
  text: '',
});
const onClose = () => {
  emit('close');
};
const onClick = (e: any) => {
  // e.preventDefault();
  // e.stopPropagation();
};
</script>

<template>
  <Modal class="textModal" @close="onClose">
    <p class="detail" @click="onClick">{{ text }}</p>
  </Modal>
</template>

<style lang="scss" scoped>
.textModal {
  display: flex;
  flex-direction: column;
  // justify-content: center;
  background-color: white;
  padding: 1rem;
  padding-bottom: calc(1rem + constant(safe-area-inset-bottom));
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  .detail {
    margin: auto;
    text-align: left;
    word-break: break-word;
  }
}
</style>
