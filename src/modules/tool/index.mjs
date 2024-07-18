/**
 * 延迟函数
 * @param {number} ms
 * @returns
 */
const delay = (ms) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(ms);
        }, ms);
    });

export { delay };