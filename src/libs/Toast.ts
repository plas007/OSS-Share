import { isApp } from '@/utils/browser';
const config = isApp()
  ? {
      top: window.screen.height / 2.5,
      width: 130,
    }
  : {
      top: 50,
      width: 200,
    };
//提示信息 封装
export function Toast(msg: string, duration: number = 2000) {
  let m = document.createElement('div');
  m.innerHTML = msg;
  m.style.cssText = `
    font-size: 1rem;
    color: rgb(255, 255, 255);
    background-color: rgba(0, 0, 0, 0.6);
    padding: 10px 15px;
    margin: 0px;
    border-radius: 4px;
    position: fixed;
    top: ${config.top}px;
    left: calc(50% - 80px);
    width: ${config.width}px;
    text-align: center;
    font-family: serif;
    moz-user-select: -moz-none;
    -moz-user-select: none;
    -o-user-select:none;
    -khtml-user-select:none;
    -webkit-user-select:none;
    -ms-user-select:none;
    user-select:none;
  `;
  document.body.appendChild(m);
  setTimeout(function () {
    var d = 0.5;
    m.style.opacity = '0';
    setTimeout(function () {
      document.body.removeChild(m);
    }, d * 1000);
  }, duration);
}
