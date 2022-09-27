/**
 * 去掉时间戳前缀
 * @param name
 */
export const rejectName = (name: string) => {
  let res: string = '';
  try {
    let list = name.split('-');
    if (list.length > 1) {
      if (!isNaN(Number(list[0]))) {
        if (Number(list[0]) > 1000000000000) {
          res = list[1];
        } else {
          res = name;
        }
      } else {
        res = name;
      }
    } else {
      res = name;
    }
  } catch (error) {
    console.log(error);
  }
  return res;
};
