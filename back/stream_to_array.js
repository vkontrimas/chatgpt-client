module.exports = async (stream) => {
  const array = []
  for await (const obj of stream) {
    array.push(obj)
  }
  return array
}
