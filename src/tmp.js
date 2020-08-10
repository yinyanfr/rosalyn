const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

async function asyncForEach(array, callback) {
    
    const tmp = array.map(e => callback(e))
    await Promise.all(tmp)
}


asyncForEach([1, 2, 3], async (num) => {
    await waitFor(num*100);
    console.log(num);
}).then(() => {
    console.log("ok")
})