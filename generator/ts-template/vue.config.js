const {getOpenPage,getPages} = require('./helper.ts')
        
module.exports = {
    pages:getPages(),
    devServer:{
        openPage: getOpenPage()
    }
}
