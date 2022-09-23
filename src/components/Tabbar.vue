<script setup lang="ts">
import { ref, reactive } from 'vue';
const emits = defineEmits(['change']);
interface Tabbar {
  id: number;
  name: string;
  path: string;
  icon: string;
}
interface Props {
  tabbarList: Array<Tabbar>;
}

withDefaults(defineProps<Props>(), {
  tabbarList: () => [
    {
      id: 1,
      name: '文件',
      path: 'home',
      icon: '',
    },
    {
      id: 2,
      name: '上传',
      path: 'upload',
      icon: '',
    },
  ],
});
const selected = ref<number>(0);

/**
 * 点击了tabbar栏
 * @param idx
 * @param item
 */
const onTabItem = (idx: number, item: Tabbar) => {
  if (selected.value === idx) {
    return;
  } else {
    selected.value = idx;
    emits('change', { ...item, listIdx: idx });
  }
};
</script>

<template>
  <div class="barBox">
    <div v-for="(item, index) in tabbarList" :key="index" class="tabItemBox" :class="selected === index ? 'selected' : ''" @click="onTabItem(index, item)">
      <div class="tabItem">{{ item.name }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.barBox {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: #f9f9f9;
  .tabItemBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: #4c4c4e;
    &.selected {
      background-color: #e6e6e8;
      color: #202125;
    }
    .tabItem {
      margin: auto;
    }
  }
}
</style>
