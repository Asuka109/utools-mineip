const os = require('os')
const got = require('got')

const getInternalAddress = () => {
  for (const dev of Object.values(os.networkInterfaces())) {
    const result = dev.find(i => i.family === 'IPv4' && i.address !== '127.0.0.1' && !i.internal)
    if (result) return result.address
  }
}
const getExternalAddress = async () => got('http://ip-api.com/json/?fields=status,query', { responseType: 'json' }).then(resp => resp.body.query)
const getDomesticAddress = async () => got('http://pv.sohu.com/cityjson').then(resp => resp.body.match(/"cip":\s*"(.+?)"/)[1])

const queryGroup = {
  '局域网': getInternalAddress,
  '国内网': getDomesticAddress,
  '国外网': getExternalAddress
}

window.exports = {
  "ip": {
    mode: "list",
    args: {
      enter: async (action, callbackSetList) => {
        const listModel = []
        for (const title in queryGroup) {
          const description = await queryGroup[title]()
          listModel.push({ title, description })
          callbackSetList(listModel)
        }
      },
      select: (action, itemData, callbackSetList) => {
        window.utools.hideMainWindow()
        utools.copyText(itemData.description)
        utools.showNotification(`已复制${itemData.title}地址: ${itemData.description}`)
        window.utools.outPlugin()
      },
    }
  }
}