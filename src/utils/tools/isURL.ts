/**
 * 判断文本是否为URL
 * @param url string
 * @returns
 */
const isURL = (url: string) => {
  if (typeof url !== 'string' || !url) return false;
  return new RegExp(/^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/).test(url);
};

export default isURL;
