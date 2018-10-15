const {getOpenPage,getPages} = require('./helper')
        
module.exports = {
    pages:getPages(),
    devServer:{
        openPage: getOpenPage()
    }
}
