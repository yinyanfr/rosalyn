const asyncForEach = async (array: any[], callback: (e: any, i: number) => void): Promise<void> => {
    const tmp = array.map((e, i) => callback(e, i))
    await Promise.all(tmp)
}

export default asyncForEach
