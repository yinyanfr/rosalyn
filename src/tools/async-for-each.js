const asyncForEach = async (array, callback) => {
    const tmp = array.map((e, i) => callback(e, i))
    await Promise.all(tmp)
}

module.exports = asyncForEach
