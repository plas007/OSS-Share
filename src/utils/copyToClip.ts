import { Toast } from '@/components/lib/Toast';

/**
 * 复制多行内容到粘贴板
 * content : 需要复制的内容
 * message : 复制完后的提示，不传则默认提示"复制成功"
 */
export const copyToClip = (content: string) => {
  let textarea = document.getElementById('copyArea');
  if (!textarea) {
    textarea = createCopyBox('copyArea');
  }
  // @ts-ignore
  textarea.value = content;
  // @ts-ignore
  textarea.select();
  document.execCommand('copy');
  Toast!('复制成功');
};

/**
 * 创建复制元素
 */
const createCopyBox = (id: string) => {
  const elm = document.createElement('textarea');
  elm.setAttribute('id', id);
  elm.style.cssText = `
    position: fixed;
    opacity: 0;
    left: -100vw;
  `;
  document.body.appendChild(elm);
  return document.getElementById(id);
};
