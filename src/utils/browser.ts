/**
 *  判断当前入口是PC端还是移动端APP端
 * @returns boolean
 */
export function isApp() {
  return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i) == null
    ? false
    : true;
}

/**
 *  判断是在微信浏览器内核打开 还是 在其它浏览器打开
 * @returns boolean
 */
export function isWeixin() {
  return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;
}

/**
 *  判断是不是企业微信打开
 * @returns boolean
 */
export function isWecom() {
  return isWeixin() && navigator.userAgent.toLowerCase().match(/wxwork/i) !== null;
}

/**
 *  判断是不是PC显示模式，条件为不是移动端且网页宽度大于830px(默认的PC端UI显示最小宽度)
 * @returns boolean
 */
export function isPCView() {
  return !isApp() && document.body.clientWidth > 830;
}

/**
 * 判断是不是内置浏览器
 * @returns
 */
export function openInWebview() {
  var ua = navigator.userAgent.toLowerCase();
  // @ts-ignore
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    // 微信浏览器判断
    return false;
    // @ts-ignore
  } else if (ua.match(/QQ/i) == 'qq') {
    // QQ浏览器判断
    return false;
    // @ts-ignore
  } else if (ua.match(/WeiBo/i) == 'weibo') {
    return false;
  } else {
    if (ua.match(/Android/i) != null) {
      return ua.match(/browser/i) == null;
    } else if (ua.match(/iPhone/i) != null) {
      return ua.match(/safari/i) == null;
    } else {
      return ua.match(/macintosh/i) == null && ua.match(/windows/i) == null;
    }
  }
}

/**
 * 点击下载方法
 */
export function downLoadFile(url: string, fileName: string = '' + new Date().getTime()) {
  let e = new MouseEvent('click'); // 模拟点击事件
  let a = document.getElementById('download') ?? document.createElement('a');
  a.setAttribute('download', fileName); // 给a设置download属性
  a.setAttribute('href', url); // 设置下载地址
  a.dispatchEvent(e); // 触发点击事件
}
