function loadUserOptions () {
    // vue.config.js
    let fileConfig, pkgConfig, resolved, resolvedFrom
  
    const context = process.cwd()
    const configPath = (
      process.env.VUE_CLI_SERVICE_CONFIG_PATH ||
      path.resolve(context, 'vue.config.js')
    )
    if (fs.existsSync(configPath)) {
        fileConfig = require(configPath)
    }
  
    pkgConfig =require(path.resolve(context, 'package.json')).vue
  
  
    if (fileConfig) {
  
      resolved = fileConfig
      resolvedFrom = 'vue.config.js'
    } else if (pkgConfig) {
      resolved = pkgConfig
      resolvedFrom = '"vue" field in package.json'
    } else {
      resolved =  {}
      resolvedFrom = 'inline options'
    }
  
    // validate options
    validate(resolved, msg => {
      error(
        `Invalid options in ${chalk.bold(resolvedFrom)}: ${msg}`
      )
    })
  
    return resolved
  }
  