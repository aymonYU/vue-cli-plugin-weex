const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('weex', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'weex',
    apply: require('../generator'),
    options: {}
  })

  expect(pkg.scripts.weex).toBeTruthy()
})
